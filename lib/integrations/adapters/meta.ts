import { z } from "zod";

import {
  createIntegrationMessageId,
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
              })
              .optional(),
          }),
        )
        .optional(),
      changes: z.array(z.unknown()).optional(),
    }),
  ),
});

export function normalizeMetaWebhookPayload(input: unknown) {
  const payload = metaWebhookSchema.parse(input);
  const source = payload.object === "instagram" ? "instagram" : "facebook";
  const messages: NormalizedCommunicationMessage[] = [];

  for (const entry of payload.entry) {
    for (const event of entry.messaging ?? []) {
      if (!event.message?.text || event.message.is_echo) {
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
    }
  }

  return messages;
}
