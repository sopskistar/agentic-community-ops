import { type NormalizedCommunicationMessage, createIntegrationMessageId } from "../normalized";

export type GmailMessageSummary = {
  id: string;
  threadId: string;
  subject?: string;
  sender?: string;
  receivedAt: string;
  snippet: string;
  labelIds: string[];
};

export function normalizeGmailMessage(
  message: GmailMessageSummary,
): NormalizedCommunicationMessage {
  return {
    id: createIntegrationMessageId("gmail", message.id),
    externalId: message.id,
    source: "gmail",
    channelId: "gmail-inbox",
    conversationId: message.threadId,
    senderName: message.sender,
    text: [message.subject, message.snippet].filter(Boolean).join("\n\n"),
    timestamp: message.receivedAt,
    metadata: {
      threadId: message.threadId,
      subject: message.subject,
      labelIds: message.labelIds,
    },
  };
}
