import { z } from "zod";

import {
  createIntegrationMessageId,
  type NormalizedCommunicationMessage,
} from "../normalized";

const telegramUpdateSchema = z.object({
  update_id: z.number().int(),
  message: z
    .object({
      message_id: z.number().int(),
      date: z.number().int(),
      text: z.string().optional(),
      from: z
        .object({
          id: z.number().int(),
          is_bot: z.boolean().optional(),
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          username: z.string().optional(),
        })
        .optional(),
      chat: z.object({
        id: z.number().int(),
        type: z.string(),
        title: z.string().optional(),
        username: z.string().optional(),
      }),
    })
    .optional(),
});

export type TelegramUpdate = z.infer<typeof telegramUpdateSchema>;

export function normalizeTelegramUpdate(input: unknown) {
  const update = telegramUpdateSchema.parse(input);

  if (!update.message?.text || update.message.from?.is_bot) {
    return null;
  }

  const senderName = [
    update.message.from?.first_name,
    update.message.from?.last_name,
  ]
    .filter(Boolean)
    .join(" ");
  const externalId = String(update.update_id);

  return {
    id: createIntegrationMessageId("telegram", externalId),
    externalId,
    source: "telegram",
    channelId: String(update.message.chat.id),
    conversationId: String(update.message.chat.id),
    senderId: update.message.from ? String(update.message.from.id) : undefined,
    senderName:
      update.message.from?.username ?? (senderName || update.message.chat.title),
    text: update.message.text,
    timestamp: new Date(update.message.date * 1000).toISOString(),
    metadata: {
      messageId: update.message.message_id,
      chatType: update.message.chat.type,
      updateId: update.update_id,
    },
  } satisfies NormalizedCommunicationMessage;
}
