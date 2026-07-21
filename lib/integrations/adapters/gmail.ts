import { createHash } from "crypto";

import { type NormalizedCommunicationMessage, createIntegrationMessageId } from "../normalized";

export type GmailMessageSummary = {
  id: string;
  threadId: string;
  subject?: string;
  sender?: string;
  recipient?: string;
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
      channelType: "email",
      threadId: message.threadId,
      subject: message.subject,
      recipient: message.recipient,
      labelIds: message.labelIds,
      previewLength: message.snippet.length,
    },
  };
}

export function hashGmailIdentifier(value: string) {
  return createHash("sha256").update(`gmail:${value}`).digest("hex").slice(0, 32);
}

export function sanitizeGmailText(value: string | undefined, maxLength = 500) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeGmailAddress(value: string | undefined) {
  const sanitized = sanitizeGmailText(value, 180);
  if (!sanitized) {
    return undefined;
  }

  return sanitized.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => {
    const [local, domain] = email.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  });
}
