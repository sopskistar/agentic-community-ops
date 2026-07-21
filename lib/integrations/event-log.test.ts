import { afterEach, describe, expect, it, vi } from "vitest";

import {
  addIntegrationEventLogEntry,
  listIntegrationEventLogEntries,
  listIntegrationWorkflowRecords,
  MemoryIntegrationEventRepository,
  recordIntegrationAnalysis,
  resetIntegrationEventLogForTests,
  setIntegrationEventRepositoryForTests,
} from "./event-log";
import type { IntegrationProcessingResult } from "./processor";

const originalEnv = { ...process.env };

afterEach(async () => {
  vi.unstubAllGlobals();
  process.env = { ...originalEnv };
  setIntegrationEventRepositoryForTests(null);
  await resetIntegrationEventLogForTests();
});

describe("integration event repository", () => {
  it("stores redacted events in the memory repository", async () => {
    const repository = new MemoryIntegrationEventRepository();
    setIntegrationEventRepositoryForTests(repository);

    await addIntegrationEventLogEntry({
      provider: "telegram",
      eventType: "message",
      processingStatus: "processed",
      analysisStatus: "completed",
      externalId: "123456789",
      errorSummary: "token=secret-value",
    });

    const entries = await listIntegrationEventLogEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].redactedExternalId).toBe("123...789");
    expect(entries[0].errorSummary).toBe("token=<redacted>");
  });

  it("stores analysis workflow records with approval required", async () => {
    const repository = new MemoryIntegrationEventRepository();
    setIntegrationEventRepositoryForTests(repository);

    await recordIntegrationAnalysis(createProcessingResult());

    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows).toHaveLength(1);
    expect(workflows[0].status).toBe("suggested");
    expect(workflows[0].approval?.status).toBe("pending");
    expect(workflows[0].suggestion?.requiresHumanApproval).toBe(true);
    expect(workflows[0].suggestion?.outboundAvailable).toBe(false);
    expect(workflows[0].execution?.status).toBe("not_attempted");
  });

  it("uses Vercel KV REST storage when configured", async () => {
    process.env.KV_REST_API_URL = "https://kv.example";
    process.env.KV_REST_API_TOKEN = "kv-token";
    process.env.INTEGRATION_EVENT_REPOSITORY = "";
    setIntegrationEventRepositoryForTests(null);

    const commands: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        commands.push(JSON.parse(String(init?.body)));
        return Response.json({ result: [] });
      }),
    );

    await addIntegrationEventLogEntry({
      provider: "meta",
      eventType: "message",
      processingStatus: "processed",
      analysisStatus: "completed",
      externalId: "meta-message",
    });
    await listIntegrationEventLogEntries();

    expect(commands).toEqual([
      [
        "LPUSH",
        "agenticops:integration-events",
        expect.stringContaining("\"provider\":\"meta\""),
      ],
      ["LTRIM", "agenticops:integration-events", "0", "99"],
      ["LRANGE", "agenticops:integration-events", "0", "99"],
    ]);
  });
});

function createProcessingResult(): IntegrationProcessingResult {
  return {
    message: {
      id: "telegram:1",
      externalId: "987654321",
      source: "telegram",
      channelId: "chat-1",
      conversationId: "chat-1",
      senderId: "sender-1",
      senderName: "Demo Sender",
      text: "Please help with my account.",
      timestamp: new Date("2026-07-20T12:00:00.000Z").toISOString(),
      metadata: { updateId: 1 },
    },
    deterministicRuleResults: [],
    riskLevel: "LOW",
    intent: "Support request",
    aiClassification: "CUSTOMER_SUPPORT",
    suggestedAction: "Ask a human moderator to review.",
    suggestedReply: "Thanks for reaching out. A team member will review this.",
    explainability: ["Source normalized as telegram."],
    sourceMetadata: { updateId: 1 },
    mode: "ANALYZE_ONLY",
  };
}
