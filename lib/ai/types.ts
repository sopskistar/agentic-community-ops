import type {
  AiMessageAnalysis,
  MessageAnalysisInput,
} from "../analysis/types";
import type { RiskSeverity, TriggeredSecurityRule } from "../security/types";

export type AiAnalysisContext = {
  deterministicRisk: RiskSeverity;
  triggeredRules: TriggeredSecurityRule[];
};

export type AiAnalysisProvider = {
  classifyMessage(
    input: MessageAnalysisInput,
    context: AiAnalysisContext,
  ): Promise<AiMessageAnalysis>;
};
