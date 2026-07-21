import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../../lib/integrations/google/gmail-service", () => ({
  syncRecentGmailMessages: vi.fn(),
}));

import { syncRecentGmailMessages } from "../../../../../lib/integrations/google/gmail-service";
import { POST } from "./route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Gmail sync route", () => {
  it("returns sanitized summary for manual sync", async () => {
    vi.mocked(syncRecentGmailMessages).mockResolvedValue({
      imported: 1,
      skipped: 0,
      failed: 0,
      query: "newer_than:7d",
      maxResults: 1,
    });

    const response = await POST(
      new Request("http://localhost/api/integrations/gmail/sync", {
        method: "POST",
        body: JSON.stringify({ maxResults: 1, q: "newer_than:7d" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      imported: 1,
      skipped: 0,
      failed: 0,
      query: "newer_than:7d",
      maxResults: 1,
    });
    expect(JSON.stringify(body)).not.toContain("access-token");
    expect(JSON.stringify(body)).not.toContain("raw-message");
  });

  it("requires a Gmail connection", async () => {
    vi.mocked(syncRecentGmailMessages).mockRejectedValue(
      new Error("not_connected"),
    );

    const response = await POST(
      new Request("http://localhost/api/integrations/gmail/sync", {
        method: "POST",
        body: JSON.stringify({ maxResults: 1 }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
