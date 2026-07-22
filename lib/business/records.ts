import crypto from "crypto";

import { analyseBusinessCommunication } from "./analyse-business-communication";
import { createActionRecords, createAuditFindings } from "./audit";
import { analyzeBudgetRows, parseBudgetRowsFromText } from "./budget";
import { getBusinessProfile } from "./profiles";
import type {
  AuditCategory,
  BusinessAnalysisRecord,
  BusinessAnalysisResult,
  BusinessProfile,
} from "./types";
import type { SaveBusinessAnalysisRequest } from "./validation";

export function createBusinessAnalysisRecord({
  request,
  profile,
  now = new Date().toISOString(),
}: {
  request: SaveBusinessAnalysisRequest;
  profile?: BusinessProfile;
  now?: string;
}) {
  const businessProfile = profile ?? getBusinessProfile(request.profileId);
  const result = analyseBusinessCommunication({
    content: request.content,
    purpose: request.purpose,
    profile: businessProfile,
  });
  const id = createAnalysisId(request.content, request.purpose, now);
  const findingCategory = request.auditCategory ?? defaultAuditCategory(request.purpose);
  const findings = createAuditFindings({
    analysisId: id,
    result,
    category: findingCategory,
    now,
  });
  const budgetRows =
    request.purpose === "Budget Review" ? parseBudgetRowsFromText(request.content) : [];
  const record: BusinessAnalysisRecord = {
    id,
    createdAt: now,
    updatedAt: now,
    purpose: request.purpose,
    inputType: request.inputType,
    businessProfile,
    inputSummary: createInputSummary(request),
    contentPreview: sanitizePreview(request.content),
    extraction: request.extraction,
    result,
    budgetIntelligence:
      request.purpose === "Budget Review"
        ? analyzeBudgetRows(budgetRows)
        : undefined,
    findings,
    actions: [],
    status: result.requiresHumanReview ? "Needs Human Review" : "Completed",
    reportIds: [],
  };
  record.actions = createActionRecords(record);
  return record;
}

export function createAnalysisSummary(record: BusinessAnalysisRecord) {
  return {
    id: record.id,
    createdAt: record.createdAt,
    purpose: record.purpose,
    inputType: record.inputType,
    businessProfile: {
      id: record.businessProfile.id,
      name: record.businessProfile.name,
    },
    riskLevel: record.result.riskLevel,
    status: record.status,
    reportAvailable: record.reportIds.length > 0,
    shortSummary: record.result.summary,
    requiresHumanReview: record.result.requiresHumanReview,
    findingCount: record.findings.length,
  };
}

function createInputSummary(request: SaveBusinessAnalysisRequest) {
  if (request.extraction) {
    return `${request.extraction.fileTypeLabel} upload with ${request.extraction.extractedCharacterCount} extracted characters.`;
  }
  return `Pasted text with ${request.content.length} characters.`;
}

function sanitizePreview(content: string) {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function createAnalysisId(content: string, purpose: string, now: string) {
  const hash = crypto
    .createHash("sha256")
    .update(`${purpose}:${now}:${content.slice(0, 1_000)}`)
    .digest("hex")
    .slice(0, 24);
  return `biz_${hash}`;
}

function defaultAuditCategory(purpose: SaveBusinessAnalysisRequest["purpose"]): AuditCategory {
  if (purpose === "Business Audit") {
    return "Operational Audit";
  }
  if (purpose === "Budget Review") {
    return "Budget Control Review";
  }
  if (purpose === "Customer Support") {
    return "Customer Service Audit";
  }
  if (purpose === "Sales Conversation") {
    return "Sales Process Audit";
  }
  return "Communication Audit";
}

export function needsHumanReview(result: BusinessAnalysisResult) {
  return result.requiresHumanReview || result.riskLevel === "High";
}
