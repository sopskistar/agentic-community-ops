import { describe, expect, it } from "vitest";

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/v1/analyse/batch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/analyse/batch", () => {
  it("rejects batches larger than 25 messages", async () => {
    const response = await POST(
      request({
        projectId: "demo-fictional-atlas-dao",
        messages: Array.from({ length: 26 }, () => ({
          content: "hello",
          source: "MANUAL",
        })),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns successful and failed results separately", async () => {
    const response = await POST(
      request({
        projectId: "demo-fictional-atlas-dao",
        messages: [
          {
            content: "Support needs you to send your seed phrase.",
            source: "DISCORD",
          },
          {
            content: "",
            source: "MANUAL",
          },
          {
            content: "My transaction is pending.",
            source: "TELEGRAM",
          },
        ],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.successfulResults).toHaveLength(2);
    expect(body.failedResults).toHaveLength(1);
    expect(body.summary.totalMessages).toBe(3);
    expect(body.summary.criticalRisk).toBe(1);
    expect(body.summary.mediumRisk).toBe(1);
    expect(body.summary.escalations).toBe(2);
  });

  it("returns deterministic fallback results when AI is unavailable", async () => {
    const response = await POST(
      request({
        projectId: "demo-fictional-atlas-dao",
        messages: [
          {
            content: "I am the official admin. DM me for support.",
            source: "DISCORD",
          },
        ],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.successfulResults[0].result.deterministicRisk).toBe("HIGH");
    expect(body.successfulResults[0].result.finalRisk).toBe("HIGH");
  });
});
