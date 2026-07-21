import { z } from "zod";

import {
  createIntegrationMessageId,
  type CommunicationSource,
  type NormalizedCommunicationMessage,
} from "../normalized";

const metaWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string().optional(),
      time: z.number().optional(),
      messaging: z
        .array(
          z.object({
            sender: z.object({ id: z.string() }).optional(),
            recipient: z.object({ id: z.string() }).optional(),
            timestamp: z.number().optional(),
            message: z
              .object({
                mid: z.string().optional(),
                text: z.string().optional(),
                is_echo: z.boolean().optional(),
                is_deleted: z.boolean().optional(),
                is_unsupported: z.boolean().optional(),
              })
              .passthrough()
              .optional(),
          }),
        )
        .optional(),
      changes: z.array(z.unknown()).optional(),
    }),
  ),
});

export function normalizeMetaWebhookPayload(input: unknown) {
  return inspectMetaWebhookPayload(input).messages;
}

export type MetaWebhookDiagnostic = {
  provider: "meta" | "facebook" | "instagram";
  eventType:
    | "meta_payload_unsupported"
    | "facebook_message_received"
    | "instagram_message_received";
  externalId?: string;
  reason?: string;
};

export function inspectMetaWebhookPayload(input: unknown) {
  const payload = metaWebhookSchema.parse(input);
  const source = detectMetaSource(payload.object);
  const messages: NormalizedCommunicationMessage[] = [];
  const diagnostics: MetaWebhookDiagnostic[] = [];

  for (const entry of payload.entry) {
    if (!entry.messaging?.length) {
      diagnostics.push({
        provider: source,
        eventType: "meta_payload_unsupported",
        reason: entry.changes?.length ? "changes_event" : "missing_messaging",
      });
    }

    for (const event of entry.messaging ?? []) {
      if (event.message?.is_echo) {
        diagnostics.push({
          provider: source,
          eventType: "meta_payload_unsupported",
          externalId: event.message.mid,
          reason: "message_echo",
        });
        continue;
      }

      if (!event.message?.text) {
        diagnostics.push({
          provider: source,
          eventType: "meta_payload_unsupported",
          externalId: event.message?.mid,
          reason: event.message?.is_unsupported
            ? "unsupported_message"
            : "missing_text",
        });
        continue;
      }

      const externalId =
        event.message.mid ??
        `${entry.id ?? "entry"}:${event.sender?.id ?? "sender"}:${event.timestamp ?? Date.now()}`;

      messages.push({
        id: createIntegrationMessageId(source, externalId),
        externalId,
        source,
        channelId: entry.id,
        conversationId: event.sender?.id,
        senderId: event.sender?.id,
        text: event.message.text,
        timestamp: new Date(event.timestamp ?? entry.time ?? Date.now()).toISOString(),
        metadata: {
          object: payload.object,
          recipientId: event.recipient?.id,
          entryId: entry.id,
        },
      });
      diagnostics.push({
        provider: source,
        eventType:
          source === "instagram"
            ? "instagram_message_received"
            : "facebook_message_received",
        externalId,
      });
    }
  }

  return { messages, diagnostics };
}

function detectMetaSource(object: string): Extract<
  CommunicationSource,
  "facebook" | "instagram"
> {
  return object.toLowerCase() === "instagram" ? "instagram" : "facebook";
}
