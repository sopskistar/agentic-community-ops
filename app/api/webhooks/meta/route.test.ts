import { createHmac } from "crypto";
import { afterEach, describe, expect, it } from "vitest";

import {
  listIntegrationEventLogEntries,
  listIntegrationWorkflowRecords,
  MemoryIntegrationEventRepository,
  resetIntegrationEventLogForTests,
  setIntegrationEventRepositoryForTests,
  type IntegrationEventRepository,
} from "../../../../lib/integrations/event-log";
import { GET, POST } from "./route";

const originalEnv = { ...process.env };

afterEach(async () => {
  process.env = { ...originalEnv };
  setIntegrationEventRepositoryForTests(null);
  await resetIntegrationEventLogForTests();
});

describe("Meta webhook route", () => {
  it("returns challenge for valid verification", async () => {
    process.env.META_VERIFY_TOKEN = "verify-token";
    const response = await GET(
      new Request(
        "http://localhost/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=abc123",
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("abc123");
  });

  it("rejects invalid verification", async () => {
    process.env.META_VERIFY_TOKEN = "verify-token";
    const response = await GET(
      new Request(
        "http://localhost/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=abc123",
      ),
    );

    expect(response.status).toBe(403);
  });

  it("rejects invalid signatures when app secret is configured", async () => {
    process.env.META_APP_SECRET = "app-secret";
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": "sha256=bad" },
        body: JSON.stringify({ object: "page", entry: [] }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("accepts valid signatures", async () => {
    process.env.META_APP_SECRET = "app-secret";
    const body = JSON.stringify({ object: "page", entry: [] });
    const signature = createHmac("sha256", "app-secret")
      .update(body)
      .digest("hex");
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": `sha256=${signature}` },
        body,
      }),
    );

    expect(response.status).toBe(200);
  });

  it("persists Facebook event lifecycle and approval-required suggestion", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createMetaPayload("page", "facebook-mid"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "meta_message_received",
        "meta_analysis_started",
        "meta_analysis_completed",
        "meta_suggested",
      ]),
    );
    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows[0].provider).toBe("facebook");
    expect(workflows[0].suggestion?.requiresHumanApproval).toBe(true);
    expect(workflows[0].suggestion?.outboundAvailable).toBe(false);
  });

  it("persists Instagram message diagnostics separately", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createMetaPayload("instagram", "instagram-mid"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.some((event) => event.provider === "instagram")).toBe(true);
    expect(events.map((event) => event.eventType)).toContain(
      "meta_message_received",
    );
  });

  it("persists Facebook Page comment add lifecycle and workflow", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createFacebookCommentPayload("comment-1", "add"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "facebook_comment_received",
        "meta_analysis_started",
        "meta_analysis_completed",
        "meta_suggested",
      ]),
    );
    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows[0].provider).toBe("facebook");
    expect(workflows[0].receivedMessage.channelId).toBe("facebook_comment");
    expect(workflows[0].suggestion?.requiresHumanApproval).toBe(true);
    expect(workflows[0].suggestion?.outboundAvailable).toBe(false);
    expect(JSON.stringify(events)).not.toContain("comment-1");
    expect(JSON.stringify(workflows)).not.toContain("sender-1");
  });

  it("persists Facebook comment edits through the analysis lifecycle", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createFacebookCommentPayload("comment-edit-1", "edited"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "facebook_comment_edited",
        "meta_analysis_started",
        "meta_analysis_completed",
      ]),
    );
    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows).toHaveLength(1);
    expect(workflows[0].receivedMessage.channelId).toBe("facebook_comment");
  });

  it("records Facebook comment removals without creating analysis workflows", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createFacebookCommentPayload("comment-remove-1", "remove"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toContain(
      "facebook_comment_removed",
    );
    expect(await listIntegrationWorkflowRecords()).toHaveLength(0);
  });

  it("persists Instagram comment lifecycle", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createInstagramCommentPayload("ig-comment-1"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "instagram_comment_received",
        "meta_analysis_started",
        "meta_analysis_completed",
        "meta_suggested",
      ]),
    );
    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows[0].provider).toBe("instagram");
    expect(workflows[0].receivedMessage.channelId).toBe("instagram_comment");
  });

  it("persists Instagram mention lifecycle", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createInstagramMentionPayload("ig-mention-1"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "instagram_mention_received",
        "meta_analysis_started",
        "meta_analysis_completed",
      ]),
    );
    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows[0].provider).toBe("instagram");
    expect(workflows[0].receivedMessage.channelId).toBe("instagram_comment");
  });

  it("deduplicates Meta events without creating duplicate workflows", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createMetaPayload("page", "duplicate-mid"));
    const request = () =>
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      });

    expect((await POST(request())).status).toBe(200);
    expect((await POST(request())).status).toBe(200);

    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows).toHaveLength(1);
    const events = await listIntegrationEventLogEntries();
    expect(
      events.some(
        (event) =>
          event.eventType === "meta_payload_unsupported" &&
          event.processingStatus === "ignored",
      ),
    ).toBe(true);
  });

  it("deduplicates Facebook comment deliveries by hashed comment id", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createFacebookCommentPayload("duplicate-comment", "add"));
    const request = () =>
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      });

    expect((await POST(request())).status).toBe(200);
    expect((await POST(request())).status).toBe(200);

    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows).toHaveLength(1);
    const events = await listIntegrationEventLogEntries();
    expect(
      events.some(
        (event) =>
          event.eventType === "meta_comment_unsupported" &&
          event.processingStatus === "ignored" &&
          event.errorSummary === "duplicate_event",
      ),
    ).toBe(true);
  });

  it("records malformed comment changes without analysis", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify({
      object: "page",
      entry: [
        {
          id: "page-1",
          changes: [
            {
              field: "feed",
              value: { item: "comment", verb: "add", comment_id: "bad-comment" },
            },
          ],
        },
      ],
    });
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events[0]).toMatchObject({
      eventType: "meta_comment_unsupported",
      processingStatus: "ignored",
      errorSummary: "missing_change_text",
    });
    expect(await listIntegrationWorkflowRecords()).toHaveLength(0);
    expect(JSON.stringify(events)).not.toContain("bad-comment");
  });

  it("records unsupported payloads without storing private message text", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify({
      object: "page",
      entry: [{ id: "page-1", messaging: [{ message: { is_echo: true } }] }],
    });
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events[0].eventType).toBe("meta_payload_unsupported");
    expect(JSON.stringify(events)).not.toContain("private message");
  });

  it("handles persistence failure without logging secrets or payloads", async () => {
    process.env.META_APP_SECRET = "app-secret";
    const errors: string[] = [];
    const originalConsoleError = console.error;
    console.error = (message?: unknown) => {
      errors.push(String(message));
    };
    setIntegrationEventRepositoryForTests(new FailingIntegrationEventRepository());
    const body = JSON.stringify(createMetaPayload("page", "facebook-mid"));

    try {
      const response = await POST(
        new Request("http://localhost/api/webhooks/meta", {
          method: "POST",
          headers: { "x-hub-signature-256": sign(body) },
          body,
        }),
      );

      expect(response.status).toBe(200);
      expect(errors).toEqual([]);
      expect(JSON.stringify(errors)).not.toContain("app-secret");
      expect(JSON.stringify(errors)).not.toContain("Hello Meta");
    } finally {
      console.error = originalConsoleError;
    }
  });
});

