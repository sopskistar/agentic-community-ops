import { getGmailConnectionStatus } from "./google/gmail-service";
import { getDiscordWorkerStatus } from "./discord/status";
import {
  listIntegrationEventLogEntries,
  listIntegrationWorkflowRecords,
  type IntegrationEventLogEntry,
  type IntegrationWorkflowRecord,
} from "./event-log";
import { getMetaProviderStatus } from "./meta/status";

export const integrationStatusValues = [
  "Connected",
  "Active",
  "Webhook Verified",
  "Worker Online",
  "Configured",
  "Awaiting First Event",
  "Action Required",
  "Permission Required",
  "Provider Review Required",
  "Degraded",
  "Error",
  "Disconnected",
  "Available",
  "Planned",
] as const;

export type IntegrationStatus = (typeof integrationStatusValues)[number];

export type ProviderId =
  | "gmail"
  | "telegram"
  | "discord"
  | "facebook"
  | "instagram";

export type IntegrationProviderSummary = {
  id: ProviderId;
  name: string;
  category: string;
  status: IntegrationStatus;
  statusMeaning: string;
  lastSuccessfulEvent?: string;
  lastFailedEvent?: string;
  lastSynchronization?: string;
  lastHealthCheck?: string;
  recentEventCount: number;
  recentFailureCount: number;
  currentCapabilities: string[];
  currentPermissions: string[];
  limitations: string[];
  actionRequired: string;
  reviewRequired?: string;
  detailHref: string;
};

export type CommunicationInboxItem = {
  id: string;
  provider: string;
  providerMessageType: string;
  receivedAt: string;
  safeSenderReference: string;
  boundedPreview: string;
  analysisStatus: "Completed" | "Pending" | "Failed";
  riskLevel: string;
  intent: string;
  priority: string;
  sentiment: string;
  humanReviewStatus: string;
  suggestedActionAvailable: boolean;
};

export type ApprovalCenterItem = {
  id: string;
  workflowId: string;
  sourceProvider: string;
  sourceType: string;
  recommendationType: string;
  status: string;
  priority: string;
  risk: string;
  recommendation: string;
  explanation: string;
  confidence: string;
  requiredPermissions: string[];
  externalExecutionAvailability: "Unavailable";
  createdAt: string;
};

export type IntegrationWorkspaceData = {
  providers: IntegrationProviderSummary[];
  connectedProviders: IntegrationProviderSummary[];
  availableProviders: IntegrationProviderSummary[];
  plannedProviders: PlannedIntegrationGroup[];
  inbox: CommunicationInboxItem[];
  approvals: ApprovalCenterItem[];
  events: IntegrationEventLogEntry[];
  workflows: IntegrationWorkflowRecord[];
  metrics: {
    connectedProviders: number;
    activeProviders: number;
    messagesAnalyzed: number;
    highRiskMessages: number;
    pendingApprovals: number;
    providerProcessingFailures: number;
    gmailMessagesSynchronized: number;
    telegramEventsReceived: number;
    discordEventsReceived: number;
    metaEventsReceived: number;
    averageConfidence: string;
    humanReviewsCompleted: number;
  };
};

export type PlannedIntegrationGroup = {
  title: string;
  items: Array<{ name: string; status: "Planned" | "Future"; description: string }>;
};

const statusMeanings: Record<IntegrationStatus, string> = {
  Connected: "A durable OAuth or connection record exists and can be read successfully.",
  Active: "The provider has delivered or synchronized a successful event recently.",
  "Webhook Verified":
    "Webhook verification succeeded, but no supported provider event has necessarily been received.",
  "Worker Online": "A persistent worker recently reported healthy operation.",
  Configured:
    "Required environment values appear present, but connection success has not been proven.",
  "Awaiting First Event":
    "Verification or configuration succeeded, but no actual supported message event has been received.",
  "Action Required": "A setup or reconnect action is needed before reliable processing.",
  "Permission Required": "The integration exists but lacks required provider permissions.",
  "Provider Review Required":
    "The provider may require App Review, production approval or asset subscription before public traffic works.",
  Degraded: "The integration previously worked but recent processing failed.",
  Error: "A sanitized, actionable failure exists.",
  Disconnected: "No verifiable connection or activity exists.",
  Available: "Implementation support exists, but no active connection evidence is present.",
  Planned: "No production implementation currently exists.",
};

