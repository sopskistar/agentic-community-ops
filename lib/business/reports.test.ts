import { describe, expect, it } from "vitest";

import { businessSafetyDisclaimer } from "./audit";
import { createBusinessAnalysisRecord } from "./records";
import { createBusinessReport, findingsToCsv, reportToJson } from "./reports";

describe("business reports", () => {
  it("generates reports only from stored analysis data", () => {
    const analysis = createBusinessAnalysisRecord({
      request: {
        content: "Vendor invoices are missing approvals and policy evidence.",
        purpose: "Business Audit",
        profileId: "default",
        inputType: "Pasted Text",
      },
      now: "2026-07-22T10:00:00.000Z",
    });

    const report = createBusinessReport({
      analysis,
      reportType: "Business Audit Report",
      now: "2026-07-22T11:00:00.000Z",
    });

    expect(report.analysisId).toBe(analysis.id);
    expect(report.reportData.findings).toEqual(analysis.findings);
    expect(report.reportData.disclaimer).toBe(businessSafetyDisclaimer);
    expect(report.reportData.limitations.join(" ")).toContain(
      "No new findings",
    );
  });

  it("exports JSON and CSV without secret-looking fields", () => {
    const analysis = createBusinessAnalysisRecord({
      request: {
        content: "Budget is over plan and requires finance review.",
        purpose: "Budget Review",
        profileId: "default",
        inputType: "Pasted Text",
      },
    });
    const report = createBusinessReport({
      analysis,
      reportType: "Budget Review Report",
    });

    expect(reportToJson(report)).toContain("Budget Review Report");
    expect(reportToJson(report)).not.toContain("access_token");
    expect(findingsToCsv(report)).toContain("severity");
  });
});
