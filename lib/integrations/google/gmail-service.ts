import {
  hashGmailIdentifier,
  normalizeGmailMessage,
  sanitizeGmailAddress,
  sanitizeGmailText,
  type GmailMessageSummary,
} from "../adapters/gmail";
import {
  addIntegrationEventLogEntry,
  getIntegrationWorkflowRecord,
  recordIntegrationAnalysis,
} from "../event-log";
import type { NormalizedCommunicationMessage } from "../normalized";
import { refreshGoogleAccessToken } from "../oauth/google";
import { createOAuthTokenStore } from "../oauth/token-store";
import { processNormalizedMessage } from "../processor";

const googleAccountId = "default";
const defaultGmailQuery = "newer_than:7d";
const maxGmailSyncResults = 10;

export type GmailConnectionStatus =
  | { status: "not_configured" }
  | { status: "not_connected" }
  | { status: "connected"; accountId: string }
  | { status: "reconnect_required"; reason: string };

export type GmailSyncOptions = {
  maxResults?: number;
  query?: string;
  unreadOnly?: boolean;
};

export type GmailSyncResult = {
  imported: number;
  skipped: number;
  failed: number;
  query: string;
  maxResults: number;
};

type GmailRawMessageSummary = GmailMessageSummary & {
  rawId: string;
  rawThreadId: string;
};

export async function getGoogleAccessToken() {
  const store = createOAuthTokenStore();
  const tokens = await store.getGoogleTokens(googleAccountId);

  if (!tokens) {
    return { ok: false as const, reason: "not_connected" };
  }

  if (tokens.expiresAt > Date.now() + 60_000) {
    return { ok: true as const, accessToken: tokens.accessToken };
  }

  if (!tokens.refreshToken) {
    return { ok: false as const, reason: "reconnect_required" };
  }

  try {
    const refreshed = await refreshGoogleAccessToken(tokens.refreshToken);
    await store.updateGoogleTokens(googleAccountId, {
      accessToken: refreshed.accessToken,
      expiresAt: refreshed.expiresAt,
      scope: refreshed.scope,
      tokenType: refreshed.tokenType,
      refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
    });
    await recordGmailDiagnostic({
      eventType: "gmail_token_refreshed",
      processingStatus: "processed",
      analysisStatus: "not_started",
    });

    return { ok: true as const, accessToken: refreshed.accessToken };
  } catch {
    return { ok: false as const, reason: "reconnect_required" };
  }
}

export async function getGmailConnectionStatus(): Promise<GmailConnectionStatus> {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REDIRECT_URI
  ) {
    return { status: "not_configured" };
  }

  let tokens;
  try {
    tokens = await createOAuthTokenStore().getGoogleTokens(googleAccountId);
  } catch {
    return { status: "not_configured" };
  }

  if (!tokens) {
    return { status: "not_connected" };
  }

  if (!tokens.refreshToken && tokens.expiresAt <= Date.now()) {
    return { status: "reconnect_required", reason: "Refresh token missing." };
  }

  return { status: "connected", accountId: tokens.accountId };
}

export async function listRecentGmailMessages(maxResults = 5) {
  const tokenResult = await getGoogleAccessToken();
  if (!tokenResult.ok) {
    throw new Error(tokenResult.reason);
  }

  return listGmailMessages(tokenResult.accessToken, {
    maxResults,
    query: defaultGmailQuery,
    unreadOnly: false,
  });
}

export async function syncRecentGmailMessages(options: GmailSyncOptions = {}) {
  const normalizedOptions = normalizeGmailSyncOptions(options);
  await recordGmailDiagnostic({
    eventType: "gmail_sync_started",
    processingStatus: "received",
    analysisStatus: "not_started",
  });

  const tokenResult = await getGoogleAccessToken();
  if (!tokenResult.ok) {
    throw new Error(tokenResult.reason);
  }

  const result: GmailSyncResult = {
    imported: 0,
    skipped: 0,
    failed: 0,
    query: normalizedOptions.query,
    maxResults: normalizedOptions.maxResults,
  };

  let messages: GmailRawMessageSummary[];
  try {
    messages = await listGmailMessages(tokenResult.accessToken, normalizedOptions);
  } catch {
    await recordGmailDiagnostic({
      eventType: "gmail_list_failed",
      processingStatus: "error",
      analysisStatus: "failed",
      errorSummary: "Gmail message list failed.",
    });
    throw new Error("gmail_list_failed");
  }

  for (const message of messages) {
    const normalized = normalizeGmailSummaryForProcessing(message);
    const existing = await getIntegrationWorkflowRecord(normalized.id);
    if (existing) {
      result.skipped += 1;
      await recordGmailDiagnostic({
        eventType: "gmail_message_skipped_duplicate",
        processingStatus: "ignored",
        analysisStatus: "not_started",
        externalId: normalized.externalId,
      });
      continue;
    }

    await recordGmailDiagnostic({
      eventType: "gmail_message_received",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: normalized.externalId,
    });
    await recordGmailDiagnostic({
      eventType: "gmail_analysis_started",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: normalized.externalId,
    });

    try {
      const analysis = await processNormalizedMessage(normalized);
      await recordIntegrationAnalysis(analysis);
      await recordGmailDiagnostic({
        eventType: "gmail_analysis_completed",
        processingStatus: "processed",
        analysisStatus: "completed",
        externalId: normalized.externalId,
      });
      result.imported += 1;
    } catch {
      result.failed += 1;
      await recordGmailDiagnostic({
        eventType: "gmail_analysis_failed",
        processingStatus: "error",
        analysisStatus: "failed",
        externalId: normalized.externalId,
        errorSummary: "Gmail analysis failed.",
      });
    }
  }

  await recordGmailDiagnostic({
    eventType: "gmail_sync_completed",
    processingStatus: "processed",
    analysisStatus: result.failed > 0 ? "failed" : "completed",
    errorSummary:
      result.failed > 0
        ? `Gmail sync completed with ${result.failed} failed messages.`
        : undefined,
  });

  return result;
}