export async function getIntegrationWorkspaceData(): Promise<IntegrationWorkspaceData> {
  const [events, workflows, gmail, facebook, instagram, discord] =
    await Promise.all([
      safeListEvents(),
      safeListWorkflows(),
      getGmailConnectionStatus().catch(() => ({ status: "not_configured" as const })),
      getMetaProviderStatus("facebook"),
      getMetaProviderStatus("instagram"),
      getDiscordWorkerStatus(),
    ]);

  const providers = [
    createGmailProvider(gmail, events),
    createTelegramProvider(events),
    createDiscordProvider(discord, events),
    createFacebookProvider(facebook, events),
    createInstagramProvider(instagram, events),
  ];
  const connectedProviders = providers.filter((provider) =>
    ["Connected", "Active", "Webhook Verified", "Worker Online", "Degraded"].includes(
      provider.status,
    ),
  );
  const availableProviders = providers.filter((provider) =>
    ["Available", "Configured", "Awaiting First Event", "Action Required"].includes(
      provider.status,
    ),
  );
  const inbox = workflows.map(workflowToInboxItem);
  const approvals = workflows
    .filter((workflow) => workflow.suggestion || workflow.approval)
    .map(workflowToApprovalItem);

  return {
    providers,
    connectedProviders,
    availableProviders,
    plannedProviders: plannedIntegrationGroups,
    inbox,
    approvals,
    events,
    workflows,
    metrics: createMetrics({ providers, workflows, events, approvals }),
  };
}

export function workflowToInboxItem(
  workflow: IntegrationWorkflowRecord,
): CommunicationInboxItem {
  return {
    id: workflow.id,
    provider: providerLabel(workflow.provider),
    providerMessageType: String(
      workflow.receivedMessage.metadata?.channel ??
        workflow.receivedMessage.channelId ??
        workflow.receivedMessage.source,
    ),
    receivedAt: workflow.receivedMessage.timestamp,
    safeSenderReference:
      workflow.receivedMessage.senderName ??
      workflow.receivedMessage.senderId ??
      "Redacted sender",
    boundedPreview: workflow.receivedMessage.textPreview,
    analysisStatus: workflow.analysis
      ? "Completed"
      : workflow.status === "received"
        ? "Pending"
        : "Failed",
    riskLevel: workflow.analysis?.riskLevel ?? "Unknown",
    intent: workflow.analysis?.intent ?? "Unknown",
    priority: priorityFromRisk(workflow.analysis?.riskLevel),
    sentiment: "Not classified",
    humanReviewStatus: formatApprovalStatus(workflow.approval?.status ?? "pending"),
    suggestedActionAvailable: Boolean(workflow.suggestion),
  };
}

export function workflowToApprovalItem(
  workflow: IntegrationWorkflowRecord,
): ApprovalCenterItem {
  return {
    id: `approval:${workflow.id}`,
    workflowId: workflow.id,
    sourceProvider: providerLabel(workflow.provider),
    sourceType: workflow.receivedMessage.source,
    recommendationType: workflow.suggestion ? "Suggested reply" : "Risk alert",
    status: formatApprovalStatus(workflow.approval?.status ?? "pending"),
    priority: priorityFromRisk(workflow.analysis?.riskLevel),
    risk: workflow.analysis?.riskLevel ?? "Unknown",
    recommendation:
      workflow.suggestion?.suggestedAction ??
      workflow.analysis?.intent ??
      "Review this communication.",
    explanation:
      workflow.analysis?.explainability?.slice(0, 2).join(" ") ??
      "Human review is required before any external action.",
    confidence: "Requires human confirmation",
    requiredPermissions: ["Human approval", "Provider write permission for future execution"],
    externalExecutionAvailability: "Unavailable",
    createdAt: workflow.createdAt,
  };
}

export function formatApprovalStatus(status: string) {
  if (status === "approved") return "Approved Internally";
  if (status === "rejected") return "Rejected";
  if (status === "needs_more_information") return "Needs More Information";
  if (status === "resolved_internal") return "Resolved Internally";
  return "Pending Review";
}

export function providerLabel(provider: string) {
  if (provider === "gmail") return "Gmail";
  if (provider === "telegram") return "Telegram";
  if (provider === "discord") return "Discord";
  if (provider === "facebook") return "Facebook Messenger";
  if (provider === "instagram") return "Instagram";
  return provider;
}

