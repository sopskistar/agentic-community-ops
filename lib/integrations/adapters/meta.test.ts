import { describe, expect, it } from "vitest";

import { inspectMetaWebhookPayload, normalizeMetaWebhookPayload } from "./meta";

describe("Meta webhook normalization", () => {
  it("normalizes Facebook Messenger text messages", () => {
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
      id: "facebook:mid-1",
      externalId: "mid-1",
      source: "facebook",
      channelId: "page-1",
      conversationId: "sender-1",
      text: "Hello Facebook",
    });
  });

  it("normalizes Instagram Messaging text messages", () => {
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
      id: "instagram:ig-mid-1",
      externalId: "ig-mid-1",
      source: "instagram",
      channelId: "ig-1",
      conversationId: "ig-sender",
      text: "Hello Instagram",
    });
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