export function normalizeGmailSummaryForProcessing(
  message: GmailMessageSummary,
): NormalizedCommunicationMessage {
  return normalizeGmailMessage(message);
}

async function listGmailMessages(
  accessToken: string,
  options: Required<GmailSyncOptions>,
) {
  const listUrl = new URL(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
  );
  listUrl.searchParams.set("maxResults", String(options.maxResults));
  listUrl.searchParams.set("labelIds", "INBOX");
  listUrl.searchParams.set("q", options.query);

  const listResponse = await fetch(listUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!listResponse.ok) {
    throw new Error("Gmail message list request failed.");
  }

  const listBody = (await listResponse.json()) as {
    messages?: Array<{ id: string; threadId: string }>;
  };
  const summaries: GmailRawMessageSummary[] = [];

  for (const message of listBody.messages ?? []) {
    try {
      summaries.push(await getGmailMessageSummary(accessToken, message.id));
    } catch {
      await recordGmailDiagnostic({
        eventType: "gmail_message_fetch_failed",
        processingStatus: "error",
        analysisStatus: "failed",
        externalId: hashGmailIdentifier(message.id),
        errorSummary: "Gmail message fetch failed.",
      });
    }
  }

  return summaries;
}

async function getGmailMessageSummary(
  accessToken: string,
  rawMessageId: string,
): Promise<GmailRawMessageSummary> {
  const url = new URL(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${rawMessageId}`,
  );
  url.searchParams.set("format", "metadata");
  url.searchParams.append("metadataHeaders", "Subject");
  url.searchParams.append("metadataHeaders", "From");
  url.searchParams.append("metadataHeaders", "To");
  url.searchParams.append("metadataHeaders", "Date");

  const response = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Gmail message read request failed.");
  }

  const body = (await response.json()) as {
    id: string;
    threadId: string;
    snippet?: string;
    internalDate?: string;
    labelIds?: string[];
    payload?: { headers?: Array<{ name: string; value: string }> };
  };
  const headers = body.payload?.headers ?? [];

  return {
    rawId: body.id,
    rawThreadId: body.threadId,
    id: hashGmailIdentifier(body.id),
    threadId: hashGmailIdentifier(body.threadId),
    subject: sanitizeGmailText(getHeader(headers, "Subject"), 180),
    sender: sanitizeGmailAddress(getHeader(headers, "From")),
    recipient: sanitizeGmailAddress(getHeader(headers, "To")),
    receivedAt: body.internalDate
      ? new Date(Number(body.internalDate)).toISOString()
      : new Date().toISOString(),
    snippet: sanitizeGmailText(body.snippet, 500),
    labelIds: (body.labelIds ?? []).slice(0, 20).map((label) =>
      sanitizeGmailText(label, 80),
    ),
  };
}

function normalizeGmailSyncOptions(options: GmailSyncOptions) {
  const maxResults = Math.max(
    1,
    Math.min(Number(options.maxResults ?? 5) || 5, maxGmailSyncResults),
  );
  const baseQuery = sanitizeGmailText(options.query, 120) || defaultGmailQuery;
  const query = options.unreadOnly
    ? `${baseQuery} is:unread`
    : baseQuery;

  return {
    maxResults,
    query,
    unreadOnly: Boolean(options.unreadOnly),
  } satisfies Required<GmailSyncOptions>;
}

async function recordGmailDiagnostic(
  entry: Omit<Parameters<typeof addIntegrationEventLogEntry>[0], "provider">,
) {
  try {
    await addIntegrationEventLogEntry({
      provider: "gmail",
      ...entry,
    });
  } catch {
    console.error("gmail_event_persistence_failed");
  }
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string) {
  return headers.find(
    (header) => header.name.toLowerCase() === name.toLowerCase(),
  )?.value;
}

export { googleAccountId, maxGmailSyncResults, defaultGmailQuery };