function createGmailProvider(
  gmail: Awaited<ReturnType<typeof getGmailConnectionStatus>>,
  events: IntegrationEventLogEntry[],
): IntegrationProviderSummary {
  const lastSync = findEvent(events, "gmail", "gmail_sync_completed");
  const lastReceived = findEvent(events, "gmail", "gmail_message_received");
  const lastFailure = findProviderFailure(events, "gmail");
  const connected = gmail.status === "connected";
  const active = Boolean(lastSync || lastReceived);
  const status: IntegrationStatus = lastFailure
    ? "Degraded"
    : active
      ? "Active"
      : connected
        ? "Connected"
        : gmail.status === "reconnect_required"
          ? "Action Required"
          : gmail.status === "not_configured"
            ? "Available"
            : "Available";

  return {
    id: "gmail",
    name: "Gmail",
    category: "Email Intelligence",
    status,
    statusMeaning: statusMeanings[status],
    lastSuccessfulEvent: lastReceived?.timestamp,
    lastFailedEvent: lastFailure?.timestamp,
    lastSynchronization: lastSync?.timestamp,
    recentEventCount: countProviderEvents(events, "gmail"),
    recentFailureCount: countProviderFailures(events, "gmail"),
    currentCapabilities: [
      "Connect Gmail",
      "Read selected Gmail messages",
      "Manual sync",
      "Categorize and prioritize",
      "Detect phishing indicators",
      "Generate suggested reply outlines",
      "Persist analysis",
    ],
    currentPermissions: ["gmail.readonly"],
    limitations: ["No send", "No reply", "No archive", "No labels", "No delete", "No mailbox modification"],
    actionRequired:
      status === "Action Required"
        ? "Reconnect Gmail."
        : connected
          ? "Use manual sync when you want to import recent messages."
          : "Connect Gmail through OAuth.",
    detailHref: "/integrations/gmail",
  };
}

function createTelegramProvider(
  events: IntegrationEventLogEntry[],
): IntegrationProviderSummary {
  const configured = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const lastReceived = findEvent(events, "telegram", "message");
  const lastFailure = findProviderFailure(events, "telegram");
  const status: IntegrationStatus = lastFailure
    ? "Degraded"
    : lastReceived
      ? "Active"
      : configured
        ? "Awaiting First Event"
        : "Available";

  return {
    id: "telegram",
    name: "Telegram",
    category: "Communication Intelligence",
    status,
    statusMeaning: statusMeanings[status],
    lastSuccessfulEvent: lastReceived?.timestamp,
    lastFailedEvent: lastFailure?.timestamp,
    recentEventCount: countProviderEvents(events, "telegram"),
    recentFailureCount: countProviderFailures(events, "telegram"),
    currentCapabilities: [
      "Webhook ingestion",
      "Secret validation",
      "Text-message normalization",
      "Analysis",
      "Suggested response outline",
    ],
    currentPermissions: ["Telegram bot webhook"],
    limitations: ["No automatic replies", "No deletion", "No bans"],
    actionRequired: configured
      ? "Send a test message to the configured bot/group."
      : "Configure the bot token and webhook secret server-side.",
    detailHref: "/integrations/telegram",
  };
}

function createDiscordProvider(
  discord: Awaited<ReturnType<typeof getDiscordWorkerStatus>>,
  events: IntegrationEventLogEntry[],
): IntegrationProviderSummary {
  const status: IntegrationStatus =
    discord.status === "worker_recently_active"
      ? "Worker Online"
      : discord.status === "worker_stale"
        ? "Degraded"
        : discord.status === "worker_never_seen"
          ? "Awaiting First Event"
          : discord.status === "configuration_detected"
            ? "Configured"
            : discord.status === "error"
              ? "Error"
              : "Available";

  return {
    id: "discord",
    name: "Discord",
    category: "Community Intelligence",
    status,
    statusMeaning: statusMeanings[status],
    lastSuccessfulEvent: discord.latestProcessingSuccess,
    lastFailedEvent: findProviderFailure(events, "discord")?.timestamp,
    lastHealthCheck: discord.latestHeartbeat,
    recentEventCount: discord.messageCount,
    recentFailureCount: countProviderFailures(events, "discord"),
    currentCapabilities: [
      "Persistent Railway Gateway worker",
      "Guild text-message ingestion",
      "Internal API handoff",
      "Analysis",
      "Approval-required suggestions",
    ],
    currentPermissions: ["Guilds", "GuildMessages", "MessageContent"],
    limitations: ["No autonomous replies", "No moderation", "No bans", "No deletions"],
    actionRequired:
      status === "Worker Online"
        ? "Monitor heartbeat and message processing."
        : "Start or inspect the Railway worker.",
    detailHref: "/integrations/discord",
  };
}

