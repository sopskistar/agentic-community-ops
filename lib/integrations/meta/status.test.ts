import { afterEach, describe, expect, it } from "vitest";

import {
  addIntegrationEventLogEntry,
  MemoryIntegrationEventRepository,
  setIntegrationEventRepositoryForTests,
} from "../event-log";
import { getMetaProviderStatus } from "./status";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  setIntegrationEventRepositoryForTests(null);
});

describe("Meta provider status", () => {
  it("distinguishes configuration from verified and receiving states", async () => {
    process.env.META_APP_ID = "app-id";
    process.env.META_APP_SECRET = "app-secret";
    process.env.META_VERIFY_TOKEN = "verify-token";
    process.env.META_PAGE_ACCESS_TOKEN = "page-token";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());

    expect((await getMetaProviderStatus("facebook")).status).toBe(
      "no_event_received_yet",
    );

    await addIntegrationEventLogEntry({
      provider: "meta",
      eventType: "meta_verification_success",
      processingStatus: "processed",
      analysisStatus: "not_started",
    });
    expect((await getMetaProviderStatus("facebook")).status).toBe(
      "webhook_verified",
    );

    await addIntegrationEventLogEntry({
      provider: "facebook",
      eventType: "meta_message_received",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: "message-id",
    });
    await addIntegrationEventLogEntry({
      provider: "facebook",
      eventType: "facebook_comment_received",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: "comment-id",
    });
    const status = await getMetaProviderStatus("facebook");
    expect(status.status).toBe("receiving_events");
    expect(status.messageCount).toBe(1);
    expect(status.commentCount).toBe(1);
    expect(status.latestDirectMessageEventReceived).toBeDefined();
    expect(status.latestCommentEventReceived).toBeDefined();
  });

  it("counts Instagram direct messages, comments and mentions separately", async () => {
    process.env.META_APP_ID = "app-id";
    process.env.META_APP_SECRET = "app-secret";
    process.env.META_VERIFY_TOKEN = "verify-token";
    process.env.META_PAGE_ACCESS_TOKEN = "page-token";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());

    await addIntegrationEventLogEntry({
      provider: "instagram",
      eventType: "meta_message_received",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: "message-id",
    });
    await addIntegrationEventLogEntry({
      provider: "instagram",
      eventType: "instagram_comment_received",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: "comment-id",
    });
    await addIntegrationEventLogEntry({
      provider: "instagram",
      eventType: "instagram_mention_received",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: "mention-id",
    });

    const status = await getMetaProviderStatus("instagram");
    expect(status.status).toBe("receiving_events");
    expect(status.messageCount).toBe(1);
    expect(status.commentCount).toBe(2);
    expect(status.latestDirectMessageEventReceived).toBeDefined();
    expect(status.latestCommentEventReceived).toBeDefined();
  });
});
