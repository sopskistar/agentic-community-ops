import { normalizeGmailMessage, type GmailMessageSummary } from "../adapters/gmail";
import { refreshGoogleAccessToken } from "../oauth/google";
import { createOAuthTokenStore } from "../oauth/token-store";

const googleAccountId = "default";

export type GmailConnectionStatus =
  | { status: "not_configured" }
  | { status: "not_connected" }
  | { status: "connected"; accountId: string }
  | { status: "reconnect_required"; reason: string };

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

  const listUrl = new URL(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
  );
  listUrl.searchParams.set("maxResults", String(Math.min(maxResults, 10)));
  listUrl.searchParams.set("labelIds", "INBOX");

  const listResponse = await fetch(listUrl, {
    headers: { authorization: `Bearer ${tokenResult.accessToken}` },
  });

  if (!listResponse.ok) {
    throw new Error("Gmail message list request failed.");
  }

  const listBody = (await listResponse.json()) as {
    messages?: Array<{ id: string; threadId: string }>;
  };

  const summaries = await Promise.all(
    (listBody.messages ?? []).map((message) =>
      getGmailMessageSummary(tokenResult.accessToken, message.id),
    ),
  );

  return summaries;
}

export function normalizeGmailSummaryForProcessing(message: GmailMessageSummary) {
  return normalizeGmailMessage(message);
}

async function getGmailMessageSummary(accessToken: string, messageId: string) {
  const url = new URL(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
  );
  url.searchParams.set("format", "metadata");
  url.searchParams.append("metadataHeaders", "Subject");
  url.searchParams.append("metadataHeaders", "From");
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
    id: body.id,
    threadId: body.threadId,
    subject: getHeader(headers, "Subject"),
    sender: getHeader(headers, "From"),
    receivedAt: body.internalDate
      ? new Date(Number(body.internalDate)).toISOString()
      : new Date().toISOString(),
    snippet: body.snippet ?? "",
    labelIds: body.labelIds ?? [],
  } satisfies GmailMessageSummary;
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string) {
  return headers.find(
    (header) => header.name.toLowerCase() === name.toLowerCase(),
  )?.value;
}

export { googleAccountId };
