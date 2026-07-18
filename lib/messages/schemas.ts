import { z } from "zod";

import {
  auditEventTypes,
  intentCategories,
  messageSources,
  priorityLevels,
  recipientTypes,
  replyStates,
  riskLevels,
  senderRoles,
  sentimentLabels,
} from "./constants";

const metadataSchema = z.record(z.string(), z.unknown());
const optionalMetadataSchema = metadataSchema.optional();

export const messageSourceSchema = z.enum(messageSources);
export const riskLevelSchema = z.enum(riskLevels);
export const intentCategorySchema = z.enum(intentCategories);
export const replyStateSchema = z.enum(replyStates);
export const auditEventTypeSchema = z.enum(auditEventTypes);
export const senderRoleSchema = z.enum(senderRoles);
export const recipientTypeSchema = z.enum(recipientTypes);
export const sentimentLabelSchema = z.enum(sentimentLabels);
export const priorityLevelSchema = z.enum(priorityLevels);

export const attachmentSchema = z.object({
  attachmentId: z.string().trim().min(1),
  filename: z.string().trim().min(1).max(255).optional(),
  mimeType: z.string().trim().min(1).max(200).optional(),
  sizeBytes: z.number().int().min(0).optional(),
  url: z.url().optional(),
  storageKey: z.string().trim().min(1).max(500).optional(),
  extractedText: z.string().trim().max(200_000).optional(),
  metadata: optionalMetadataSchema,
});

export const senderSchema = z.object({
  senderId: z.string().trim().min(1).max(200).optional(),
  externalId: z.string().trim().min(1).max(200).optional(),
  displayName: z.string().trim().min(1).max(200).optional(),
  username: z.string().trim().min(1).max(200).optional(),
  email: z.email().optional(),
  role: senderRoleSchema.optional(),
  isVerified: z.boolean().optional(),
  metadata: optionalMetadataSchema,
});

export const recipientSchema = z.object({
  recipientId: z.string().trim().min(1).max(200).optional(),
  externalId: z.string().trim().min(1).max(200).optional(),
  displayName: z.string().trim().min(1).max(200).optional(),
  type: recipientTypeSchema.optional(),
  metadata: optionalMetadataSchema,
});

export const replyRecommendationSchema = z.object({
  replyId: z.string().trim().min(1),
  state: replyStateSchema,
  suggestedContent: z.string().trim().min(1).max(10_000).optional(),
  approvedContent: z.string().trim().min(1).max(10_000).optional(),
  rationale: z.string().trim().min(1).max(5_000).optional(),
  requiresHumanApproval: z.boolean(),
  generatedAt: z.iso.datetime().optional(),
  approvedAt: z.iso.datetime().optional(),
  sentAt: z.iso.datetime().optional(),
  metadata: optionalMetadataSchema,
});

export const analysisResultSchema = z.object({
  analysisId: z.string().trim().min(1),
  riskLevel: riskLevelSchema,
  intentCategories: z.array(intentCategorySchema).min(1),
  detectedIntent: z.string().trim().min(1).max(1_000).optional(),
  sentiment: sentimentLabelSchema.optional(),
  priority: priorityLevelSchema.optional(),
  summary: z.string().trim().min(1).max(5_000).optional(),
  recommendedActions: z.array(z.string().trim().min(1).max(1_000)).default([]),
  confidence: z.number().min(0).max(1).optional(),
  shouldEscalate: z.boolean(),
  evidence: z.array(z.string().trim().min(1).max(2_000)).default([]),
  metadata: optionalMetadataSchema,
});

export const auditEventSchema = z.object({
  eventId: z.string().trim().min(1),
  type: auditEventTypeSchema,
  timestamp: z.iso.datetime(),
  actorId: z.string().trim().min(1).max(200).optional(),
  actorType: z.enum(["System", "User", "AI", "Integration"]).optional(),
  description: z.string().trim().min(1).max(2_000).optional(),
  metadata: optionalMetadataSchema,
});

export const conversationSchema = z.object({
  conversationId: z.string().trim().min(1).max(200),
  organizationId: z.string().trim().min(1).max(200).optional(),
  source: messageSourceSchema,
  externalConversationId: z.string().trim().min(1).max(200).optional(),
  subject: z.string().trim().min(1).max(500).optional(),
  participantIds: z.array(z.string().trim().min(1).max(200)).default([]),
  startedAt: z.iso.datetime().optional(),
  lastMessageAt: z.iso.datetime().optional(),
  metadata: optionalMetadataSchema,
});

export const normalizedMessageSchema = z.object({
  messageId: z.string().trim().min(1).max(200),
  conversationId: z.string().trim().min(1).max(200),
  organizationId: z.string().trim().min(1).max(200).optional(),
  projectId: z.string().trim().min(1).max(200).optional(),
  source: messageSourceSchema,
  externalMessageId: z.string().trim().min(1).max(200).optional(),
  externalConversationId: z.string().trim().min(1).max(200).optional(),
  sender: senderSchema,
  recipient: z.array(recipientSchema).default([]),
  timestamp: z.iso.datetime(),
  receivedAt: z.iso.datetime().optional(),
  subject: z.string().trim().min(1).max(500).optional(),
  content: z.string().trim().min(1).max(200_000),
  normalizedContent: z.string().trim().min(1).max(200_000),
  attachments: z.array(attachmentSchema).default([]),
  metadata: metadataSchema.default({}),
  language: z.string().trim().min(2).max(35).optional(),
  analysis: analysisResultSchema.optional(),
  replyState: replyStateSchema,
  replyRecommendation: replyRecommendationSchema.optional(),
  audit: z.object({
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    events: z.array(auditEventSchema).default([]),
  }),
});

export type NormalizedMessageInput = z.input<typeof normalizedMessageSchema>;
