import { afterEach, describe, expect, it, vi } from "vitest";

import {
  listIntegrationEventLogEntries,
  listIntegrationWorkflowRecords,
  MemoryIntegrationEventRepository,
  resetIntegrationEventLogForTests,
  setIntegrationEventRepositoryForTests,
} from "../event-log";
import { UpstashOAuthTokenStore, type GoogleTokenRecord } from "../oauth/token-store";
import {
  defaultGmailQuery,
  getGoogleAccessToken,
  maxGmailSyncResults,
  syncRecentGmailMessages,
} from "./gmail-service";

const originalEnv = { ...process.env };

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  process.env = { ...originalEnv };
  setIntegrationEventRepositoryForTests(null);
  await resetIntegrationEventLogForTests();
});

describe("Gmail readonly sync service", () => {
  it("requires a Google connection before sync", async () => {
    configureEnv();
    vi.stubGlobal("fetch", createGmailSyncFetch({ tokenRecord: null }));

    await expect(syncRecentGmailMessages()).rejects.toThrow("not_connected");
  });

  it("refreshes expired tokens and preserves refresh token", async () => {
    configureEnv();
    const redis = new Map<string, string>();
    vi.stubGlobal("fetch", createGmailSyncFetch({ redis }));
    await seedToken(redis, {
      ...createTokenRecord(),
      expiresAt: Date.now() - 10_000,
    });

    const result = await getGoogleAccessToken();

    expect(result.ok).toBe(true);
    const saved = await new UpstashOAuthTokenStore({
      baseUrl: "https://kv.example",
      token: "kv-token",
    }).getGoogleTokens("default");
    expect(saved?.accessToken).toBe("refreshed-access-token");
    expect(saved?.refreshToken).toBe("refresh-token");
    expect(
      (await listIntegrationEventLogEntries()).some(
        (event) => event.eventType === "gmail_token_refreshed",
      ),
    ).toBe(true);
  });

  it("syncs a bounded recent Gmail window with sanitized data", async () => {
    configureEnv();
    const redis = new Map<string, string>();
    const calls: string[] = [];
    vi.stubGlobal("fetch", createGmailSyncFetch({ redis, calls }));
    await seedToken(redis, createTokenRecord());

    const result = await syncRecentGmailMessages({
      maxResults: 50,
      unreadOnly: true,
    });

    expect(result).toMatchObject({
      imported: 2,
      skipped: 0,
      failed: 0,
      maxResults: maxGmailSyncResults,
    });
    const listUrl = calls.find((call) =>
      call.startsWith("https://gmail.googleapis.com/gmail/v1/users/me/messages?"),
    );
    expect(listUrl).toContain(`maxResults=${maxGmailSyncResults}`);
    expect(new URL(listUrl ?? "").searchParams.get("q")).toBe(
      `${defaultGmailQuery} is:unread`,
    );

    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows).toHaveLength(2);
    expect(workflows[0].provider).toBe("gmail");
    expect(workflows[0].id).not.toContain("gmail-raw-message");
    expect(workflows[0].receivedMessage.conversationId).not.toContain(
      "gmail-raw-thread",
    );
    expect(workflows[0].receivedMessage.senderName).toBe("Alice Example");
    expect(JSON.stringify(workflows)).not.toContain("alice@example.com");
    expect(workflows[0].receivedMessage.textPreview).not.toContain("<b>");
    expect(workflows[0].receivedMessage.textPreview).not.toContain("\u0000");
    expect(workflows[0].suggestion?.requiresHumanApproval).toBe(true);
    expect(workflows[0].suggestion?.outboundAvailable).toBe(false);

    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "gmail_sync_started",
        "gmail_message_received",
        "gmail_analysis_started",
        "gmail_analysis_completed",
        "gmail_sync_completed",
      ]),
    );
    expect(JSON.stringify(events)).not.toContain("gmail-raw-message");
    expect(JSON.stringify(workflows)).not.toContain("full private body");
  });

  it("skips duplicate Gmail messages by persisted workflow ID", async () => {
    configureEnv();
    const redis = new Map<string, string>();
    vi.stubGlobal("fetch", createGmailSyncFetch({ redis }));
    await seedToken(redis, createTokenRecord());

    expect((await syncRecentGmailMessages()).imported).toBe(2);
    const second = await syncRecentGmailMessages();

    expect(second.imported).toBe(0);
    expect(second.skipped).toBe(2);
    expect(
      (await listIntegrationEventLogEntries()).some(
        (event) => event.eventType === "gmail_message_skipped_duplicate",
      ),
    ).toBe(true);
  });

  it("handles partial message fetch failure", async () => {
    configureEnv();
    const redis = new Map<string, string>();
    vi.stubGlobal(
      "fetch",
      createGmailSyncFetch({ redis, failSecondMessageFetch: true }),
    );
    await seedToken(redis, createTokenRecord());

    const result = await syncRecentGmailMessages({ maxResults: 2 });

    expect(result.imported).toBe(1);
    expect(result.failed).toBe(0);
    expect(
      (await listIntegrationEventLogEntries()).some(
        (event) => event.eventType === "gmail_message_fetch_failed",
      ),
    ).toBe(true);
  });

  it("returns reconnect required for revoked authorization", async () => {
    configureEnv();
    const redis = new Map<string, string>();
    vi.stubGlobal(
      "fetch",
      createGmailSyncFetch({ redis, failRefresh: true }),
    );
    await seedToken(redis, {
      ...createTokenRecord(),
      expiresAt: Date.now() - 10_000,
    });

    const result = await getGoogleAccessToken();

    expect(result).toEqual({
      ok: false,
      reason: "reconnect_required",
    });
  });

  it("records a safe diagnostic when Gmail list fails", async () => {
    configureEnv();
    const redis = new Map<string, string>();
    vi.stubGlobal("fetch", createGmailSyncFetch({ redis, failList: true }));
    await seedToken(redis, createTokenRecord());

    await expect(syncRecentGmailMessages()).rejects.toThrow("gmail_list_failed");
    const events = await listIntegrationEventLogEntries();

    expect(events.some((event) => event.eventType === "gmail_list_failed")).toBe(
      true,
    );
    expect(JSON.stringify(events)).not.toContain("access-token");
  });
});

