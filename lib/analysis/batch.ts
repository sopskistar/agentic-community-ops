import type { HybridMessageAnalysisResult } from "./types";

export type BatchAnalysedMessage = {
  index: number;
  content: string;
  source: string;
  authorName?: string;
  result: HybridMessageAnalysisResult;
};

export type BatchFailedMessage = {
  index: number;
  content?: string;
  error: string;
};

export type BatchAnalysisSummary = {
  totalMessages: number;
  safeMessages: number;
  mediumRisk: number;
  highRisk: number;
  criticalRisk: number;
  escalations: number;
  mostTriggeredRules: Array<{
    ruleId: string;
    name: string;
    count: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
};

export function createBatchSummary(
  successfulResults: BatchAnalysedMessage[],
  failedResults: BatchFailedMessage[] = [],
): BatchAnalysisSummary {
  const ruleCounts = new Map<string, { name: string; count: number }>();
  const categoryCounts = new Map<string, number>();

  for (const item of successfulResults) {
    categoryCounts.set(
      item.result.category,
      (categoryCounts.get(item.result.category) ?? 0) + 1,
    );

    for (const rule of item.result.triggeredRules) {
      const current = ruleCounts.get(rule.ruleId);
      ruleCounts.set(rule.ruleId, {
        name: rule.name,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return {
    totalMessages: successfulResults.length + failedResults.length,
    safeMessages: successfulResults.filter(
      (item) => item.result.finalRisk === "LOW",
    ).length,
    mediumRisk: successfulResults.filter(
      (item) => item.result.finalRisk === "MEDIUM",
    ).length,
    highRisk: successfulResults.filter(
      (item) => item.result.finalRisk === "HIGH",
    ).length,
    criticalRisk: successfulResults.filter(
      (item) => item.result.finalRisk === "CRITICAL",
    ).length,
    escalations: successfulResults.filter((item) => item.result.shouldEscalate)
      .length,
    mostTriggeredRules: [...ruleCounts.entries()]
      .map(([ruleId, value]) => ({
        ruleId,
        name: value.name,
        count: value.count,
      }))
      .sort(compareCountThenLabel),
    topCategories: [...categoryCounts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort(compareCountThenLabel),
  };
}

function compareCountThenLabel<T extends { count: number }>(
  first: T,
  second: T,
) {
  if (second.count !== first.count) {
    return second.count - first.count;
  }

  return JSON.stringify(first).localeCompare(JSON.stringify(second));
}
