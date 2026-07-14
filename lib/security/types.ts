export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TriggeredSecurityRule = {
  ruleId: string;
  name: string;
  description: string;
  matchedEvidence: string[];
  severity: RiskSeverity;
  recommendedAction: string;
};

export type SecurityAnalysisResult = {
  triggeredRules: TriggeredSecurityRule[];
  deterministicRisk: RiskSeverity;
  riskScore: number;
  requiresEscalation: boolean;
  safeToAutoReply: boolean;
};

export type PublicSecurityRule = Omit<
  TriggeredSecurityRule,
  "matchedEvidence"
> & {
  requiresEscalationByDefault: boolean;
};

export type SecurityRuleDefinition = PublicSecurityRule & {
  patterns: RegExp[];
  safeContextPatterns?: RegExp[];
  customEvidence?: (normalizedText: string) => string[];
};
