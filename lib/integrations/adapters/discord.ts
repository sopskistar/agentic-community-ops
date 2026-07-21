import { createHash } from "crypto";
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
  const externalId = hashDiscordIdentifier(message.id);
  const channelId = hashDiscordIdentifier(message.channelId);

  return {
    id: createIntegrationMessageId("discord", externalId),
    externalId,
    source: "discord",
    channelId,
    conversationId: channelId,
    senderId: hashDiscordIdentifier(message.author.id),
    senderName: message.author.username,
    text: message.content,
    timestamp: new Date(message.createdTimestamp ?? Date.now()).toISOString(),
    metadata: {
      guildId: hashDiscordIdentifier(message.guildId),
    },
  } satisfies NormalizedCommunicationMessage;
}

function hashDiscordIdentifier(value: string) {
  return createHash("sha256")
    .update(`discord:${value}`)
    .digest("hex")
    .slice(0, 32);
}
