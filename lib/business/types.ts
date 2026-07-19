export const businessAnalysisPurposes = [
  "Customer Support",
  "Business Email",
  "Sales Conversation",
  "Internal Team",
  "General Communication",
] as const;

export type BusinessAnalysisPurpose = (typeof businessAnalysisPurposes)[number];

export const businessPriorityLevels = ["Low", "Medium", "High", "Critical"] as const;

export type BusinessPriority = (typeof businessPriorityLevels)[number];

export const businessSentiments = ["Positive", "Neutral", "Mixed", "Negative"] as const;

export type BusinessSentiment = (typeof businessSentiments)[number];

export const businessRiskLevels = ["Safe", "Low", "Medium", "High"] as const;

export type BusinessRiskLevel = (typeof businessRiskLevels)[number];

export type BusinessProfile = {
  id: string;
  name: string;
  industry: string;
  context: string;
  responseStyle: string;
};

export type BusinessAnalysisInput = {
  content: string;
  purpose: BusinessAnalysisPurpose;
  profile: BusinessProfile;
};

export type BusinessAnalysisResult = {
  summary: string;
  intent: string;
  priority: BusinessPriority;
  sentiment: BusinessSentiment;
  riskLevel: BusinessRiskLevel;
  requestedActions: string[];
  importantEntities: string[];
  recommendedNextStep: string;
  confidence: number;
  keyTopics: string[];
  suggestedActions: string[];
  recommendedReplyOutline: string[];
  explanation: string[];
  profileMetadata: {
    profileName: string;
    industry: string;
    responseStyle: string;
  };
  analysisMode: "Local demonstration logic";
};
