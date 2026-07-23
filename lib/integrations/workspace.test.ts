import { afterEach, describe, expect, it } from "vitest";

import {
  addIntegrationEventLogEntry,
  MemoryIntegrationEventRepository,
  setIntegrationEventRepositoryForTests,
  type IntegrationWorkflowRecord,
} from "./event-log";
import {
  getIntegrationWorkspaceData,
  workflowToApprovalItem,
  workflowToInboxItem,
} from "./workspace";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  setIntegrationEventRepositoryForTests(null);
});

describe("integration workspace model", () => {
  it("does not classify providers as connected from environment variables alone", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "telegram-token";
    process.env.DISCORD_BOT_TOKEN = "discord-token";
    process.env.DISCORD_APPLICATION_ID = "discord-app";
    process.env.INTERNAL_INTEGRATION_SECRET = "internal-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());

    const workspace = await getIntegrationWorkspaceData();
    const telegram = workspace.providers.find((provider) => provider.id === "telegram");
    const discord = workspace.providers.find((provider) => provider.id === "discord");

    expect(telegram?.status).toBe("Awaiting First Event");
    expect(discord?.status).toBe("Awaiting First Event");
    expect(workspace.connectedProviders.map((provider) => provider.id)).not.toContain(
      "telegram",
    );
  });

  it("uses real events and heartbeats for active provider status", async () => {
    process.env.DISCORD_BOT_TOKEN = "discord-token";
    process.env.DISCORD_APPLICATION_ID = "discord-app";
    process.env.INTERNAL_INTEGRATION_SECRET = "internal-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());

    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_worker_heartbeat",
      processingStatus: "processed",
      analysisStatus: "not_started",
    });
    await addIntegrationEventLogEntry({
      provider: "telegram",
      eventType: "message",
      processingStatus: "processed",
      analysisStatus: "completed",
      externalId: "telegram-message-id",
    });

    const workspace = await getIntegrationWorkspaceData();

    expect(workspace.providers.find((provider) => provider.id === "discord")?.status)
      .toBe("Worker Online");
    expect(workspace.providers.find((provider) => provider.id === "telegram")?.status)
      .toBe("Active");
  });

  it("maps workflows to safe inbox and approval records", () => {
    const workflow = createWorkflow();

    const inbox = workflowToInboxItem(workflow);
    const approval = workflowToApprovalItem(workflow);

    expect(inbox.provider).toBe("Gmail");
    expect(inbox.boundedPreview).toBe("Please review this invoice urgently.");
    expect(inbox.safeSenderReference).toBe("Redacted sender");
    expect(approval.status).toBe("Pending Review");
    expect(approval.externalExecutionAvailability).toBe("Unavailable");
    expect(JSON.stringify({ inbox, approval })).not.toContain("secret-token");
  });
});

export function createWorkflow(
  overrides: Partial<IntegrationWorkflowRecord> = {},
): IntegrationWorkflowRecord {
  return {
    id: "gmail:hashed-message",
    provider: "gmail",
    createdAt: "2026-07-23T12:00:00.000Z",
    updatedAt: "2026-07-23T12:00:00.000Z",
    status: "suggested",
    receivedMessage: {
      normalizedMessageId: "gmail:hashed-message",
      externalId: "redacted-external-id",
      source: "gmail",
      timestamp: "2026-07-23T12:00:00.000Z",
      textPreview: "Please review this invoice urgently.",
      metadata: { channel: "email" },
    },
    analysis: {
      riskLevel: "High",
      intent: "Billing",
      aiClassification: "Business communication",
      deterministicRuleIds: [],
      explainability: ["Urgent billing language requires review."],
    },
    suggestion: {
      suggestedAction: "Review internally before replying.",
      suggestedReply: "Thanks for the note. We will review and follow up.",
      requiresHumanApproval: true,
      outboundAvailable: false,
      outboundUnavailableReason: "Gmail is readonly.",
    },
    approval: { status: "pending" },
    execution: { status: "not_attempted" },
    ...overrides,
  };
}
