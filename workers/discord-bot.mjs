import { createHash } from "crypto";
import { fileURLToPath } from "url";

import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
} from "discord.js";

export const discordWorkerIntents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
];

const heartbeatIntervalMs = 60_000;
const maxMessageLength = 20_000;

export function readDiscordWorkerConfig(env = process.env) {
  const token = env.DISCORD_BOT_TOKEN?.trim();
  const appBaseUrl = env.APP_BASE_URL?.trim() || env.NEXT_PUBLIC_APP_URL?.trim();
  const integrationSecret = env.INTERNAL_INTEGRATION_SECRET?.trim();

  const missing = [];
  if (!token) {
    missing.push("DISCORD_BOT_TOKEN");
  }
  if (!appBaseUrl) {
    missing.push("APP_BASE_URL");
  }
  if (!integrationSecret) {
    missing.push("INTERNAL_INTEGRATION_SECRET");
  }

  return {
    token,
    appBaseUrl,
    integrationSecret,
    missing,
  };
}

export function createDiscordClient() {
  return new Client({ intents: discordWorkerIntents });
}

export function normalizeDiscordGatewayMessage(message) {
  if (message?.author?.bot) {
    logDiagnostic("discord_message_skipped_bot");
    return { skipped: true, reason: "bot_message" };
  }

  if (!message?.guildId) {
    return { skipped: true, reason: "direct_message" };
  }

  const text = sanitizeDiscordText(message.content);
  if (!text) {
    return { skipped: true, reason: "empty_message" };
  }

  const externalId = hashDiscordIdentifier(message.id);
  const channelId = hashDiscordIdentifier(message.channelId);
  const guildId = hashDiscordIdentifier(message.guildId);
  const senderId = hashDiscordIdentifier(message.author.id);

  return {
    skipped: false,
    message: {
      id: `discord:${externalId}`,
      externalId,
      source: "discord",
      channelId,
      conversationId: channelId,
      senderId,
      senderName: sanitizeDiscordText(message.author.username, 240),
      text,
      timestamp: normalizeDiscordTimestamp(message.createdAt, message.createdTimestamp),
      metadata: { guildId, channelType: "guild_text" },
    },
  };
}

export async function submitNormalizedMessage({
  appBaseUrl,
  integrationSecret,
  message,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(`${appBaseUrl}/api/integrations/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-agenticops-integration-secret": integrationSecret,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Agentic Ops processing endpoint returned ${response.status}`);
  }

  logDiagnostic("discord_internal_api_success", {
    externalId: message.externalId,
  });
}

