import { createDefaultAiAnalysisProvider } from "../ai/default-provider";
import { analyseMessage } from "../analysis/analyse-message";
import type { HybridMessageAnalysisResult } from "../analysis/types";
import { analyseBusinessCommunication } from "../business/analyse-business-communication";
import { businessProfiles } from "../business/profiles";
import { validateNormalizedMessage, type NormalizedCommunicationMessage } from "./normalized";

export type IntegrationProcessingResult = {
  message: NormalizedCommunicationMessage;
  deterministicRuleResults: HybridMessageAnalysisResult["triggeredRules"];
  riskLevel: HybridMessageAnalysisResult["finalRisk"];
  intent: string;
  aiClassification: string;
  suggestedAction: string;
  suggestedReply: string;
  explainability: string[];
  sourceMetadata: Record<string, unknown>;
  mode: "ANALYZE_ONLY";
};

const integrationProject = {
  projectName: "Agentic Ops Integration Inbox",
  projectDescription:
    "Agentic Ops analyzes external communication channels in analyze-only mode. It must never send replies, delete messages, archive email, label email, publish posts, manage ads, ban users or moderate users automatically.",
  documentationText:
    "External integrations are currently analyze-only. Human review is required before external action. Sensitive financial, credential, account-security, legal and uncertain cases should be escalated. Supported integrations normalize messages into one Agentic Ops communication model before analysis.",
  officialLinks: ["https://agenticops.local/integrations"],
  responseTone: "PROFESSIONAL" as const,
};

export async function processNormalizedMessage(
  input: NormalizedCommunicationMessage,
): Promise<IntegrationProcessingResult> {
  const message = validateNormalizedMessage(input);
  const analysis = await analyseMessage(
    {
      ...integrationProject,
      messageContent: message.text,
      messageSource: message.source,
    },
    createDefaultAiAnalysisProvider(),
  );

  const businessAnalysis = analyseBusinessCommunication({
    content: message.text,
    purpose: "General Communication",
    profile: businessProfiles[0],
  });

  return {
    message,
    deterministicRuleResults: analysis.triggeredRules,
    riskLevel: analysis.finalRisk,
    intent:
      analysis.detectedIntent === "Unable to classify because AI analysis failed."
        ? businessAnalysis.intent
        : analysis.detectedIntent,
    aiClassification: analysis.category,
    suggestedAction: analysis.recommendedAction,
    suggestedReply: analysis.generatedReply,
    explainability: [
      `Source normalized as ${message.source}.`,
      `Final risk is ${analysis.finalRisk}; deterministic risk is ${analysis.deterministicRisk}.`,
      ...analysis.triggeredRules.map(
        (rule) => `${rule.ruleId}: ${rule.description}`,
      ),
      ...businessAnalysis.explanation.slice(0, 3),
    ],
    sourceMetadata: message.metadata ?? {},
    mode: "ANALYZE_ONLY",
  };
}
