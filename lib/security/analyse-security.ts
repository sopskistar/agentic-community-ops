import { securityRuleDefinitions } from "./rules";
import type {
  RiskSeverity,
  SecurityAnalysisResult,
  SecurityRuleDefinition,
  TriggeredSecurityRule,
} from "./types";

const severityRank: Record<RiskSeverity, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

const severityScore: Record<RiskSeverity, number> = {
  LOW: 0,
  MEDIUM: 35,
  HIGH: 70,
  CRITICAL: 100,
};

export function normalizeSecurityText(messageText: string) {
  return messageText
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\[(dot|.)\]|\((dot|.)\)/g, " [dot] ")
    .replace(/[’']/g, " ")
    .replace(/-/g, " ")
    .replace(/[^a-z0-9.:/@[\]\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectPatternEvidence(normalizedText: string, patterns: RegExp[]) {
  const evidence = new Set<string>();

  for (const pattern of patterns) {
    for (const match of normalizedText.matchAll(asGlobalPattern(pattern))) {
      const matchedText = match[0].trim();
      if (matchedText) {
        evidence.add(matchedText);
      }
    }
  }

  return [...evidence];
}

function asGlobalPattern(pattern: RegExp) {
  const flags = new Set([...pattern.flags, "g"]);
  return new RegExp(pattern.source, [...flags].join(""));
}

function hasSafeContext(
  normalizedText: string,
  rule: SecurityRuleDefinition,
) {
  return Boolean(
    rule.safeContextPatterns?.some((pattern) => pattern.test(normalizedText)),
  );
}

function getRuleEvidence(
  normalizedText: string,
  rule: SecurityRuleDefinition,
) {
  if (hasSafeContext(normalizedText, rule)) {
    return [];
  }

  const evidence = [
    ...collectPatternEvidence(normalizedText, rule.patterns),
    ...(rule.customEvidence?.(normalizedText) ?? []),
  ];

  return [...new Set(evidence)].sort();
}

function getDeterministicRisk(triggeredRules: TriggeredSecurityRule[]) {
  return triggeredRules.reduce<RiskSeverity>((highestSeverity, rule) => {
    return severityRank[rule.severity] > severityRank[highestSeverity]
      ? rule.severity
      : highestSeverity;
  }, "LOW");
}

function getRiskScore(
  deterministicRisk: RiskSeverity,
  triggeredRules: TriggeredSecurityRule[],
) {
  if (triggeredRules.length === 0) {
    return 0;
  }

  const additionalRuleWeight = Math.max(triggeredRules.length - 1, 0) * 5;
  return Math.min(100, severityScore[deterministicRisk] + additionalRuleWeight);
}

export function analyseSecurity(messageText: string): SecurityAnalysisResult {
  const normalizedText = normalizeSecurityText(messageText);

  const triggeredRules = securityRuleDefinitions
    .map((rule) => {
      const matchedEvidence = getRuleEvidence(normalizedText, rule);

      if (matchedEvidence.length === 0) {
        return null;
      }

      return {
        ruleId: rule.ruleId,
        name: rule.name,
        description: rule.description,
        matchedEvidence,
        severity: rule.severity,
        recommendedAction: rule.recommendedAction,
      };
    })
    .filter((rule): rule is TriggeredSecurityRule => rule !== null);

  const deterministicRisk = getDeterministicRisk(triggeredRules);
  const riskScore = getRiskScore(deterministicRisk, triggeredRules);
  const requiresEscalation = triggeredRules.some(
    (rule) =>
      rule.severity === "CRITICAL" ||
      rule.severity === "HIGH" ||
      securityRuleDefinitions.find(
        (definition) => definition.ruleId === rule.ruleId,
      )?.requiresEscalationByDefault,
  );

  return {
    triggeredRules,
    deterministicRisk,
    riskScore,
    requiresEscalation,
    safeToAutoReply: !requiresEscalation,
  };
}