export async function submitDiscordHeartbeat({
  appBaseUrl,
  integrationSecret,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(`${appBaseUrl}/api/integrations/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-agenticops-integration-secret": integrationSecret,
    },
    body: JSON.stringify({ type: "heartbeat", provider: "discord" }),
  });

  if (!response.ok) {
    throw new Error(`Agentic Ops heartbeat endpoint returned ${response.status}`);
  }
}

export function registerDiscordWorkerHandlers(client, config, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const seenMessageIds = options.seenMessageIds ?? new Set();
  let heartbeatTimer;

  client.once("ready", async () => {
    logDiagnostic("discord_gateway_ready");
    await client.application?.commands.set(createDiscordCommands());
    await safeHeartbeat(config, fetchImpl);
    heartbeatTimer = setInterval(
      () => void safeHeartbeat(config, fetchImpl),
      heartbeatIntervalMs,
    );
    heartbeatTimer.unref?.();
  });

  client.on("messageCreate", async (message) => {
    const normalized = normalizeDiscordGatewayMessage(message);
    if (normalized.skipped) {
      return;
    }

    const dedupeKey = normalized.message.id;
    if (seenMessageIds.has(dedupeKey)) {
      logDiagnostic("discord_message_duplicate", {
        externalId: normalized.message.externalId,
      });
      return;
    }
    seenMessageIds.add(dedupeKey);

    logDiagnostic("discord_message_received", {
      externalId: normalized.message.externalId,
    });

    try {
      await submitNormalizedMessage({
        appBaseUrl: config.appBaseUrl,
        integrationSecret: config.integrationSecret,
        message: normalized.message,
        fetchImpl,
      });
    } catch (error) {
      logDiagnostic("discord_internal_api_failed", {
        error: error instanceof Error ? error.message : "unknown_error",
        externalId: normalized.message.externalId,
      });
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== "agenticops") {
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "status") {
      await interaction.reply({
        content: "Agentic Ops is connected in analyze-only mode.",
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "help") {
      await interaction.reply({
        content:
          "Use /agenticops analyze text:<message>. I will not delete, moderate or reply publicly.",
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "analyze") {
      const text = interaction.options.getString("text", true);
      const message = normalizeDiscordInteraction(interaction, text);
      await submitNormalizedMessage({
        appBaseUrl: config.appBaseUrl,
        integrationSecret: config.integrationSecret,
        message,
        fetchImpl,
      });
      await interaction.reply({
        content: "Message submitted for Agentic Ops analyze-only review.",
        ephemeral: true,
      });
    }
  });

  client.on("shardDisconnect", () => {
    logDiagnostic("discord_gateway_disconnected");
  });

  client.on("shardReconnecting", () => {
    logDiagnostic("discord_gateway_reconnecting");
  });

  client.on("error", (error) => {
    logDiagnostic("discord_internal_api_failed", {
      error: error instanceof Error ? error.message : "discord_client_error",
    });
  });

  return {
    async shutdown() {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
      logDiagnostic("discord_worker_shutdown");
      client.destroy();
    },
  };
}

export async function startDiscordWorker(env = process.env) {
  logDiagnostic("discord_worker_starting");
  const config = readDiscordWorkerConfig(env);
  if (config.missing.length) {
    console.error(
      `Discord worker missing required configuration: ${config.missing.join(", ")}.`,
    );
    process.exitCode = 1;
    return null;
  }

  if (process.argv.includes("--validate") || env.DISCORD_WORKER_VALIDATE_ONLY === "1") {
    console.log("discord_worker_validation_ok");
    return null;
  }

  const client = createDiscordClient();
  const runtime = registerDiscordWorkerHandlers(client, config);

  const shutdown = async () => {
    await runtime.shutdown();
    process.exit(0);
  };

  process.once("SIGTERM", () => void shutdown());
  process.once("SIGINT", () => void shutdown());

  await client.login(config.token);
  return { client, runtime };
}

function createDiscordCommands() {
  return [
    new SlashCommandBuilder()
      .setName("agenticops")
      .setDescription("Agentic Ops analyze-only commands")
      .addSubcommand((subcommand) =>
        subcommand.setName("status").setDescription("Show bot status"),
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("help").setDescription("Show safe usage notes"),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("analyze")
          .setDescription("Analyze submitted text")
          .addStringOption((option) =>
            option
              .setName("text")
              .setDescription("Text to analyze")
              .setRequired(true),
          ),
      ),
  ].map((command) => command.toJSON());
}

function normalizeDiscordInteraction(interaction, text) {
  const externalId = hashDiscordIdentifier(interaction.id);
  const channelId = interaction.channelId
    ? hashDiscordIdentifier(interaction.channelId)
    : undefined;
  const guildId = interaction.guildId
    ? hashDiscordIdentifier(interaction.guildId)
    : undefined;

  return {
    id: `discord:${externalId}`,
    externalId,
    source: "discord",
    channelId,
    conversationId: channelId,
    senderId: hashDiscordIdentifier(interaction.user.id),
    senderName: sanitizeDiscordText(interaction.user.username, 240),
    text: sanitizeDiscordText(text),
    timestamp: new Date().toISOString(),
    metadata: { guildId, slashCommand: true },
  };
}

async function safeHeartbeat(config, fetchImpl) {
  try {
    await submitDiscordHeartbeat({
      appBaseUrl: config.appBaseUrl,
      integrationSecret: config.integrationSecret,
      fetchImpl,
    });
  } catch (error) {
    logDiagnostic("discord_internal_api_failed", {
      error: error instanceof Error ? error.message : "heartbeat_failed",
    });
  }
}

function hashDiscordIdentifier(value) {
  return createHash("sha256")
    .update(`discord:${String(value)}`)
    .digest("hex")
    .slice(0, 32);
}

function sanitizeDiscordText(value, maxLength = maxMessageLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeDiscordTimestamp(createdAt, createdTimestamp) {
  if (createdAt instanceof Date && Number.isFinite(createdAt.getTime())) {
    return createdAt.toISOString();
  }

  if (typeof createdTimestamp === "number") {
    return new Date(createdTimestamp).toISOString();
  }

  return new Date().toISOString();
}

function logDiagnostic(eventType, metadata = {}) {
  const safeMetadata = {};
  if (metadata.externalId) {
    safeMetadata.externalId = redact(String(metadata.externalId));
  }
  if (metadata.error) {
    safeMetadata.error = String(metadata.error).slice(0, 160);
  }
  console.log(JSON.stringify({ eventType, ...safeMetadata }));
}

function redact(value) {
  return value.length <= 6 ? "***" : `${value.slice(0, 3)}...${value.slice(-3)}`;
}

const isDirectRun = process.argv[1]
  ? fileURLToPath(import.meta.url) === process.argv[1]
  : false;

if (isDirectRun) {
  await startDiscordWorker();
}
