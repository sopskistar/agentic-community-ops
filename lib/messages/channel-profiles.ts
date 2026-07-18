import { z } from "zod";

import { messageSourceSchema } from "./schemas";
import type { MessageSource } from "./constants";

export const channelProfileSchema = z.object({
  source: messageSourceSchema,
  displayName: z.string().trim().min(1),
  typicalMessageStyle: z.string().trim().min(1),
  conversationCharacteristics: z.string().trim().min(1),
  businessContext: z.string().trim().min(1),
  securityPriorities: z.array(z.string().trim().min(1)).min(1),
  defaultAnalysisPriorities: z.array(z.string().trim().min(1)).min(1),
  relatedSources: z.array(messageSourceSchema).default([]),
});

export type ChannelProfile = z.infer<typeof channelProfileSchema>;

export const channelProfiles = [
  {
    source: "Discord",
    displayName: "Discord",
    typicalMessageStyle:
      "Fast community chat with handles, roles, channels, mentions, links and short support requests.",
    conversationCharacteristics:
      "Messages are usually channel-scoped, high-volume and interleaved with other users.",
    businessContext:
      "Web3 community moderation, launch support, incident handling and project announcements.",
    securityPriorities: [
      "Fake administrator detection",
      "Direct-message support scams",
      "Wallet-connection and token-claim links",
      "Credential and seed phrase requests",
    ],
    defaultAnalysisPriorities: [
      "Security risk",
      "Support intent",
      "Abuse or spam",
      "Escalation requirement",
    ],
    relatedSources: [],
  },
  {
    source: "Telegram",
    displayName: "Telegram",
    typicalMessageStyle:
      "High-volume chat with usernames, forwarded content, links, bot messages and direct support claims.",
    conversationCharacteristics:
      "Group and direct-message contexts may differ sharply and require source metadata.",
    businessContext:
      "Community support, launch communication, moderation queues and user education.",
    securityPriorities: [
      "Impersonation",
      "Unsolicited direct-message support",
      "Obfuscated URLs",
      "Wallet verification scams",
    ],
    defaultAnalysisPriorities: [
      "Security risk",
      "Spam",
      "Complaint detection",
      "Escalation requirement",
    ],
    relatedSources: [],
  },
  {
    source: "Facebook",
    displayName: "Facebook Pages",
    typicalMessageStyle:
      "Page messages, comments and visitor inquiries with profile identifiers and thread context.",
    conversationCharacteristics:
      "Business conversations are usually customer-service oriented and tied to a page inbox.",
    businessContext:
      "Customer support, complaints, lead capture, campaign responses and account questions.",
    securityPriorities: [
      "Phishing links",
      "Account-security requests",
      "Abuse",
      "External-link safety",
    ],
    defaultAnalysisPriorities: [
      "Customer intent",
      "Sentiment",
      "Priority",
      "Escalation requirement",
    ],
    relatedSources: [],
  },
  {
    source: "Instagram",
    displayName: "Instagram Business",
    typicalMessageStyle:
      "Short direct messages, story replies, comments, emoji-heavy content and product questions.",
    conversationCharacteristics:
      "Threads often start from social content and may include sales, support or brand feedback.",
    businessContext:
      "Customer engagement, sales leads, complaints, feedback and lightweight support.",
    securityPriorities: [
      "Impersonation",
      "Phishing links",
      "Abusive content",
      "Sensitive account requests",
    ],
    defaultAnalysisPriorities: [
      "Purchase intent",
      "Lead detection",
      "Sentiment",
      "Escalation requirement",
    ],
    relatedSources: [],
  },
  {
    source: "Email",
    displayName: "Email",
    typicalMessageStyle:
      "Longer messages with subjects, signatures, quoted replies, attachments and formal support detail.",
    conversationCharacteristics:
      "Threaded conversations can include historical quoted text and multiple recipients.",
    businessContext:
      "Support tickets, complaints, sales inquiries, partnerships and document-heavy requests.",
    securityPriorities: [
      "Phishing",
      "Malicious attachments",
      "Payment or recovery scams",
      "Sensitive data exposure",
    ],
    defaultAnalysisPriorities: [
      "Support intent",
      "Priority",
      "Summary",
      "Recommended actions",
    ],
    relatedSources: [],
  },
  {
    source: "WebsiteChat",
    displayName: "Website Live Chat",
    typicalMessageStyle:
      "Short session-based messages from anonymous or identified website visitors.",
    conversationCharacteristics:
      "Conversations are real-time, sequential and tied to a browser session or visitor profile.",
    businessContext:
      "Support, lead qualification, FAQ handling, sales assistance and escalation routing.",
    securityPriorities: [
      "Credential requests",
      "Abuse",
      "Suspicious links",
      "High-risk support issues",
    ],
    defaultAnalysisPriorities: [
      "Intent",
      "FAQ detection",
      "Lead detection",
      "Reply eligibility",
    ],
    relatedSources: [],
  },
  {
    source: "UploadedDocument",
    displayName: "Uploaded Documents",
    typicalMessageStyle:
      "Extracted text from uploaded files, tabular imports or pasted documents with limited sender context.",
    conversationCharacteristics:
      "Input may represent one message, many rows, a full transcript, or a document with attachments.",
    businessContext:
      "Bulk analysis, document intelligence, support backlogs, security reviews and BI reporting.",
    securityPriorities: [
      "Unsafe extracted links",
      "Credential requests",
      "Fraud patterns",
      "Parser and metadata boundaries",
    ],
    defaultAnalysisPriorities: [
      "Document summary",
      "Intent extraction",
      "Risk classification",
      "Batch reporting",
    ],
    relatedSources: ["CSV", "Excel", "PDF", "Word", "PlainText"],
  },
] satisfies ChannelProfile[];

export const channelProfilesBySource = Object.fromEntries(
  channelProfiles.map((profile) => [profile.source, profile]),
) as Partial<Record<MessageSource, ChannelProfile>>;
