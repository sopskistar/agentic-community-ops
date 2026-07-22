import type { BusinessAnalysisRecord, BusinessReportRecord } from "./types";

export type BusinessWorkspaceMetrics = {
  totalAnalyses: number;
  auditsCompleted: number;
  budgetReviewsCompleted: number;
  openHighRiskFindings: number;
  criticalFindings: number;
  reportsGenerated: number;
  humanReviewsRequired: number;
  mostCommonPurpose: string;
  riskDistribution: Record<string, number>;
  purposeDistribution: Record<string, number>;
  findingsBySeverity: Record<string, number>;
};

export function calculateBusinessWorkspaceMetrics({
  analyses,
  reports,
}: {
  analyses: BusinessAnalysisRecord[];
  reports: BusinessReportRecord[];
}): BusinessWorkspaceMetrics {
  const findings = analyses.flatMap((analysis) => analysis.findings);
  const purposeDistribution = countBy(analyses.map((analysis) => analysis.purpose));

  return {
    totalAnalyses: analyses.length,
    auditsCompleted: analyses.filter((analysis) => analysis.purpose === "Business Audit").length,
    budgetReviewsCompleted: analyses.filter((analysis) => analysis.purpose === "Budget Review").length,
    openHighRiskFindings: findings.filter(
      (finding) =>
        finding.status === "Open" &&
        (finding.severity === "High" || finding.severity === "Critical"),
    ).length,
    criticalFindings: findings.filter((finding) => finding.severity === "Critical").length,
    reportsGenerated: reports.length,
    humanReviewsRequired: analyses.filter(
      (analysis) =>
        analysis.result.requiresHumanReview ||
        analysis.findings.some((finding) => finding.requiresHumanReview),
    ).length,
    mostCommonPurpose: findMostCommon(purposeDistribution),
    riskDistribution: countBy(analyses.map((analysis) => analysis.result.riskLevel)),
    purposeDistribution,
    findingsBySeverity: countBy(findings.map((finding) => finding.severity)),
  };
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function findMostCommon(counts: Record<string, number>) {
  const [first] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return first ? first[0] : "No analyses yet";
}
