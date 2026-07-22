export const businessAnalysisPurposes = [
  "Customer Support",
  "Business Email",
  "Sales Conversation",
  "Internal Team",
  "General Communication",
  "Business Audit",
  "Budget Review",
] as const;

export type BusinessAnalysisPurpose = (typeof businessAnalysisPurposes)[number];

export const businessPriorityLevels = ["Low", "Medium", "High", "Critical"] as const;

export type BusinessPriority = (typeof businessPriorityLevels)[number];

export const businessSentiments = ["Positive", "Neutral", "Mixed", "Negative"] as const;

export type BusinessSentiment = (typeof businessSentiments)[number];

export const businessRiskLevels = ["Safe", "Low", "Medium", "High"] as const;

export type BusinessRiskLevel = (typeof businessRiskLevels)[number];

export const businessDepartments = [
  "Executive",
  "Finance",
  "Operations",
  "Customer Support",
  "Sales",
  "Marketing",
  "HR",
  "Engineering",
  "Security",
  "Compliance",
  "General",
] as const;

export type BusinessDepartment = (typeof businessDepartments)[number];

export type BusinessProfile = {
  id: string;
  name: string;
  industry: string;
  businessType?: string;
  context: string;
  description?: string;
  departments?: string[];
  productsOrServices?: string[];
  supportTone?: string;
  communicationStyle?: string;
  riskTolerance?: "Low" | "Medium" | "High";
  priorityRules?: string[];
  escalationRoles?: string[];
  officialDomains?: string[];
  trustedLinks?: string[];
  policyNotes?: string;
  auditCriteria?: string[];
  budgetCategories?: string[];
  reportingCurrency?: string;
  reportingYear?: string;
  knowledgeText?: string;
  responseStyle: string;
};

export type BusinessAnalysisInput = {
  content: string;
  purpose: BusinessAnalysisPurpose;
  profile: BusinessProfile;
};

export type BusinessAnalysisResult = {
  summary: string;
  executiveSummary?: string;
  communicationType?: string;
  intent: string;
  priority: BusinessPriority;
  sentiment: BusinessSentiment;
  riskLevel: BusinessRiskLevel;
  requestedActions: string[];
  importantEntities: string[];
  deadlinesOrDates: string[];
  peopleOrDepartments: string[];
  recommendedNextStep: string;
  escalationRecommendation: string;
  confidence: number;
  keyTopics: string[];
  suggestedActions: string[];
  recommendedReplyOutline: string[];
  explanation: string[];
  missingContext: string[];
  requiresHumanReview: boolean;
  dataOverview?: string[];
  notableTrends?: string[];
  exceptionsOrAnomalies?: string[];
  budgetVarianceIndicators?: string[];
  revenueExpenseObservations?: string[];
  missingOrInconsistentEntries?: string[];
  auditObservations?: string[];
  recommendedFollowUpChecks?: string[];
  scopeReviewed?: string[];
  keyFindings?: string[];
  riskIndicators?: string[];
  missingInformation?: string[];
  dataQualityConcerns?: string[];
  policyOrProcessConcerns?: string[];
  questionsRequiringHumanReview?: string[];
  preliminaryAuditScore?: string;
  profileMetadata: {
    profileName: string;
    industry: string;
    responseStyle: string;
  };
  analysisMode: "Local demonstration logic";
};

export const auditCategories = [
  "Operational Audit",
  "Communication Audit",
  "Process Audit",
  "Data Quality Audit",
  "Internal Control Review",
  "Policy Compliance Review",
  "Security Communication Review",
  "Customer Service Audit",
  "Sales Process Audit",
  "Budget Control Review",
  "Year-End Business Review",
] as const;

export type AuditCategory = (typeof auditCategories)[number];

