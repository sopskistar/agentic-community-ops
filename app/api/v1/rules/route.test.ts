import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/v1/rules", () => {
  it("returns the public rule list", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.rules).toHaveLength(15);
    expect(body.rules[0]).toMatchObject({
      ruleId: "SEC-001",
      severity: "CRITICAL",
    });
  });
});
