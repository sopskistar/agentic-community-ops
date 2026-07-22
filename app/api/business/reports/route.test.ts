import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST as POST_ANALYSIS } from "../analyses/route";
import { MemoryBusinessRepository, setBusinessRepositoryForTests } from "../../../../lib/business/repository";
import { GET, POST } from "./route";

describe("/api/business/reports", () => {
  beforeEach(() => {
    setBusinessRepositoryForTests(new MemoryBusinessRepository());
  });

  afterEach(() => {
    setBusinessRepositoryForTests(null);
  });

  it("generates a report from an actual saved analysis", async () => {
    const analysisResponse = await POST_ANALYSIS(
      new Request("https://agenticopsai.xyz/api/business/analyses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: "Vendor invoices are missing approvals.",
          purpose: "Business Audit",
          profileId: "default",
          inputType: "Pasted Text",
        }),
      }),
    );
    const analysisPayload = await analysisResponse.json();

    const reportResponse = await POST(
      new Request("https://agenticopsai.xyz/api/business/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          analysisId: analysisPayload.analysis.id,
          reportType: "Business Audit Report",
        }),
      }),
    );
    const reportPayload = await reportResponse.json();

    expect(reportResponse.status).toBe(200);
    expect(reportPayload.report.analysisId).toBe(analysisPayload.analysis.id);
    expect(reportPayload.report.reportData.disclaimer).toContain(
      "preliminary business",
    );

    const listPayload = await (
      await GET(new Request("https://agenticopsai.xyz/api/business/reports"))
    ).json();
    expect(listPayload.reports).toHaveLength(1);
  });

  it("fails safely when the analysis does not exist", async () => {
    const response = await POST(
      new Request("https://agenticopsai.xyz/api/business/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          analysisId: "missing",
          reportType: "Executive Summary",
        }),
      }),
    );

    expect(response.status).toBe(404);
  });
});
