import { createHmac } from "crypto";
import { afterEach, describe, expect, it } from "vitest";

import { GET, POST } from "./route";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Meta webhook route", () => {
  it("returns challenge for valid verification", async () => {
    process.env.META_VERIFY_TOKEN = "verify-token";
    const response = await GET(
      new Request(
        "http://localhost/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=abc123",
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("abc123");
  });

  it("rejects invalid verification", async () => {
    process.env.META_VERIFY_TOKEN = "verify-token";
    const response = await GET(
      new Request(
        "http://localhost/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=abc123",
      ),
    );

    expect(response.status).toBe(403);
  });

  it("rejects invalid signatures when app secret is configured", async () => {
    process.env.META_APP_SECRET = "app-secret";
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": "sha256=bad" },
        body: JSON.stringify({ object: "page", entry: [] }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("accepts valid signatures", async () => {
    process.env.META_APP_SECRET = "app-secret";
    const body = JSON.stringify({ object: "page", entry: [] });
    const signature = createHmac("sha256", "app-secret")
      .update(body)
      .digest("hex");
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": `sha256=${signature}` },
        body,
      }),
    );

    expect(response.status).toBe(200);
  });
});
