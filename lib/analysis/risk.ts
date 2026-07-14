import type { RiskSeverity } from "../security/types";

const riskRank: Record<RiskSeverity, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

export function getHigherRisk(
  firstRisk: RiskSeverity,
  secondRisk: RiskSeverity,
): RiskSeverity {
  return riskRank[firstRisk] >= riskRank[secondRisk] ? firstRisk : secondRisk;
}
