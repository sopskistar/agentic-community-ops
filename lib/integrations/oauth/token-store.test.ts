import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createOAuthTokenStore,
  DevelopmentEncryptedOAuthTokenStore,
  type GoogleTokenRecord,
  UpstashOAuthTokenStore,
} from "./token-store";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  process.env = { ...originalEnv };
});

describe("OAuth token store selection", () => {
  it("selects Upstash/KV storage when REST credentials are configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.KV_REST_API_URL = "https://kv.example";
    process.env.KV_REST_API_TOKEN = "kv-token";

    expect(createOAuthTokenStore()).toBeInstanceOf(UpstashOAuthTokenStore);
  });

  it("selects filesystem storage for explicit local development fallback", () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    expect(createOAuthTokenStore()).toBeInstanceOf(
      DevelopmentEncryptedOAuthTokenStore,
    );
  });

  it("refuses filesystem fallback in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    expect(() => createOAuthTokenStore()).toThrow(
      "Durable OAuth token storage is not configured.",
    );
  });
});

describe("Upstash OAuth token storage", () => {
  it("encrypts token records and supports save/read/update", async () => {
    process.env.OAUTH_TOKEN_ENCRYPTION_KEY = "encryption-key";
    const redis = new Map<string, string>();
    const commands: string[][] = [];
    vi.stubGlobal("fetch", createRedisFetch(redis, commands));
    const store = new UpstashOAuthTokenStore({
      baseUrl: "https://kv.example",
      token: "kv-token",
    });

    await store.saveGoogleTokens(createTokenRecord());
    const savedCommand = JSON.stringify(commands[1]);
    expect(savedCommand).not.toContain("access-token");
    expect(savedCommand).not.toContain("refresh-token");

    const saved = await store.getGoogleTokens("default");
    expect(saved?.accessToken).toBe("access-token");
    expect(saved?.refreshToken).toBe("refresh-token");

    await store.updateGoogleTokens("default", {
      accessToken: "new-access-token",
      refreshToken: undefined,
      expiresAt: 2,
    });

    const updated = await store.getGoogleTokens("default");
    expect(updated?.accessToken).toBe("new-access-token");
    expect(updated?.refreshToken).toBe("refresh-token");
    expect(updated?.expiresAt).toBe(2);
  });

  it("requires an encryption key before persisting OAuth records", async () => {
    delete process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ result: null })),
    );
    const store = new UpstashOAuthTokenStore({
      baseUrl: "https://kv.example",
      token: "kv-token",
    });

    await expect(store.saveGoogleTokens(createTokenRecord())).rejects.toThrow(
      "OAUTH_TOKEN_ENCRYPTION_KEY is required for token storage.",
    );
  });
});

function createTokenRecord(): GoogleTokenRecord {
  return {
    accountId: "default",
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: 1,
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    tokenType: "Bearer",
    createdAt: "2026-07-21T00:00:00.000Z",
    connectedAt: "2026-07-21T00:00:00.000Z",
    updatedAt: "2026-07-21T00:00:00.000Z",
  };
}

function createRedisFetch(redis: Map<string, string>, commands: string[][]) {
  return vi.fn(async (_url: string, init?: RequestInit) => {
    const command = JSON.parse(String(init?.body)) as string[];
    commands.push(command);
    const [operation, key, value] = command;

    if (operation === "GET") {
      return Response.json({ result: redis.get(key) ?? null });
    }

    if (operation === "SET" && value) {
      redis.set(key, value);
      return Response.json({ result: "OK" });
    }

    if (operation === "DEL") {
      redis.delete(key);
      return Response.json({ result: 1 });
    }

    return Response.json({ result: null });
  });
}
