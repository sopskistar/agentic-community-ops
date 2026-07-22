import { beforeEach, describe, expect, it } from "vitest";

import { createBusinessAnalysisRecord } from "./records";
import { MemoryBusinessRepository } from "./repository";
import { createBusinessReport } from "./reports";

describe("MemoryBusinessRepository", () => {
  let repository: MemoryBusinessRepository;

  beforeEach(() => {
    repository = new MemoryBusinessRepository();
  });

  it("saves, reads and lists business analyses newest first", async () => {
    const first = createBusinessAnalysisRecord({
      now: "2026-07-22T10:00:00.000Z",
      request: {
        content: "Please review missing approval evidence.",
        purpose: "Business Audit",
        profileId: "default",
        inputType: "Pasted Text",
      },
    });
    const second = createBusinessAnalysisRecord({
      now: "2026-07-22T11:00:00.000Z",
      request: {
        content:
          "Department,Category,Budgeted,Actual,Currency\nMarketing,Ads,1000,1200,USD",
        purpose: "Budget Review",
        profileId: "default",
        inputType: "Pasted Text",
      },
    });

    await repository.saveAnalysis(first);
    await repository.saveAnalysis(second);

    await expect(repository.getAnalysis(first.id)).resolves.toEqual(first);
    await expect(repository.listAnalyses()).resolves.toEqual([second, first]);
    expect(second.budgetIntelligence?.totalVariance).toBe(200);
  });

  it("saves reports and action records without storing raw files", async () => {
    const analysis = createBusinessAnalysisRecord({
      request: {
        content: "Support issue requires manager review.",
        purpose: "Customer Support",
        profileId: "support-center",
        inputType: "PDF",
        extraction: {
          filename: "support.pdf",
          fileTypeLabel: "PDF",
          sizeBytes: 1000,
          extractedCharacterCount: 90,
          truncated: false,
        },
      },
    });
    const report = createBusinessReport({
      analysis,
      reportType: "Communication Analysis Report",
      now: "2026-07-22T12:00:00.000Z",
    });

    await repository.saveAnalysis(analysis);
    await repository.saveReport(report);
    await Promise.all(analysis.actions.map((action) => repository.saveAction(action)));

    expect((await repository.listReports())[0].id).toBe(report.id);
    expect((await repository.listActions()).length).toBeGreaterThan(0);
    expect(JSON.stringify(await repository.getAnalysis(analysis.id))).not.toContain(
      "rawFile",
    );
  });
});