export const auditFindingSeverities = [
  "Informational",
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export type AuditFindingSeverity = (typeof auditFindingSeverities)[number];

export const auditFindingStatuses = [
  "Open",
  "Under Review",
  "Accepted",
  "Resolved",
  "Dismissed",
] as const;

export type AuditFindingStatus = (typeof auditFindingStatuses)[number];

export type AuditFinding = {
  id: string;
  analysisId: string;
  title: string;
  category: AuditCategory;
  description: string;
  severity: AuditFindingSeverity;
  severityExplanation: string;
  confidence: number;
  sourceReference: string;
  evidenceSummary: string;
  impact: string;
  recommendation: string;
  responsibleRole: string;
  dueDateSuggestion: string;
  requiresHumanReview: boolean;
  status: AuditFindingStatus;
  createdAt: string;
  updatedAt: string;
};

export const actionRecordStatuses = [
  "Proposed",
  "Approved",
  "In Progress",
  "Completed",
  "Dismissed",
] as const;

export type ActionRecordStatus = (typeof actionRecordStatuses)[number];

export type BusinessActionRecord = {
  id: string;
  sourceAnalysisId: string;
  title: string;
  description: string;
  priority: BusinessPriority;
  responsibleRole: string;
  status: ActionRecordStatus;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  requiresApproval: boolean;
};

export const businessReportTypes = [
  "Communication Analysis Report",
  "Business Audit Report",
  "Budget Review Report",
  "Executive Summary",
  "Risk Report",
  "Department Report",
  "Year-End Business Review",
  "Findings and Recommendations Report",
] as const;

export type BusinessReportType = (typeof businessReportTypes)[number];

export type BusinessAnalysisRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  purpose: BusinessAnalysisPurpose;
  inputType: string;
  businessProfile: BusinessProfile;
  inputSummary: string;
  contentPreview: string;
  extraction?: {
    filename: string;
    fileTypeLabel: string;
    sizeBytes: number;
    extractedCharacterCount: number;
    pageCount?: number;
    worksheetName?: string;
    importedRowCount?: number;
    importedColumnCount?: number;
    truncated: boolean;
  };
  result: BusinessAnalysisResult;
  budgetIntelligence?: {
    reportingPeriod: string;
    currency: string | null;
    totalBudgeted: number | null;
    totalActual: number | null;
    totalVariance: number | null;
    totalVariancePercentage: number | null;
    variances: Array<{
      category: string;
      department: string;
      budgetedAmount: number | null;
      actualAmount: number | null;
      variance: number | null;
      variancePercentage: number | null;
      currency: string | null;
      notes: string[];
    }>;
    positiveVariances: Array<{
      category: string;
      department: string;
      budgetedAmount: number | null;
      actualAmount: number | null;
      variance: number | null;
      variancePercentage: number | null;
      currency: string | null;
      notes: string[];
    }>;
    negativeVariances: Array<{
      category: string;
      department: string;
      budgetedAmount: number | null;
      actualAmount: number | null;
      variance: number | null;
      variancePercentage: number | null;
      currency: string | null;
      notes: string[];
    }>;
    largestExpenseCategories: Array<{
      category: string;
      department: string;
      budgetedAmount: number | null;
      actualAmount: number | null;
      variance: number | null;
      variancePercentage: number | null;
      currency: string | null;
      notes: string[];
    }>;
    largestDeviations: Array<{
      category: string;
      department: string;
      budgetedAmount: number | null;
      actualAmount: number | null;
      variance: number | null;
      variancePercentage: number | null;
      currency: string | null;
      notes: string[];
    }>;
    dataQualityWarnings: string[];
    questionsForFinanceStaff: string[];
  };
  findings: AuditFinding[];
  actions: BusinessActionRecord[];
  status: "Completed" | "Needs Human Review" | "Failed";
  reportIds: string[];
};

export type BusinessReportRecord = {
  id: string;
  analysisId: string;
  reportType: BusinessReportType;
  title: string;
  businessProfileId: string;
  generatedAt: string;
  summary: string;
  findingIds: string[];
  status: "Generated";
  version: number;
  reportData: {
    scope: string;
    inputSummary: string;
    executiveSummary: string;
    findings: AuditFinding[];
    risks: string[];
    recommendations: string[];
    requiredActions: string[];
    humanReviewNotes: string[];
    limitations: string[];
    disclaimer: string;
  };
};