function createFacebookProvider(
  facebook: Awaited<ReturnType<typeof getMetaProviderStatus>>,
  events: IntegrationEventLogEntry[],
): IntegrationProviderSummary {
  return createMetaProvider({
    id: "facebook",
    name: "Facebook Messenger",
    category: "Marketing and Communication Intelligence",
    status: facebook.status,
    lastSuccessfulEvent: facebook.latestProviderEventReceived,
    lastHealthCheck: facebook.latestVerificationTime,
    recentEventCount: facebook.messageCount + facebook.commentCount,
    recentFailureCount: countProviderFailures(events, "facebook"),
    detailHref: "/integrations/facebook",
  });
}

function createInstagramProvider(
  instagram: Awaited<ReturnType<typeof getMetaProviderStatus>>,
  events: IntegrationEventLogEntry[],
): IntegrationProviderSummary {
  return createMetaProvider({
    id: "instagram",
    name: "Instagram",
    category: "Marketing and Communication Intelligence",
    status: instagram.status,
    lastSuccessfulEvent: instagram.latestProviderEventReceived,
    lastHealthCheck: instagram.latestVerificationTime,
    recentEventCount: instagram.messageCount + instagram.commentCount,
    recentFailureCount: countProviderFailures(events, "instagram"),
    detailHref: "/integrations/instagram",
  });
}

function createMetaProvider({
  id,
  name,
  category,
  status: rawStatus,
  lastSuccessfulEvent,
  lastHealthCheck,
  recentEventCount,
  recentFailureCount,
  detailHref,
}: {
  id: "facebook" | "instagram";
  name: string;
  category: string;
  status: Awaited<ReturnType<typeof getMetaProviderStatus>>["status"];
  lastSuccessfulEvent?: string;
  lastHealthCheck?: string;
  recentEventCount: number;
  recentFailureCount: number;
  detailHref: string;
}): IntegrationProviderSummary {
  const status: IntegrationStatus =
    rawStatus === "receiving_events"
      ? "Active"
      : rawStatus === "webhook_verified"
        ? "Webhook Verified"
        : rawStatus === "no_event_received_yet"
          ? "Awaiting First Event"
          : rawStatus === "configuration_detected"
            ? "Configured"
            : rawStatus === "error"
              ? "Degraded"
              : "Available";

  return {
    id,
    name,
    category,
    status,
    statusMeaning: statusMeanings[status],
    lastSuccessfulEvent,
    lastHealthCheck,
    recentEventCount,
    recentFailureCount,
    currentCapabilities: [
      "Webhook verification",
      "Signature validation",
      "Supported inbound message normalization",
      "Analysis and durable workflow records when events are delivered",
      "Approval-required suggested replies",
    ],
    currentPermissions: ["Meta webhook subscriptions", "Page/professional-account access"],
    limitations: [
      "No automatic response",
      "No publishing",
      "No ads management",
      "Provider subscriptions and App Review remain external requirements",
    ],
    actionRequired:
      status === "Active"
        ? "Monitor provider delivery and analysis health."
        : "Confirm Meta dashboard subscriptions, Page linkage and provider review requirements.",
    reviewRequired: "Public users may require Meta App Review and approved permissions.",
    detailHref,
  };
}

function createMetrics({
  providers,
  workflows,
  events,
  approvals,
}: {
  providers: IntegrationProviderSummary[];
  workflows: IntegrationWorkflowRecord[];
  events: IntegrationEventLogEntry[];
  approvals: ApprovalCenterItem[];
}) {
  const completed = workflows.filter((workflow) => workflow.analysis);
  return {
    connectedProviders: providers.filter((provider) =>
      ["Connected", "Active", "Webhook Verified", "Worker Online"].includes(
        provider.status,
      ),
    ).length,
    activeProviders: providers.filter((provider) => provider.status === "Active").length,
    messagesAnalyzed: completed.length,
    highRiskMessages: completed.filter((workflow) =>
      ["High", "Critical"].includes(workflow.analysis?.riskLevel ?? ""),
    ).length,
    pendingApprovals: approvals.filter(
      (approval) => approval.status === "Pending Review",
    ).length,
    providerProcessingFailures: events.filter(
      (event) => event.processingStatus === "error",
    ).length,
    gmailMessagesSynchronized: events.filter(
      (event) => event.provider === "gmail" && event.eventType === "gmail_message_received",
    ).length,
    telegramEventsReceived: events.filter((event) => event.provider === "telegram").length,
    discordEventsReceived: events.filter(
      (event) => event.provider === "discord" && event.eventType === "discord_message_received",
    ).length,
    metaEventsReceived: events.filter((event) =>
      ["facebook", "instagram", "meta"].includes(event.provider),
    ).length,
    averageConfidence: "Requires human confirmation",
    humanReviewsCompleted: approvals.filter((approval) =>
      ["Approved Internally", "Rejected", "Resolved Internally"].includes(
        approval.status,
      ),
    ).length,
  };
}

