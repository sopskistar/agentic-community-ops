import { EventEmitter } from "events";

import { GatewayIntentBits } from "discord.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  discordWorkerIntents,
  normalizeDiscordGatewayMessage,
  readDiscordWorkerConfig,
  registerDiscordWorkerHandlers,
  submitNormalizedMessage,
} from "./discord-bot.mjs";

describe("Discord Railway worker helpers", () => {
  const originalConsoleLog = console.log;

  afterEach(() => {
    console.log = originalConsoleLog;
    vi.restoreAllMocks();
  });

  it("validates startup configuration", () => {
    expect(readDiscordWorkerConfig({}).missing).toEqual([
      "DISCORD_BOT_TOKEN",
      "APP_BASE_URL",
      "INTERNAL_INTEGRATION_SECRET",
    ]);

    const config = readDiscordWorkerConfig({
      DISCORD_BOT_TOKEN: "bot-token",
      APP_BASE_URL: "https://agenticopsai.xyz",
      INTERNAL_INTEGRATION_SECRET: "internal-secret",
    });

    expect(config.missing).toEqual([]);
    expect(config.appBaseUrl).toBe("https://agenticopsai.xyz");
  });

  it("uses only required Gateway intents", () => {
    expect(discordWorkerIntents).toEqual([
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]);
    expect(discordWorkerIntents).not.toContain(GatewayIntentBits.GuildMembers);
    expect(discordWorkerIntents).not.toContain(GatewayIntentBits.GuildPresences);
  });

  it("filters bot and empty messages", () => {
    expect(
      normalizeDiscordGatewayMessage({
        id: "message-1",
        content: "ignored",
        guildId: "guild-1",
        channelId: "channel-1",
        author: { id: "bot-1", username: "bot", bot: true },
      }),
    ).toMatchObject({ skipped: true, reason: "bot_message" });

    expect(
      normalizeDiscordGatewayMessage({
        id: "message-2",
        content: "   ",
        guildId: "guild-1",
        channelId: "channel-1",
        author: { id: "user-1", username: "user", bot: false },
      }),
    ).toMatchObject({ skipped: true, reason: "empty_message" });
  });

  it("normalizes Discord messages with hashed identifiers", () => {
    const normalized = normalizeDiscordGatewayMessage(createDiscordGatewayMessage());

    expect(normalized.skipped).toBe(false);
    expect(normalized.message).toMatchObject({
      id: expect.stringMatching(/^discord:[a-f0-9]{32}$/),
      source: "discord",
      channelId: expect.stringMatching(/^[a-f0-9]{32}$/),
      conversationId: expect.stringMatching(/^[a-f0-9]{32}$/),
      senderId: expect.stringMatching(/^[a-f0-9]{32}$/),
      text: "Analyze this Discord message",
      metadata: expect.objectContaining({
        guildId: expect.stringMatching(/^[a-f0-9]{32}$/),
      }),
    });
    expect(JSON.stringify(normalized.message)).not.toContain("message-1");
    expect(JSON.stringify(normalized.message)).not.toContain("guild-1");
    expect(JSON.stringify(normalized.message)).not.toContain("channel-1");
    expect(JSON.stringify(normalized.message)).not.toContain("user-1");
  });

  it("submits normalized messages to the protected internal API", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));

    await submitNormalizedMessage({
      appBaseUrl: "https://agenticopsai.xyz",
      integrationSecret: "internal-secret",
      message: normalizeDiscordGatewayMessage(createDiscordGatewayMessage()).message,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://agenticopsai.xyz/api/integrations/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-agenticops-integration-secret": "internal-secret",
        }),
      }),
    );
  });

  it("surfaces failed internal API delivery without logging secrets", async () => {
    const logs = [];
    console.log = (message) => logs.push(String(message));
    const fetchImpl = vi.fn(async () => new Response("failed", { status: 500 }));
    const client = new FakeDiscordClient();
    registerDiscordWorkerHandlers(
      client,
      {
        appBaseUrl: "https://agenticopsai.xyz",
        integrationSecret: "internal-secret",
      },
      { fetchImpl },
    );

    client.emit("messageCreate", createDiscordGatewayMessage());
    await new Promise((resolve) => setImmediate(resolve));

    expect(logs.some((line) => line.includes("discord_internal_api_failed")))
      .toBe(true);
    expect(JSON.stringify(logs)).not.toContain("internal-secret");
    expect(JSON.stringify(logs)).not.toContain("Analyze this Discord message");
  });

  it("deduplicates messages inside the worker process", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const client = new FakeDiscordClient();
    registerDiscordWorkerHandlers(
      client,
      {
        appBaseUrl: "https://agenticopsai.xyz",
        integrationSecret: "internal-secret",
      },
      { fetchImpl },
    );

    const message = createDiscordGatewayMessage();
    client.emit("messageCreate", message);
    client.emit("messageCreate", message);
    await new Promise((resolve) => setImmediate(resolve));

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("shuts down gracefully", async () => {
    const client = new FakeDiscordClient();
    const runtime = registerDiscordWorkerHandlers(client, {
      appBaseUrl: "https://agenticopsai.xyz",
      integrationSecret: "internal-secret",
    });

    await runtime.shutdown();

    expect(client.destroyed).toBe(true);
  });
});

function createDiscordGatewayMessage() {
  return {
    id: "message-1",
    content: "Analyze this Discord message",
    guildId: "guild-1",
    channelId: "channel-1",
    createdAt: new Date("2026-07-21T12:00:00.000Z"),
    author: { id: "user-1", username: "community-member", bot: false },
  };
}

class FakeDiscordClient extends EventEmitter {
  application = { commands: { set: vi.fn(async () => undefined) } };
  destroyed = false;

  destroy() {
    this.destroyed = true;
  }
}
