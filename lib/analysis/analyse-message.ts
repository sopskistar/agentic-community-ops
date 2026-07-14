import type { AiAnalysisProvider } from "../ai/types";
import { analyseSecurity } from "../security/analyse-security";
import type { RiskSeverity } from "../security/types";

import { aiMessageAnalysisSchema, messageAnalysisInputSchema } from "./schemas";
import { getHigherRisk } from "./risk";
import type {
  AiMessageAnalysis,
  HybridMessageAnalysisResult,
  MessageAnalysisInput,
} from "./types";

const escalationRisks = new Set<RiskSeverity>(["HIGH", "CRITICAL"]);

const fallbackReply =
  "Suggested reply for human review: Thanks for reporting this. A moderator should review it before any response is sent. Do not share seed phrases, private keys, passwords, OTP codes or payment details.";

export async function analyseMessage(
  input: MessageAnalysisInput,
  aiProvider: AiAnalysisProvider,
): Promise<HybridMessageAnalysisResult> {
  const parsedInput = messageAnalysisInputSchema.parse(input);
  const deterministicResult = analyseSecurity(parsedInput.messageContent);

  let aiAnalysis: AiMessageAnalysis;

  try {
    const rawAiAnalysis = await aiProvider.classifyMessage(parsedInput, {
      deterministicRisk: deterministicResult.deterministicRisk,
      triggeredRules: deterministicResult.triggeredRules,
    });
    aiAnalysis = aiMessageAnalysisSchema.parse(rawAiAnalysis);
  } catch {
    aiAnalysis = createFallbackAiAnalysis(
      deterministicResult.triggeredRules.length > 0
        ? "AI analysis failed; deterministic security rules require review."
        : "AI analysis failed; route to human review before replying.",
    );
  }

  const finalRisk = getHigherRisk(
    deterministicResult.deterministicRisk,
    aiAnalysis.aiSuggestedRisk,
  );
  const shouldEscalate =
    deterministicResult.requiresEscalation ||
    aiAnalysis.shouldEscalate ||
    escalationRisks.has(finalRisk) ||
    !aiAnalysis.answerGroundedInKnowledgeBase;
  const escalationReason = getEscalationReason(
    shouldEscalate,
    deterministicResult.triggeredRules.length > 0,
    aiAnalysis,
  );

  return {
    ...aiAnalysis,
    generatedReply: ensureSuggestedReply(aiAnalysis.generatedReply),
    deterministicRisk: deterministicResult.deterministicRisk,
    finalRisk,
    riskScore: deterministicResult.riskScore,
    triggeredRules: deterministicResult.triggeredRules,
    shouldEscalate,
    escalationReason,
  };
}

function createFallbackAiAnalysis(escalationReason: string): AiMessageAnalysis {
  return {
    category: "UNKNOWN",
    detectedIntent: "Unable to classify because AI analysis failed.",
    shortSummary: "AI analysis failed; deterministic result was preserved.",
    aiSuggestedRisk: "LOW",
    confidence: 0,
    generatedReply: fallbackReply,
    shouldEscalate: true,
    escalationReason,
    recommendedAction:
      "Use deterministic security results only and escalate for human review.",
    answerGroundedInKnowledgeBase: false,
    evidenceUsed: ["deterministic security analysis"],
  };
}

function getEscalationReason(
  shouldEscalate: boolean,
  hasTriggeredRules: boolean,
  aiAnalysis: AiMessageAnalysis,
) {
  if (!shouldEscalate) {
    return null;
  }

  if (hasTriggeredRules) {
    return "Deterministic security rules were triggered.";
  }

  if (!aiAnalysis.answerGroundedInKnowledgeBase) {
    return "Knowledge base did not contain enough information for a grounded answer.";
  }

  return aiAnalysis.escalationReason ?? "Human review is required.";
}

function ensureSuggestedReply(reply: string) {
  const normalizedReply = reply.toLowerCase();

  if (normalizedReply.includes("suggested reply for human review")) {
    return reply;
  }

  return `Suggested reply for human review: ${reply}`;
}
