import { z } from "zod";

export const communicationSources = [
  "discord",
  "telegram",
  "gmail",
  "facebook",
  "instagram",
  "website",
  "manual",
] as const;

export type CommunicationSource = (typeof communicationSources)[number];

export const normalizedCommunicationMessageSchema = z.object({
  id: z.string().trim().min(1).max(240),
  externalId: z.string().trim().min(1).max(240).optional(),
  source: z.enum(communicationSources),
  channelId: z.string().trim().min(1).max(240).optional(),
  conversationId: z.string().trim().min(1).max(240).optional(),
  senderId: z.string().trim().min(1).max(240).optional(),
  senderName: z.string().trim().min(1).max(240).optional(),
  text: z.string().trim().min(1).max(20_000),
  timestamp: z.iso.datetime(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type NormalizedCommunicationMessage = z.infer<
  typeof normalizedCommunicationMessageSchema
>;

export function validateNormalizedMessage(input: unknown) {
  return normalizedCommunicationMessageSchema.parse(input);
}

export function createIntegrationMessageId(
  source: CommunicationSource,
  externalId: string | number,
) {
  return `${source}:${String(externalId)}`;
}