function priorityFromRisk(risk?: string) {
  if (risk === "Critical" || risk === "High") return "High";
  if (risk === "Medium") return "Medium";
  if (risk === "Low") return "Low";
  return "Requires review";
}

function countProviderEvents(events: IntegrationEventLogEntry[], provider: string) {
  return events.filter((event) => event.provider === provider).length;
}

function countProviderFailures(events: IntegrationEventLogEntry[], provider: string) {
  return events.filter(
    (event) => event.provider === provider && event.processingStatus === "error",
  ).length;
}

function findEvent(
  events: IntegrationEventLogEntry[],
  provider: string,
  eventType: string,
) {
  return events.find(
    (event) => event.provider === provider && event.eventType === eventType,
  );
}

function findProviderFailure(events: IntegrationEventLogEntry[], provider: string) {
  return events.find(
    (event) => event.provider === provider && event.processingStatus === "error",
  );
}

async function safeListEvents() {
  try {
    return await listIntegrationEventLogEntries(100);
  } catch {
    return [];
  }
}

async function safeListWorkflows() {
  try {
    return await listIntegrationWorkflowRecords(100);
  } catch {
    return [];
  }
}

export const plannedIntegrationGroups: PlannedIntegrationGroup[] = [
  {
    title: "Communication Channels",
    items: [
      ["WhatsApp Business", "Planned", "Customer messaging and support intelligence."],
      ["Slack", "Planned", "Team-channel communication intelligence."],
      ["Microsoft Teams", "Planned", "Internal collaboration analysis."],
      ["Website Live Chat", "Planned", "Lead qualification and immediate support analysis."],
      ["Customer Support Ticketing", "Planned", "Ticket intake, triage and summaries."],
      ["X", "Future", "Social and community intelligence."],
      ["LinkedIn", "Future", "Company page and comment intelligence."],
      ["YouTube", "Future", "Comment and campaign intelligence."],
      ["TikTok", "Future", "Social engagement intelligence."],
      ["Reddit", "Future", "Community listening and risk signals."],
    ].map(([name, status, description]) => ({
      name,
      status: status as "Planned" | "Future",
      description,
    })),
  },
  {
    title: "CRM and Customer Platforms",
    items: [
      ["HubSpot", "Planned", "Lead classification and CRM note preparation."],
      ["Salesforce", "Planned", "Pipeline intelligence and human-approved updates."],
      ["Zendesk", "Planned", "Ticket prioritization and escalation."],
      ["Intercom", "Planned", "Customer-history summaries and follow-up suggestions."],
      ["Freshdesk", "Planned", "Support queue intelligence."],
    ].map(([name, status, description]) => ({
      name,
      status: status as "Planned" | "Future",
      description,
    })),
  },
  {
    title: "Marketing and Advertising",
    items: [
      ["Meta Ads", "Future", "Campaign-performance analysis with human-approved actions."],
      ["Google Ads", "Future", "Search and display campaign intelligence."],
      ["YouTube Campaigns", "Future", "Video campaign reporting."],
      ["X Ads", "Future", "Paid social intelligence."],
      ["LinkedIn Ads", "Future", "B2B campaign analysis."],
      ["TikTok Ads", "Future", "Creative and audience recommendations."],
    ].map(([name, status, description]) => ({
      name,
      status: status as "Planned" | "Future",
      description,
    })),
  },
  {
    title: "Business and Data Platforms",
    items: [
      ["BigQuery", "Planned", "Business data intelligence without new scopes in this release."],
      ["Google Cloud Platform", "Future", "Cloud-hosted business analytics."],
      ["Google Workspace", "Future", "Drive, Docs, Sheets and Calendar intelligence."],
      ["Microsoft 365", "Future", "Email, files and collaboration intelligence."],
      ["QuickBooks", "Future", "Accounting-system insights."],
      ["Xero", "Future", "Accounting-system insights."],
      ["Stripe", "Future", "Revenue analysis."],
      ["Shopify", "Future", "Commerce and customer intelligence."],
    ].map(([name, status, description]) => ({
      name,
      status: status as "Planned" | "Future",
      description,
    })),
  },
];
