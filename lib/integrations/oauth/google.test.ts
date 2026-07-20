import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createGoogleAuthorizationUrl,
  refreshGoogleAccessToken,
} from "./google";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("Google OAuth helpers", () => {
  it("creates an authorization URL with readonly Gmail scope and state", () => {
    process.env.GOOGLE_CLIENT_ID = "client-id";
    process.env.GOOGLE_REDIRECT_URI =
      "http://localhost:3000/api/integrations/google/callback";

    const url = new URL(createGoogleAuthorizationUrl("secure-state"));

    expect(url.searchParams.get("scope")).toBe(
      "https://www.googleapis.com/auth/gmail.readonly",
    );
    expect(url.searchParams.get("state")).toBe("secure-state");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");
    expect(url.searchParams.get("scope")).not.toContain("gmail.send");
  });

  it("refreshes access tokens without logging token values", async () => {
    process.env.GOOGLE_CLIENT_ID = "client-id";
    process.env.GOOGLE_CLIENT_SECRET = "client-secret";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return {
          access_token: "new-access-token",
          expires_in: 3600,
          scope: "https://www.googleapis.com/auth/gmail.readonly",
          token_type: "Bearer",
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await refreshGoogleAccessToken("refresh-token");

    expect(result.accessToken).toBe("new-access-token");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][1]?.body)).toContain(
      "grant_type=refresh_token",
    );
  });
});
