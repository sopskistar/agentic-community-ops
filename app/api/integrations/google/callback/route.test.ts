import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";

import { GET } from "./route";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});

describe("Google OAuth callback route", () => {
  it("redirects to google_connected after successful token persistence", async () => {
    configureGoogleEnv();
    vi.mocked(cookies).mockResolvedValue(createCookieStore("state"));
    vi.stubGlobal("fetch", createCallbackFetch({ storageOk: true }));

    const response = await GET(
      new Request(
        "http://localhost/api/integrations/google/callback?code=code&state=state",
      ),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain(
      "/integrations?status=google_connected",
    );
  });

  it("redirects to google_token_error when token storage fails", async () => {
    configureGoogleEnv();
    vi.mocked(cookies).mockResolvedValue(createCookieStore("state"));
    vi.stubGlobal("fetch", createCallbackFetch({ storageOk: false }));

    const response = await GET(
      new Request(
        "http://localhost/api/integrations/google/callback?code=code&state=state",
      ),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain(
      "/integrations?status=google_token_error",
    );
  });
});

function configureGoogleEnv() {
  vi.stubEnv("NODE_ENV", "production");
  process.env.GOOGLE_CLIENT_ID = "client-id";
  process.env.GOOGLE_CLIENT_SECRET = "client-secret";
  process.env.GOOGLE_REDIRECT_URI =
    "http://localhost:3000/api/integrations/google/callback";
  process.env.OAUTH_TOKEN_ENCRYPTION_KEY = "encryption-key";
  process.env.KV_REST_API_URL = "https://kv.example";
  process.env.KV_REST_API_TOKEN = "kv-token";
}

function createCookieStore(expectedState: string) {
  return {
    get: vi.fn(() => ({ value: expectedState })),
    delete: vi.fn(),
  } as unknown as Awaited<ReturnType<typeof cookies>>;
}

function createCallbackFetch({ storageOk }: { storageOk: boolean }) {
  return vi.fn(async (url: string | URL, init?: RequestInit) => {
    const target = String(url);
    if (target === "https://oauth2.googleapis.com/token") {
      expect(String(init?.body)).not.toContain("gmail.send");
      return Response.json({
        access_token: "access-token",
        refresh_token: "refresh-token",
        expires_in: 3600,
        scope: "https://www.googleapis.com/auth/gmail.readonly",
        token_type: "Bearer",
      });
    }

    const command = JSON.parse(String(init?.body)) as string[];
    if (command[0] === "GET") {
      return Response.json({ result: null });
    }

    return storageOk
      ? Response.json({ result: "OK" })
      : new Response("storage failed", { status: 500 });
  });
}
