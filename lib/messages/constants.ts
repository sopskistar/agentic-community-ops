export const messageSources = [
  "Discord",
  "Telegram",
  "Facebook",
  "Instagram",
  "Email",
  "WebsiteChat",
  "UploadedDocument",
  "CSV",
  "Excel",
  "PDF",
  "Word",
  "PlainText",
] as const;

export type MessageSource = (typeof messageSources)[number];

export const riskLevels = [
  "Safe",
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export type RiskLevel = (typeof riskLevels)[number];

export const intentCategories = [
  "Scam",
  "Spam",
  "Phishing",
  "FakeAdmin",
  "SeedPhraseRequest",
  "WalletRequest",
  "SupportRequest",
  "FAQ",
  "Complaint",
  "PurchaseIntent",
  "Lead",
  "Feedback",
  "Abuse",
  "Unknown",
] as const;

export type IntentCategory = (typeof intentCategories)[number];

export const replyStates = [
  "None",
  "Suggested",
  "Approved",
  "AutoSent",
  "Escalated",
] as const;

export type ReplyState = (typeof replyStates)[number];

export const auditEventTypes = [
  "MessageReceived",
  "AnalysisStarted",
  "AnalysisCompleted",
  "ReplySuggested",
  "ReplyApproved",
  "ReplySent",
  "Escalated",
  "Closed",
] as const;

export type AuditEventType = (typeof auditEventTypes)[number];

export const senderRoles = [
  "Customer",
  "CommunityMember",
  "Admin",
  "Moderator",
  "Agent",
  "System",
  "Unknown",
] as const;

export type SenderRole = (typeof senderRoles)[number];

export const recipientTypes = [
  "User",
  "Channel",
  "Page",
  "Inbox",
  "Group",
  "System",
  "Unknown",
] as const;

export type RecipientType = (typeof recipientTypes)[number];

export const sentimentLabels = [
  "Positive",
  "Neutral",
  "Negative",
  "Mixed",
  "Unknown",
] as const;

export type SentimentLabel = (typeof sentimentLabels)[number];

export const priorityLevels = ["Low", "Normal", "High", "Urgent"] as const;

export type PriorityLevel = (typeof priorityLevels)[number];
