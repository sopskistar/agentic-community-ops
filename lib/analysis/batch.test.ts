import { describe, expect, it } from "vitest";

import { createBatchSummary } from "./batch";
import type { BatchAnalysedMessage } from "./batch";
import type { HybridMessageAnalysisResult } from "./types";

function result(
  finalRisk: HybridMessageAnalysisResult["finalRisk"],
  category: HybridMessageAnalysisResult["category"],
  ruleIds: string[] = [],
): HybridMessageAnalysisResult {
  return {
    category,
    detectedIntent: "intent",
    shortSummary: "summary",
    deterministicRisk: finalRisk,
    aiSuggestedRisk: finalRisk,
    finalRisk,
    riskScore: finalRisk === "CRITICAL" ? 100 : finalRisk === "HIGH" ? 70 : 0,
    triggeredRules: ruleIds.map((ruleId) => ({
      ruleId,
      name: `${ruleId} rule`,
      description: "description",
      matchedEvidence: ["evidence"],
      severity: finalRisk,
      recommendedAction: "review",
    })),
    confidence: 0.5,
    generatedReply: "Suggested reply for human review: review",
    shouldEscalate: finalRisk === "HIGH" || finalRisk === "CRITICAL",
    escalationReason: finalRisk === "LOW" ? null : "review",
    recommendedAction: "review",
    answerGroundedInKnowledgeBase: true,
    evidenceUsed: ["docs"],
  };
}

function item(
  index: number,
  analysisResult: HybridMessageAnalysisResult,
): BatchAnalysedMessage {
  return {
    index,
    content: `message ${index}`,
    source: "MANUAL",
    result: analysisResult,
  };
}

describe("createBatchSummary", () => {
  it("summarizes measured analysis results", () => {
    const summary = createBatchSummary([
      item(0, result("LOW", "GENERAL_QUESTION")),
      item(1, result("HIGH", "SCAM", ["SEC-004"])),
      item(2, result("CRITICAL", "SCAM", ["SEC-001"])),
      item(3, result("MEDIUM", "TRANSACTION_ISSUE", ["SEC-010"])),
    ]);

    expect(summary).toMatchObject({
      totalMessages: 4,
      safeMessages: 1,
      mediumRisk: 1,
      highRisk: 1,
      criticalRisk: 1,
      escalations: 2,
    });
    expect(summary.topCategories[0]).toEqual({ category: "SCAM", count: 2 });
  });

  it("produces identical deterministic metrics for identical stored input", () => {
    const storedResults = [
      item(0, result("CRITICAL", "SCAM", ["SEC-001"])),
      item(1, result("HIGH", "SECURITY", ["SEC-004"])),
    ];

    expect(createBatchSummary(storedResults)).toEqual(
      createBatchSummary(storedResults),
    );
  });
});
