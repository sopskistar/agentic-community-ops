import { describe, expect, it } from "vitest";

import { inspectMetaWebhookPayload, normalizeMetaWebhookPayload } from "./meta";

describe("Meta webhook normalization", () => {
  it("normalizes Facebook Messenger text messages with hashed IDs", () => {
    const messages = normalizeMetaWebhookPayload({
      object: "page",
      entry: [
        {
          id: "page-1",
          time: 1,
          messaging: [
            {
              sender: { id: "sender-1" },
              recipient: { id: "page-1" },
              timestamp: 1,
              message: { mid: "mid-1", text: "Hello Facebook" },
            },
          ],
        },
      ],
    });

    expect(messages[0]).toMatchObject({
      source: "facebook",
      channelId: "messenger",
      text: "Hello Facebook",
      metadata: expect.objectContaining({ channel: "messenger", kind: "message" }),
    });
    expect(messages[0].id).toMatch(/^facebook:[a-f0-9]{32}$/);
    expect(messages[0].externalId).not.toBe("mid-1");
    expect(messages[0].senderId).not.toBe("sender-1");
  });

  it("normalizes Instagram Direct Messages", () => {
    const messages = normalizeMetaWebhookPayload({
      object: "instagram",
      entry: [
        {
          id: "ig-1",
          messaging: [
            {
              sender: { id: "ig-sender" },
              recipient: { id: "ig-1" },
              timestamp: 1,
              message: { mid: "ig-mid-1", text: "Hello Instagram" },
            },
          ],
        },
      ],
    });

    expect(messages[0]).toMatchObject({
      source: "instagram",
      channelId: "instagram",
      text: "Hello Instagram",
      metadata: expect.objectContaining({ channel: "instagram", kind: "message" }),
    });
  });

  it("normalizes Facebook Page comment add payloads", () => {
    const result = inspectMetaWebhookPayload({
      object: "page",
      entry: [
        {
          id: "page-1",
          changes: [
            {
              field: "feed",
              value: {
                item: "comment",
                verb: "add",
                comment_id: "comment-1",
                post_id: "post-1",
                parent_id: "parent-comment-1",
                from: { id: "sender-1", name: "Customer" },
                message: "<b>Great page</b>",
                created_time: "2026-07-21T12:00:00+0000",
              },
            },
          ],
        },
      ],
    });
    const messages = result.messages;

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        provider: "facebook",
        eventType: "facebook_comment_received",
        externalId: messages[0].externalId,
      }),
    );
    expect(messages[0]).toMatchObject({
      source: "facebook",
      channelId: "facebook_comment",
      text: "Great page",
      metadata: expect.objectContaining({
        channel: "facebook_comment",
        kind: "comment",
        field: "feed",
        verb: "add",
        item: "comment",
      }),
    });
    expect(messages[0].externalId).not.toBe("comment-1");
    expect(messages[0].senderId).not.toBe("sender-1");
  });

  it("normalizes Facebook Page comment edits", () => {
    const messages = normalizeMetaWebhookPayload({
      object: "page",
      entry: [
        {
          id: "page-1",
          changes: [
            {
              field: "feed",
              value: {
                item: "comment",
                verb: "edited",
                comment_id: "comment-1",
                post_id: "post-1",
                sender_id: "sender-1",
                message: "Updated Facebook page comment",
              },
            },
          ],
        },
      ],
    });

    expect(messages[0]).toMatchObject({
      source: "facebook",
      channelId: "facebook_comment",
      text: "Updated Facebook page comment",
      metadata: expect.objectContaining({
        channel: "facebook_comment",
        kind: "comment",
        verb: "edited",
      }),
    });
  });

  it("records Facebook Page comment removals without analysis messages", () => {
    const result = inspectMetaWebhookPayload({
      object: "page",
      entry: [
        {
          id: "page-1",
          changes: [
            {
              field: "feed",
              value: {
                item: "comment",
                verb: "remove",
                comment_id: "comment-removed",
                post_id: "post-1",
                sender_id: "sender-1",
              },
            },
          ],
        },
      ],
    });

    expect(result.messages).toHaveLength(0);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        provider: "facebook",
        eventType: "facebook_comment_removed",
        reason: "comment_removed",
      }),
    ]);
    expect(result.diagnostics[0].externalId).not.toBe("comment-removed");
  });

  it("normalizes Instagram comments", () => {
    const result = inspectMetaWebhookPayload({
      object: "instagram",
      entry: [
        {
          id: "ig-1",
          changes: [
            {
              field: "comments",
              value: {
                id: "ig-comment-1",
                media_id: "media-1",
                from: { id: "ig-user-1" },
                text: "Nice post",
                timestamp: "2026-07-21T12:00:00+0000",
              },
            },
          ],
        },
      ],
    });
    const messages = result.messages;

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        provider: "instagram",
        eventType: "instagram_comment_received",
        externalId: messages[0].externalId,
      }),
    );
    expect(messages[0]).toMatchObject({
      source: "instagram",
      channelId: "instagram_comment",
      text: "Nice post",
      metadata: expect.objectContaining({
        channel: "instagram_comment",
        kind: "comment",
      }),
    });
  });

  it("normalizes Instagram mention payloads", () => {
    const result = inspectMetaWebhookPayload({
      object: "instagram",
      entry: [
        {
          id: "ig-1",
          changes: [
            {
              field: "mentions",
              value: {
                comment_id: "ig-mention-comment-1",
                media_id: "media-1",
                from: { id: "ig-user-1", username: "customer" },
                text: "@agenticops can you help?",
              },
            },
          ],
        },
      ],
    });

    expect(result.messages[0]).toMatchObject({
      source: "instagram",
      channelId: "instagram_comment",
      text: "@agenticops can you help?",
      metadata: expect.objectContaining({
        channel: "instagram_comment",
        kind: "mention",
      }),
    });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        eventType: "instagram_mention_received",
      }),
    );
  });

  it("reports malformed comment changes as comment-specific unsupported diagnostics", () => {
    const result = inspectMetaWebhookPayload({
      object: "page",
      entry: [
        {
          id: "page-1",
          changes: [
            {
              field: "feed",
              value: {
                item: "comment",
                verb: "add",
                comment_id: "comment-without-text",
              },
            },
          ],
        },
      ],
    });

    expect(result.messages).toHaveLength(0);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        eventType: "meta_comment_unsupported",
        reason: "missing_change_text",
      }),
    ]);
  });

  it("normalizes postbacks and reactions as analyzable events", () => {
    const result = inspectMetaWebhookPayload({
      object: "page",
      entry: [
        {
          id: "page-1",
          messaging: [
            {
              sender: { id: "sender-1" },
              postback: { mid: "postback-1", title: "Start", payload: "GET_STARTED" },
            },
            {
              sender: { id: "sender-1" },
              reaction: { mid: "reaction-1", action: "react", emoji: "👍" },
            },
          ],
        },
      ],
    });

    expect(result.messages.map((message) => message.metadata?.kind)).toEqual([
      "postback",
      "reaction",
    ]);
    expect(result.diagnostics).toHaveLength(2);
  });

  it("ignores echoes and reports unsupported diagnostics", () => {
    const result = inspectMetaWebhookPayload({
      object: "page",
      entry: [
        {
          id: "page-1",
          messaging: [
            {
              sender: { id: "page-1" },
              recipient: { id: "sender-1" },
              message: { mid: "echo-mid", text: "Echo", is_echo: true },
            },
            {
              sender: { id: "sender-1" },
              recipient: { id: "page-1" },
              message: { mid: "unsupported-mid", is_unsupported: true },
            },
          ],
        },
      ],
    });

    expect(result.messages).toHaveLength(0);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        eventType: "meta_payload_unsupported",
        reason: "message_echo",
      }),
      expect.objectContaining({
        eventType: "meta_payload_unsupported",
        reason: "unsupported_message",
      }),
    ]);
  });
});
