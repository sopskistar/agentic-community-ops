import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/v1/health", () => {
  it("returns health status", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      service: "Agentic Community Ops",
      status: "healthy",
      version: "1.0.0",
      deterministicEngine: true,
    });
  });
});
