import type { ResponseTone } from "../projects/types";
import type { RiskSeverity, TriggeredSecurityRule } from "../security/types";

export const analysisCategories = [
  "GENERAL_QUESTION",
  "CUSTOMER_SUPPORT",
  "TRANSACTION_ISSUE",
  "SECURITY",
  "SCAM",
  "COMPLAINT",
  "SALES_LEAD",
  "PARTNERSHIP",
  "SPAM",
  "UNKNOWN",
] as const;

export type AnalysisCategory = (typeof analysisCategories)[number];

export type MessageAnalysisInput = {
  projectName: string;
  projectDescription: string;
  documentationText: string;
  officialLinks: string[];
  responseTone: ResponseTone;
  messageContent: string;
  messageSource: string;
};

export type AiMessageAnalysis = {
  category: AnalysisCategory;
  detectedIntent: string;
  shortSummary: string;
  aiSuggestedRisk: RiskSeverity;
  confidence: number;
  generatedReply: string;
  shouldEscalate: boolean;
  escalationReason: string | null;
  recommendedAction: string;
  answerGroundedInKnowledgeBase: boolean;
  evidenceUsed: string[];
};

export type HybridMessageAnalysisResult = AiMessageAnalysis & {
  deterministicRisk: RiskSeverity;
  finalRisk: RiskSeverity;
  riskScore: number;
  triggeredRules: TriggeredSecurityRule[];
};
