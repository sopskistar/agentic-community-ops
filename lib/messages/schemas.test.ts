import { describe, expect, it } from "vitest";

import {
  auditEventTypes,
  intentCategories,
  messageSources,
  replyStates,
  riskLevels,
} from "./constants";
import {
  attachmentSchema,
  auditEventSchema,
  normalizedMessageSchema,
  replyRecommendationSchema,
} from "./schemas";
import {
  channelProfileSchema,
  channelProfiles,
  channelProfilesBySource,
} from "./channel-profiles";
import type { NormalizedMessage } from "./types";

const baseTimestamp = "2026-07-18T12:00:00.000Z";

function createMessage(overrides: Partial<NormalizedMessage> = {}) {
  return {
    messageId: "msg_123",
    conversationId: "conv_123",
    organizationId: "org_future",
    projectId: "demo-fictional-atlas-dao",
    source: "Discord",
    externalMessageId: "discord-msg-1",
    externalConversationId: "discord-channel-1",
    sender: {
      externalId: "user-1",
      displayName: "Community User",
      username: "community-user",
      role: "CommunityMember",
      isVerified: false,
    },
    recipient: [
      {
        externalId: "channel-1",
        displayName: "support",
        type: "Channel",
      },
    ],
    timestamp: baseTimestamp,
    receivedAt: baseTimestamp,
    subject: "Wallet support",
    content: "Where can I find the official wallet support docs?",
    normalizedContent: "where can i find the official wallet support docs?",
    attachments: [],
    metadata: { guildId: "guild-1" },
    language: "en",
    analysis: {
      analysisId: "analysis_123",
      riskLevel: "Low",
      intentCategories: ["FAQ", "SupportRequest"],
      detectedIntent: "User asks for official support documentation.",
      sentiment: "Neutral",
      priority: "Normal",
      summary: "Documentation request.",
      recommendedActions: ["Reply with official documentation link."],
      confidence: 0.91,
      shouldEscalate: false,
      evidence: ["official wallet support docs"],
    },
    replyState: "Suggested",
    replyRecommendation: {
      replyId: "reply_123",
      state: "Suggested",
      suggestedContent:
        "Suggested reply for human review: Please use the official docs.",
      requiresHumanApproval: true,
      generatedAt: baseTimestamp,
    },
    audit: {
      createdAt: baseTimestamp,
      updatedAt: baseTimestamp,
      events: [
        {
          eventId: "event_123",
          type: "MessageReceived",
          timestamp: baseTimestamp,
          actorType: "Integration",
          description: "Message normalized from Discord payload.",
        },
      ],
    },
    ...overrides,
  };
}

describe("normalized message schemas", () => {
  it("parses a valid normalized message", () => {
    const parsed = normalizedMessageSchema.parse(createMessage());

    expect(parsed.messageId).toBe("msg_123");
    expect(parsed.source).toBe("Discord");
    expect(parsed.analysis?.intentCategories).toEqual([
      "FAQ",
      "SupportRequest",
    ]);
    expect(parsed.replyRecommendation?.state).toBe("Suggested");
  });

  it("supports document-oriented messages with attachments", () => {
    const parsed = normalizedMessageSchema.parse(
      createMessage({
        source: "PDF",
        subject: "Uploaded support transcript",
        content: "Extracted PDF text",
        normalizedContent: "extracted pdf text",
        attachments: [
          {
            attachmentId: "att_1",
            filename: "support-transcript.pdf",
            mimeType: "application/pdf",
            sizeBytes: 48_000,
            extractedText: "Extracted PDF text",
            metadata: { pageCount: 3 },
          },
        ],
        metadata: { uploadSource: "dashboard" },
      }),
    );

    expect(parsed.source).toBe("PDF");
    expect(parsed.attachments[0].filename).toBe("support-transcript.pdf");
  });

  it("rejects invalid messages", () => {
    const result = normalizedMessageSchema.safeParse(
      createMessage({
        messageId: "",
        content: "",
        timestamp: "not-a-date",
      }),
    );

    expect(result.success).toBe(false);
  });

  it("validates enum values", () => {
    expect(messageSources).toContain("Discord");
    expect(messageSources).toContain("PlainText");
    expect(riskLevels).toEqual([
      "Safe",
      "Low",
      "Medium",
      "High",
      "Critical",
    ]);
    expect(intentCategories).toEqual(
      expect.arrayContaining(["Scam", "FakeAdmin", "SeedPhraseRequest"]),
    );
    expect(auditEventTypes).toContain("AnalysisCompleted");
  });

  it("rejects invalid enum values during parsing", () => {
    const result = normalizedMessageSchema.safeParse(
      createMessage({
        source: "MySpace" as NormalizedMessage["source"],
      }),
    );

    expect(result.success).toBe(false);
  });

  it("validates attachments", () => {
    expect(
      attachmentSchema.safeParse({
        attachmentId: "att_1",
        sizeBytes: 0,
        url: "https://example.invalid/file.txt",
      }).success,
    ).toBe(true);

    expect(
      attachmentSchema.safeParse({
        attachmentId: "att_1",
        sizeBytes: -1,
      }).success,
    ).toBe(false);
  });

  it("validates reply states and reply recommendations", () => {
    expect(replyStates).toEqual([
      "None",
      "Suggested",
      "Approved",
      "AutoSent",
      "Escalated",
    ]);

    expect(
      replyRecommendationSchema.safeParse({
        replyId: "reply_1",
        state: "Approved",
        approvedContent: "Approved response.",
        requiresHumanApproval: true,
      }).success,
    ).toBe(true);

    expect(
      replyRecommendationSchema.safeParse({
        replyId: "reply_1",
        state: "Sent",
        requiresHumanApproval: true,
      }).success,
    ).toBe(false);
  });

  it("validates audit events", () => {
    expect(
      auditEventSchema.safeParse({
        eventId: "event_1",
        type: "Escalated",
        timestamp: baseTimestamp,
        actorType: "System",
      }).success,
    ).toBe(true);

    expect(
      auditEventSchema.safeParse({
        eventId: "event_1",
        type: "Archived",
        timestamp: baseTimestamp,
      }).success,
    ).toBe(false);
  });

  it("validates channel profiles", () => {
    expect(channelProfiles).toHaveLength(7);

    for (const profile of channelProfiles) {
      expect(channelProfileSchema.safeParse(profile).success).toBe(true);
    }

    expect(channelProfilesBySource.Discord?.securityPriorities).toContain(
      "Fake administrator detection",
    );
    expect(channelProfilesBySource.UploadedDocument?.relatedSources).toEqual([
      "CSV",
      "Excel",
      "PDF",
      "Word",
      "PlainText",
    ]);
  });

  it("rejects invalid channel profiles", () => {
    const result = channelProfileSchema.safeParse({
      source: "Discord",
      displayName: "Discord",
      typicalMessageStyle: "",
      conversationCharacteristics: "Chat.",
      businessContext: "Support.",
      securityPriorities: [],
      defaultAnalysisPriorities: ["Security risk"],
    });

    expect(result.success).toBe(false);
  });
});