function createMetaPayload(object: "page" | "instagram", messageId: string) {
  return {
    object,
    entry: [
      {
        id: object === "instagram" ? "ig-1" : "page-1",
        time: 1,
        messaging: [
          {
            sender: { id: "sender-1" },
            recipient: { id: object === "instagram" ? "ig-1" : "page-1" },
            timestamp: 1,
            message: { mid: messageId, text: "Hello Meta" },
          },
        ],
      },
    ],
  };
}

function createFacebookCommentPayload(
  commentId: string,
  verb: "add" | "edited" | "remove",
) {
  return {
    object: "page",
    entry: [
      {
        id: "page-1",
        changes: [
          {
            field: "feed",
            value: {
              item: "comment",
              verb,
              comment_id: commentId,
              post_id: "post-1",
              parent_id: "parent-1",
              sender_id: "sender-1",
              message:
                verb === "remove" ? undefined : "A Facebook page comment",
              created_time: "2026-07-21T12:00:00+0000",
            },
          },
        ],
      },
    ],
  };
}

function createInstagramCommentPayload(commentId: string) {
  return {
    object: "instagram",
    entry: [
      {
        id: "ig-1",
        changes: [
          {
            field: "comments",
              value: {
                id: commentId,
                media_id: "media-1",
                from: { id: "ig-user-1" },
                text: "An Instagram comment",
                timestamp: "2026-07-21T12:00:00+0000",
              },
            },
        ],
      },
    ],
  };
}

function createInstagramMentionPayload(commentId: string) {
  return {
    object: "instagram",
    entry: [
      {
        id: "ig-1",
        changes: [
          {
            field: "mentions",
            value: {
              comment_id: commentId,
              media_id: "media-1",
              from: { id: "ig-user-1", username: "customer" },
              text: "@agenticops support question",
            },
          },
        ],
      },
    ],
  };
}

function sign(body: string) {
  const signature = createHmac("sha256", "app-secret")
    .update(body)
    .digest("hex");
  return `sha256=${signature}`;
}

class FailingIntegrationEventRepository implements IntegrationEventRepository {
  async appendEvent() {
    throw new Error("storage failed");
  }

  async listEvents() {
    return [];
  }

  async saveWorkflow() {
    throw new Error("storage failed");
  }

  async getWorkflow() {
    return null;
  }

  async listWorkflows() {
    return [];
  }
}
