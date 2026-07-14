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

  aiAnalysis = enforceKnowledgeGrounding(parsedInput, aiAnalysis);

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

function enforceKnowledgeGrounding(
  input: MessageAnalysisInput,
  aiAnalysis: AiMessageAnalysis,
): AiMessageAnalysis {
  if (
    !aiAnalysis.answerGroundedInKnowledgeBase ||
    !looksLikeKnowledgeQuestion(input.messageContent)
  ) {
    return aiAnalysis;
  }

  if (hasKnowledgeCoverage(input)) {
    return aiAnalysis;
  }

  return {
    ...aiAnalysis,
    shouldEscalate: true,
    escalationReason:
      "Knowledge base did not contain enough information for a grounded answer.",
    answerGroundedInKnowledgeBase: false,
    evidenceUsed: [
      ...aiAnalysis.evidenceUsed,
      "deterministic knowledge-base coverage check",
    ],
  };
}

function looksLikeKnowledgeQuestion(messageContent: string) {
  return /\?|\b(what|where|which|how|does|do|can|is|are|when|why)\b/i.test(
    messageContent,
  );
}

function hasKnowledgeCoverage(input: MessageAnalysisInput) {
  const knowledgeText = [
    input.projectDescription,
    input.documentationText,
    ...input.officialLinks,
  ]
    .join(" ")
    .toLowerCase();
  const questionTerms = getSubstantiveQuestionTerms(input);

  if (questionTerms.length === 0) {
    return true;
  }

  const matchedTerms = questionTerms.filter((term) =>
    knowledgeText.includes(term),
  );
  const requiredMatches =
    questionTerms.length <= 2 ? 1 : Math.min(3, Math.ceil(questionTerms.length / 3));

  return matchedTerms.length >= requiredMatches;
}

function getSubstantiveQuestionTerms(input: MessageAnalysisInput) {
  const projectTerms = tokenize(input.projectName);
  const ignoredTerms = new Set([
    ...projectTerms,
    "about",
    "account",
    "could",
    "does",
    "from",
    "have",
    "help",
    "into",
    "need",
    "please",
    "read",
    "should",
    "support",
    "tell",
    "that",
    "their",
    "there",
    "this",
    "user",
    "users",
    "what",
    "when",
    "where",
    "which",
    "with",
    "would",
  ]);

  return tokenize(input.messageContent).filter((term) => !ignoredTerms.has(term));
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((term) => term.length >= 4);
}
