import type {
  AuditCategory,
  AuditFinding,
  AuditFindingSeverity,
  BusinessAnalysisRecord,
  BusinessAnalysisResult,
  BusinessPriority,
} from "./types";

export const businessSafetyDisclaimer =
  "AgenticOps AI provides preliminary business and data-review assistance. Findings must be verified by qualified human professionals.";

export function createAuditFindings({
  analysisId,
  result,
  category,
  now = new Date().toISOString(),
}: {
  analysisId: string;
  result: BusinessAnalysisResult;
  category: AuditCategory;
  now?: string;
}) {
  const findings: AuditFinding[] = [];
  const candidateFindings = [
    ...result.riskIndicators ?? [],
    ...result.dataQualityConcerns ?? [],
    ...result.policyOrProcessConcerns ?? [],
    ...result.missingInformation ?? [],
    ...result.missingOrInconsistentEntries ?? [],
    ...result.exceptionsOrAnomalies ?? [],
  ].filter((item) => !/^No .* detected/i.test(item));

  const sourceFindings = candidateFindings.length > 0
    ? candidateFindings
    : result.requiresHumanReview
      ? result.missingContext
      : ["No material issue detected by local rules; retain evidence for human review."];

  sourceFindings.slice(0, 8).forEach((description, index) => {
    const severity = deriveFindingSeverity(description, result.riskLevel, result.priority);
    findings.push({
      id: `${analysisId}-finding-${index + 1}`,
      analysisId,
      title: createFindingTitle(description, severity),
      category,
      description,
      severity,
      severityExplanation: explainFindingSeverity(severity, description),
      confidence: result.confidence,
      sourceReference: `Analysis summary item ${index + 1}`,
      evidenceSummary: description,
      impact: createImpact(severity),
      recommendation: result.recommendedFollowUpChecks?.[index] ??
        result.suggestedActions[index] ??
        result.recommendedNextStep,
      responsibleRole: inferResponsibleRole(description),
      dueDateSuggestion: severity === "Critical" || severity === "High"
        ? "Immediate human review"
        : "Next review cycle",
      requiresHumanReview: severity === "High" || severity === "Critical" || result.requiresHumanReview,
      status: "Open",
      createdAt: now,
      updatedAt: now,
    });
  });

  return findings;
}

export function createActionRecords(record: BusinessAnalysisRecord) {
  return record.result.suggestedActions.slice(0, 6).map((action, index) => ({
    id: `${record.id}-action-${index + 1}`,
    sourceAnalysisId: record.id,
    title: action.replace(/\.$/, ""),
    description:
      index === 0
        ? record.result.recommendedNextStep
        : "Internal proposed action only. It does not execute in external systems.",
    priority: mapSeverityToPriority(record.findings[index]?.severity, record.result.priority),
    responsibleRole: record.findings[index]?.responsibleRole ?? "Business Owner",
    status: "Proposed" as const,
    targetDate: record.findings[index]?.dueDateSuggestion,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    requiresApproval: true,
  }));
}

function deriveFindingSeverity(
  description: string,
  riskLevel: BusinessAnalysisResult["riskLevel"],
  priority: BusinessPriority,
): AuditFindingSeverity {
  const lower = description.toLowerCase();
  if (
    riskLevel === "High" ||
    priority === "Critical" ||
    lower.includes("fraud") ||
    lower.includes("breach") ||
    lower.includes("lawsuit")
  ) {
    return "Critical";
  }

  if (
    lower.includes("missing") ||
    lower.includes("policy") ||
    lower.includes("approval") ||
    lower.includes("security")
  ) {
    return "High";
  }

  if (
    lower.includes("inconsistent") ||
    lower.includes("duplicate") ||
    lower.includes("variance") ||
    riskLevel === "Medium"
  ) {
    return "Medium";
  }

  return description.startsWith("No material") ? "Informational" : "Low";
}

function explainFindingSeverity(
  severity: AuditFindingSeverity,
  description: string,
) {
  return `${severity} severity was assigned because the finding references ${
    description.toLowerCase().includes("missing")
      ? "missing evidence or incomplete data"
      : description.toLowerCase().includes("policy")
        ? "policy, approval or process concerns"
        : description.toLowerCase().includes("variance")
          ? "variance or budget-review terms"
          : "the local risk, priority and evidence wording"
  }.`;
}

function createFindingTitle(description: string, severity: AuditFindingSeverity) {
  const title = description.replace(/\.$/, "").slice(0, 70);
  return `${severity}: ${title}`;
}

function createImpact(severity: AuditFindingSeverity) {
  if (severity === "Critical" || severity === "High") {
    return "Could affect management decisions, customer trust, controls or financial review if unverified.";
  }

  if (severity === "Medium") {
    return "May require follow-up to improve data quality, process clarity or operational accountability.";
  }

  return "Low immediate impact based on supplied information, but retain for evidence review.";
}

function inferResponsibleRole(description: string) {
  const lower = description.toLowerCase();
  if (lower.includes("budget") || lower.includes("invoice") || lower.includes("payment")) {
    return "Finance Team";
  }
  if (lower.includes("customer") || lower.includes("support")) {
    return "Customer Support Manager";
  }
  if (lower.includes("sales") || lower.includes("revenue")) {
    return "Sales Lead";
  }
  if (lower.includes("policy") || lower.includes("compliance")) {
    return "Compliance Lead";
  }
  if (lower.includes("security")) {
    return "Security Lead";
  }
  return "Operations Lead";
}

function mapSeverityToPriority(
  severity: AuditFindingSeverity | undefined,
  fallback: BusinessPriority,
): BusinessPriority {
  if (severity === "Critical") {
    return "Critical";
  }
  if (severity === "High") {
    return "High";
  }
  if (severity === "Medium") {
    return "Medium";
  }
  return fallback;
}
