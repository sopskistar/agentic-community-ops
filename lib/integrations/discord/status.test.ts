import { afterEach, describe, expect, it } from "vitest";

import {
  addIntegrationEventLogEntry,
  MemoryIntegrationEventRepository,
  setIntegrationEventRepositoryForTests,
} from "../event-log";
import { getDiscordWorkerStatus } from "./status";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  setIntegrationEventRepositoryForTests(null);
});

describe("Discord worker status", () => {
  it("does not infer online status from environment variables alone", async () => {
    process.env.DISCORD_BOT_TOKEN = "bot-token";
    process.env.DISCORD_APPLICATION_ID = "app-id";
    process.env.INTERNAL_INTEGRATION_SECRET = "secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());

    const status = await getDiscordWorkerStatus();

    expect(status.status).toBe("worker_never_seen");
    expect(status.latestHeartbeat).toBeUndefined();
  });

  it("reports recently active workers from heartbeat diagnostics", async () => {
    process.env.DISCORD_BOT_TOKEN = "bot-token";
    process.env.DISCORD_APPLICATION_ID = "app-id";
    process.env.INTERNAL_INTEGRATION_SECRET = "secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());

    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_worker_heartbeat",
      processingStatus: "processed",
      analysisStatus: "not_started",
    });
    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_message_received",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: "message-id",
    });
    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_analysis_completed",
      processingStatus: "processed",
      analysisStatus: "completed",
      externalId: "message-id",
    });

    const status = await getDiscordWorkerStatus();

    expect(status.status).toBe("worker_recently_active");
    expect(status.latestHeartbeat).toBeDefined();
    expect(status.latestMessageReceived).toBeDefined();
    expect(status.latestProcessingSuccess).toBeDefined();
    expect(status.messageCount).toBe(1);
  });

  it("reports stale workers when the latest heartbeat is old", async () => {
    process.env.DISCORD_BOT_TOKEN = "bot-token";
    process.env.DISCORD_APPLICATION_ID = "app-id";
    process.env.INTERNAL_INTEGRATION_SECRET = "secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());

    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_worker_heartbeat",
      processingStatus: "processed",
      analysisStatus: "not_started",
    });
    const status = await getDiscordWorkerStatus(
      new Date(Date.now() + 10 * 60 * 1000),
    );

    expect(status.status).toBe("worker_stale");
  });
});
