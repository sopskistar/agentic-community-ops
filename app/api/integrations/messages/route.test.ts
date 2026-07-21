import { afterEach, describe, expect, it } from "vitest";

import { resetIntegrationDedupeForTests } from "../../../../lib/integrations/dedupe";
import {
  listIntegrationEventLogEntries,
  listIntegrationWorkflowRecords,
  MemoryIntegrationEventRepository,
  resetIntegrationEventLogForTests,
  setIntegrationEventRepositoryForTests,
} from "../../../../lib/integrations/event-log";
import { POST } from "./route";

const originalEnv = { ...process.env };

afterEach(async () => {
  process.env = { ...originalEnv };
  resetIntegrationDedupeForTests();
  setIntegrationEventRepositoryForTests(null);
  await resetIntegrationEventLogForTests();
});

describe("/api/integrations/messages", () => {
  it("rejects requests without the internal integration secret", async () => {
    process.env.INTERNAL_INTEGRATION_SECRET = "internal-secret";
    const response = await POST(
      new Request("http://localhost/api/integrations/messages", {
        method: "POST",
        body: JSON.stringify(createDiscordMessage()),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("persists Discord heartbeat events", async () => {
    process.env.INTERNAL_INTEGRATION_SECRET = "internal-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const response = await postWithSecret({
      type: "heartbeat",
      provider: "discord",
    });

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events[0]).toMatchObject({
      provider: "discord",
      eventType: "discord_worker_heartbeat",
      processingStatus: "processed",
    });
  });

  it("persists Discord message lifecycle and approval-required suggestion", async () => {
    process.env.INTERNAL_INTEGRATION_SECRET = "internal-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const response = await postWithSecret(createDiscordMessage());

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "discord_message_received",
        "discord_analysis_started",
        "discord_analysis_completed",
        "discord_suggested",
      ]),
    );
    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows).toHaveLength(1);
    expect(workflows[0].provider).toBe("discord");
    expect(workflows[0].suggestion?.requiresHumanApproval).toBe(true);
    expect(workflows[0].suggestion?.outboundAvailable).toBe(false);
  });

  it("deduplicates Discord messages by normalized hashed message ID", async () => {
    process.env.INTERNAL_INTEGRATION_SECRET = "internal-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const message = createDiscordMessage();

    expect((await postWithSecret(message)).status).toBe(200);
    expect((await postWithSecret(message)).status).toBe(200);

    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows).toHaveLength(1);
    const events = await listIntegrationEventLogEntries();
    expect(events.some((event) => event.eventType === "discord_message_duplicate"))
      .toBe(true);
  });

  it("rejects invalid normalized Discord payloads", async () => {
    process.env.INTERNAL_INTEGRATION_SECRET = "internal-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const response = await postWithSecret({
      ...createDiscordMessage(),
      source: "discord",
      text: "",
    });

    expect(response.status).toBe(400);
  });

  it("does not leak secrets or raw Discord IDs into persisted events", async () => {
    process.env.INTERNAL_INTEGRATION_SECRET = "internal-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    await postWithSecret(createDiscordMessage());

    const serialized = JSON.stringify(await listIntegrationEventLogEntries());
    expect(serialized).not.toContain("internal-secret");
    expect(serialized).not.toContain("raw-message-id");
    expect(serialized).not.toContain("raw-user-id");
  });
});

function postWithSecret(body: unknown) {
  return POST(
    new Request("http://localhost/api/integrations/messages", {
      method: "POST",
      headers: { "x-agenticops-integration-secret": "internal-secret" },
      body: JSON.stringify(body),
    }),
  );
}

function createDiscordMessage() {
  return {
    id: "discord:11112222333344445555666677778888",
    externalId: "11112222333344445555666677778888",
    source: "discord",
    channelId: "aaaabbbbccccddddeeeeffff11112222",
    conversationId: "aaaabbbbccccddddeeeeffff11112222",
    senderId: "99998888777766665555444433332222",
    senderName: "community-member",
    text: "Can someone review this suspicious link?",
    timestamp: "2026-07-21T12:00:00.000Z",
    metadata: {
      guildId: "ffffeeeeddddccccbbbbaaaa00001111",
      originalMessageId: "redacted",
    },
  };
}
