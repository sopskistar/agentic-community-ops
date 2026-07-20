import { z } from "zod";

import {
  createIntegrationMessageId,
  type NormalizedCommunicationMessage,
} from "../normalized";

const discordMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdTimestamp: z.number().int().optional(),
  channelId: z.string(),
  guildId: z.string().nullable().optional(),
  author: z.object({
    id: z.string(),
    username: z.string().optional(),
    bot: z.boolean().optional(),
  }),
});

export function normalizeDiscordMessage(input: unknown) {
  const message = discordMessageSchema.parse(input);

  if (message.author.bot || !message.guildId || !message.content.trim()) {
    return null;
  }

  return {
    id: createIntegrationMessageId("discord", message.id),
    externalId: message.id,
    source: "discord",
    channelId: message.channelId,
    conversationId: message.channelId,
    senderId: message.author.id,
    senderName: message.author.username,
    text: message.content,
    timestamp: new Date(message.createdTimestamp ?? Date.now()).toISOString(),
    metadata: {
      guildId: message.guildId,
    },
  } satisfies NormalizedCommunicationMessage;
}
