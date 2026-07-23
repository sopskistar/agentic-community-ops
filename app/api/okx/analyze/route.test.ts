import { describe, expect, it } from "vitest";

import { GET, POST } from "./route";

function post(body: unknown) {
  return new Request("https://agenticopsai.xyz/api/okx/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/okx/analyze", () => {
  it("returns bounded standalone communication intelligence", async () => {
    const response = await POST(
      post({
        content: "Urgent wallet verification: send your seed phrase now.",
        context: "web3-community",
        source: "telegram",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.riskLevel).toBe("critical");
    expect(body.requiresHumanReview).toBe(true);
    expect(body.riskSignals.join(" ")).toContain("SEC-001");
    expect(body.suggestedReplyOutline).toContain("human review");
  });

  it("rejects missing fields with sanitized validation errors", async () => {
    const response = await POST(post({ context: "general", source: "manual" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_REQUEST");
    expect(JSON.stringify(body)).not.toContain("OPENAI");
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(post("{bad json"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_JSON");
  });

  it("rejects oversized request bodies", async () => {
    const response = await POST(post({ content: "x".repeat(12_100) }));
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("documents the public service contract", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.endpoint).toBe("https://agenticopsai.xyz/api/okx/analyze");
    expect(body.toolName).toBe("analyze_communication_risk");
    expect(body.safety).toContain("Analyze-only");
  });
});
