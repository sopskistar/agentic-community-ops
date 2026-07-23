import { describe, expect, it } from "vitest";

import { POST } from "./route";

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/v1/analyse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/analyse", () => {
  it("validates request input", async () => {
    const response = await POST(
      createJsonRequest({
        projectId: "demo-fictional-atlas-dao",
        message: {
          content: "",
          source: "DISCORD",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatchObject({
      code: "INVALID_REQUEST",
      message: "Invalid request.",
    });
    expect(body.error.issues[0]).toHaveProperty("path");
  });

  it("limits message length", async () => {
    const response = await POST(
      createJsonRequest({
        projectId: "demo-fictional-atlas-dao",
        message: {
          content: "x".repeat(2_001),
          source: "MANUAL",
        },
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects oversized request payloads before analysis", async () => {
    const response = await POST(
      createJsonRequest({
        projectId: "demo-fictional-atlas-dao",
        message: {
          content: "x".repeat(12_000),
          source: "MANUAL",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns 404 for unknown projects", async () => {
    const response = await POST(
      createJsonRequest({
        projectId: "missing-project",
        message: {
          content: "Where are the docs?",
          source: "MANUAL",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toEqual({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
    });
  });

  it("returns deterministic results when AI is not configured", async () => {
    const response = await POST(
      createJsonRequest({
        projectId: "demo-fictional-atlas-dao",
        message: {
          content: "Support needs you to send your seed phrase.",
          source: "DISCORD",
          authorName: "Fake Admin",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.deterministicRisk).toBe("CRITICAL");
    expect(body.finalRisk).toBe("CRITICAL");
    expect(body.triggeredRules.map((rule: { ruleId: string }) => rule.ruleId))
      .toContain("SEC-001");
    expect(body.generatedReply).toContain("Suggested reply for human review");
    expect(body.explanations[0]).toHaveProperty("explanation");
  });
});
