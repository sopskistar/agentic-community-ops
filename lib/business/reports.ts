import { businessSafetyDisclaimer } from "./audit";
import type {
  BusinessAnalysisRecord,
  BusinessReportRecord,
  BusinessReportType,
} from "./types";

export function createBusinessReport({
  analysis,
  reportType,
  now = new Date().toISOString(),
}: {
  analysis: BusinessAnalysisRecord;
  reportType: BusinessReportType;
  now?: string;
}): BusinessReportRecord {
  const title = `${reportType}: ${analysis.businessProfile.name}`;
  const recommendations = [
    analysis.result.recommendedNextStep,
    ...analysis.result.suggestedActions,
    ...analysis.findings.map((finding) => finding.recommendation),
  ].slice(0, 12);

  return {
    id: `${analysis.id}-report-${slugify(reportType)}-${Date.parse(now)}`,
    analysisId: analysis.id,
    reportType,
    title,
    businessProfileId: analysis.businessProfile.id,
    generatedAt: now,
    summary: analysis.result.executiveSummary ?? analysis.result.summary,
    findingIds: analysis.findings.map((finding) => finding.id),
    status: "Generated",
    version: 1,
    reportData: {
      scope: createReportScope(analysis),
      inputSummary: analysis.inputSummary,
      executiveSummary: analysis.result.executiveSummary ?? analysis.result.summary,
      findings: analysis.findings,
      risks: [
        `Overall risk level: ${analysis.result.riskLevel}.`,
        ...analysis.result.riskIndicators ?? [],
      ],
      recommendations,
      requiredActions: analysis.actions.map((action) => action.title),
      humanReviewNotes: createHumanReviewNotes(analysis),
      limitations: [
        "Report generation uses the stored analysis result only.",
        "No new findings are created during report generation.",
        "Original uploaded file bytes are not stored with this report.",
        "The report is not legal advice, financial advice, tax advice or certified audit assurance.",
      ],
      disclaimer: businessSafetyDisclaimer,
    },
  };
}

export function reportToJson(report: BusinessReportRecord) {
  return JSON.stringify(report, null, 2);
}

export function findingsToCsv(report: BusinessReportRecord) {
  const headers = [
    "id",
    "title",
    "category",
    "severity",
    "status",
    "responsibleRole",
    "recommendation",
    "requiresHumanReview",
  ];
  const rows = report.reportData.findings.map((finding) =>
    [
      finding.id,
      finding.title,
      finding.category,
      finding.severity,
      finding.status,
      finding.responsibleRole,
      finding.recommendation,
      String(finding.requiresHumanReview),
    ].map(escapeCsv),
  );

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

function createReportScope(analysis: BusinessAnalysisRecord) {
  return [
    `Purpose: ${analysis.purpose}`,
    `Input type: ${analysis.inputType}`,
    `Profile: ${analysis.businessProfile.name}`,
    analysis.extraction
      ? `File reviewed: ${analysis.extraction.fileTypeLabel}, ${analysis.extraction.extractedCharacterCount} extracted characters`
      : "Pasted text reviewed",
  ].join("; ");
}

function createHumanReviewNotes(analysis: BusinessAnalysisRecord) {
  const notes = [
    analysis.result.escalationRecommendation,
    ...analysis.result.missingContext,
  ];
  if (analysis.findings.some((finding) => finding.requiresHumanReview)) {
    notes.push("One or more findings require human review before decisions.");
  }
  return notes;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, "\"\"")}"`;
}
