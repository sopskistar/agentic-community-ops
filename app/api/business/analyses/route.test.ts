import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { MemoryBusinessRepository, setBusinessRepositoryForTests } from "../../../../lib/business/repository";
import { GET, POST } from "./route";

describe("/api/business/analyses", () => {
  beforeEach(() => {
    setBusinessRepositoryForTests(new MemoryBusinessRepository());
  });

  afterEach(() => {
    setBusinessRepositoryForTests(null);
  });

  it("saves and lists analysis records", async () => {
    const saveResponse = await POST(
      new Request("https://agenticopsai.xyz/api/business/analyses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: "Customer asks for pricing and a demo next week.",
          purpose: "Sales Conversation",
          profileId: "demo-saas",
          inputType: "Pasted Text",
        }),
      }),
    );
    const savePayload = await saveResponse.json();

    expect(saveResponse.status).toBe(200);
    expect(savePayload.analysis.result.intent).toBe("Purchase or sales intent");
    expect(savePayload.analysis.actions[0].requiresApproval).toBe(true);

    const listResponse = await GET(
      new Request("https://agenticopsai.xyz/api/business/analyses"),
    );
    const listPayload = await listResponse.json();
    expect(listPayload.analyses).toHaveLength(1);
    expect(listPayload.summaries[0].reportAvailable).toBe(false);
  });

  it("rejects invalid bounded content", async () => {
    const response = await POST(
      new Request("https://agenticopsai.xyz/api/business/analyses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: "",
          purpose: "Sales Conversation",
          profileId: "demo-saas",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("BUSINESS_ANALYSIS_INVALID");
  });
});
