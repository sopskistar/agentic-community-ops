import {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
} from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const appBaseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
const integrationSecret = process.env.INTERNAL_INTEGRATION_SECRET;

if (!token || !appBaseUrl || !integrationSecret) {
  console.error(
    "Discord worker requires DISCORD_BOT_TOKEN, APP_BASE_URL and INTERNAL_INTEGRATION_SECRET.",
  );
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const commands = [
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

client.once("ready", async () => {
  console.log(`Agentic Ops Discord worker connected as ${client.user?.tag}.`);
  await client.application?.commands.set(commands);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guildId || !message.content.trim()) {
    return;
  }

  try {
    await submitNormalizedMessage({
      id: `discord:${message.id}`,
      externalId: message.id,
      source: "discord",
      channelId: message.channelId,
      conversationId: message.channelId,
      senderId: message.author.id,
      senderName: message.author.username,
      text: message.content,
      timestamp: message.createdAt.toISOString(),
      metadata: { guildId: message.guildId },
    });
    console.log(`Analyzed Discord message ${redact(message.id)}.`);
  } catch (error) {
    console.error(
      `Discord message analysis failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
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
    await submitNormalizedMessage({
      id: `discord:interaction:${interaction.id}`,
      externalId: interaction.id,
      source: "discord",
      channelId: interaction.channelId ?? undefined,
      conversationId: interaction.channelId ?? undefined,
      senderId: interaction.user.id,
      senderName: interaction.user.username,
      text,
      timestamp: new Date().toISOString(),
      metadata: { guildId: interaction.guildId, slashCommand: true },
    });
    await interaction.reply({
      content: "Message submitted for Agentic Ops analyze-only review.",
      ephemeral: true,
    });
  }
});

await client.login(token);

async function submitNormalizedMessage(message) {
  const response = await fetch(`${appBaseUrl}/api/integrations/messages`, {
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
}

function redact(value) {
  return value.length <= 6 ? "***" : `${value.slice(0, 3)}...${value.slice(-3)}`;
}