function configureEnv() {
  vi.stubEnv("NODE_ENV", "production");
  process.env.GOOGLE_CLIENT_ID = "client-id";
  process.env.GOOGLE_CLIENT_SECRET = "client-secret";
  process.env.GOOGLE_REDIRECT_URI =
    "http://localhost:3000/api/integrations/google/callback";
  process.env.OAUTH_TOKEN_ENCRYPTION_KEY = "encryption-key";
  process.env.KV_REST_API_URL = "https://kv.example";
  process.env.KV_REST_API_TOKEN = "kv-token";
  setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
}

async function seedToken(
  redis: Map<string, string>,
  tokenRecord: GoogleTokenRecord,
) {
  await new UpstashOAuthTokenStore({
    baseUrl: "https://kv.example",
    token: "kv-token",
  }).saveGoogleTokens(tokenRecord);
}

function createTokenRecord(): GoogleTokenRecord {
  return {
    accountId: "default",
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: Date.now() + 3_600_000,
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    tokenType: "Bearer",
    createdAt: "2026-07-21T00:00:00.000Z",
    connectedAt: "2026-07-21T00:00:00.000Z",
    updatedAt: "2026-07-21T00:00:00.000Z",
  };
}

function createGmailSyncFetch({
  redis = new Map<string, string>(),
  calls = [],
  tokenRecord,
  failSecondMessageFetch = false,
  failRefresh = false,
  failList = false,
}: {
  redis?: Map<string, string>;
  calls?: string[];
  tokenRecord?: GoogleTokenRecord | null;
  failSecondMessageFetch?: boolean;
  failRefresh?: boolean;
  failList?: boolean;
} = {}) {
  return vi.fn(async (url: string | URL, init?: RequestInit) => {
    const target = String(url);
    calls.push(target);

    if (target === "https://kv.example") {
      const command = JSON.parse(String(init?.body)) as string[];
      const [operation, key, value] = command;
      if (operation === "GET") {
        return Response.json({
          result: tokenRecord === null ? null : redis.get(key) ?? null,
        });
      }
      if (operation === "SET" && value) {
        redis.set(key, value);
        return Response.json({ result: "OK" });
      }
      if (operation === "LPUSH" || operation === "LTRIM") {
        return Response.json({ result: 1 });
      }
      if (operation === "LRANGE") {
        return Response.json({ result: [] });
      }
      return Response.json({ result: null });
    }

    if (target === "https://oauth2.googleapis.com/token") {
      if (failRefresh) {
        return new Response("revoked", { status: 400 });
      }
      return Response.json({
        access_token: "refreshed-access-token",
        expires_in: 3600,
        scope: "https://www.googleapis.com/auth/gmail.readonly",
        token_type: "Bearer",
      });
    }

    if (target.startsWith("https://gmail.googleapis.com/gmail/v1/users/me/messages?")) {
      if (failList) {
        return new Response("list failed", { status: 500 });
      }
      const maxResults = Number(new URL(target).searchParams.get("maxResults") ?? 1);
      return Response.json({
        messages: [
          { id: "gmail-raw-message-1", threadId: "gmail-raw-thread-1" },
          { id: "gmail-raw-message-2", threadId: "gmail-raw-thread-2" },
        ].slice(0, maxResults),
      });
    }

    if (target.includes("gmail-raw-message-2") && failSecondMessageFetch) {
      return new Response("not found", { status: 404 });
    }

    if (target.includes("gmail-raw-message")) {
      return Response.json({
        id: target.includes("gmail-raw-message-2")
          ? "gmail-raw-message-2"
          : "gmail-raw-message-1",
        threadId: target.includes("gmail-raw-message-2")
          ? "gmail-raw-thread-2"
          : "gmail-raw-thread-1",
        snippet: "<b>Hello</b>\u0000 short preview",
        internalDate: "1784592000000",
        labelIds: ["INBOX", "UNREAD"],
        payload: {
          headers: [
            { name: "Subject", value: "<b>Support request</b>" },
            { name: "From", value: "Alice Example <alice@example.com>" },
            { name: "To", value: "Ops Team <ops@example.com>" },
          ],
        },
      });
    }

    throw new Error(`Unexpected fetch: ${target}`);
  });
}
