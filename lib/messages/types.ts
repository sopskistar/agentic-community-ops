import type {
  AuditEventType,
  IntentCategory,
  MessageSource,
  PriorityLevel,
  RecipientType,
  ReplyState,
  RiskLevel,
  SenderRole,
  SentimentLabel,
} from "./constants";

export type MessageMetadata = Record<string, unknown>;

export type Attachment = {
  attachmentId: string;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  storageKey?: string;
  extractedText?: string;
  metadata?: MessageMetadata;
};

export type Sender = {
  senderId?: string;
  externalId?: string;
  displayName?: string;
  username?: string;
  email?: string;
  role?: SenderRole;
  isVerified?: boolean;
  metadata?: MessageMetadata;
};

export type Recipient = {
  recipientId?: string;
  externalId?: string;
  displayName?: string;
  type?: RecipientType;
  metadata?: MessageMetadata;
};

export type ReplyRecommendation = {
  replyId: string;
  state: ReplyState;
  suggestedContent?: string;
  approvedContent?: string;
  rationale?: string;
  requiresHumanApproval: boolean;
  generatedAt?: string;
  approvedAt?: string;
  sentAt?: string;
  metadata?: MessageMetadata;
};

export type AnalysisResult = {
  analysisId: string;
  riskLevel: RiskLevel;
  intentCategories: IntentCategory[];
  detectedIntent?: string;
  sentiment?: SentimentLabel;
  priority?: PriorityLevel;
  summary?: string;
  recommendedActions: string[];
  confidence?: number;
  shouldEscalate: boolean;
  evidence: string[];
  metadata?: MessageMetadata;
};

export type AuditEvent = {
  eventId: string;
  type: AuditEventType;
  timestamp: string;
  actorId?: string;
  actorType?: "System" | "User" | "AI" | "Integration";
  description?: string;
  metadata?: MessageMetadata;
};

export type Conversation = {
  conversationId: string;
  organizationId?: string;
  source: MessageSource;
  externalConversationId?: string;
  subject?: string;
  participantIds: string[];
  startedAt?: string;
  lastMessageAt?: string;
  metadata?: MessageMetadata;
};

export type NormalizedMessage = {
  messageId: string;
  conversationId: string;
  organizationId?: string;
  projectId?: string;
  source: MessageSource;
  externalMessageId?: string;
  externalConversationId?: string;
  sender: Sender;
  recipient: Recipient[];
  timestamp: string;
  receivedAt?: string;
  subject?: string;
  content: string;
  normalizedContent: string;
  attachments: Attachment[];
  metadata: MessageMetadata;
  language?: string;
  analysis?: AnalysisResult;
  replyState: ReplyState;
  replyRecommendation?: ReplyRecommendation;
  audit: {
    createdAt: string;
    updatedAt: string;
    events: AuditEvent[];
  };
};
