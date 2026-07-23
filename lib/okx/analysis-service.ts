import { z } from "zod";

import { analyseMessage } from "../analysis/analyse-message";
import type { HybridMessageAnalysisResult } from "../analysis/types";
import { createDefaultAiAnalysisProvider } from "../ai/default-provider";
import type { AiAnalysisProvider } from "../ai/types";
import { analyseBusinessCommunication } from "../business/analyse-business-communication";
import { businessProfiles } from "../business/profiles";
import type { BusinessAnalysisPurpose } from "../business/types";

const okxContexts = [
  "web3-community",
  "customer-support",
  "business-email",
  "social-comment",
  "general",
] as const;

const okxSources = [
  "manual",
  "gmail",
  "telegram",
  "discord",
  "facebook",
  "instagram",
] as const;

const serviceTimeoutMs = 8_000;

export const okxAnalysisRequestSchema = z.object({
  content: z.string().trim().min(1).max(2_000),
  context: z.enum(okxContexts).default("general"),
  source: z.enum(okxSources).default("manual"),
});

export const okxAnalysisResponseSchema = z.object({
  summary: z.string(),
  intent: z.string(),
  sentiment: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  riskSignals: z.array(z.string()),
  recommendedAction: z.string(),
  suggestedReplyOutline: z.string(),
  requiresHumanReview: z.boolean(),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
});

export type OkxAnalysisRequest = z.infer<typeof okxAnalysisRequestSchema>;
export type OkxAnalysisResponse = z.infer<typeof okxAnalysisResponseSchema>;

export const okxAnalysisInputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["content"],
  properties: {
    content: {
      type: "string",
      minLength: 1,
      maxLength: 2000,
      description: "Communication message to analyze.",
    },
    context: {
      type: "string",
      enum: okxContexts,
      default: "general",
      description: "Communication context for the analysis.",
    },
    source: {
      type: "string",
      enum: okxSources,
      default: "manual",
      description: "Source channel label for the message.",
    },
  },
} as const;

export const okxAnalysisOutputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "intent",
    "sentiment",
    "priority",
    "riskLevel",
    "riskSignals",
    "recommendedAction",
    "suggestedReplyOutline",
    "requiresHumanReview",
    "confidence",
    "explanation",
  ],
  properties: {
    summary: { type: "string" },
    intent: { type: "string" },
    sentiment: { type: "string" },
    priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
    riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
    riskSignals: { type: "array", items: { type: "string" } },
    recommendedAction: { type: "string" },
    suggestedReplyOutline: { type: "string" },
    requiresHumanReview: { type: "boolean" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    explanation: { type: "string" },
  },
} as const;

const agenticOpsServiceProfile = {
  projectName: "AgenticOps AI Communication Risk Service",
  projectDescription:
    "AgenticOps AI analyzes communication messages for security risk, intent, priority, sentiment and human-review requirements. It never requests secrets and never performs external actions.",
  documentationText:
    "Supported current contexts include Web3 Community Security and Business Communication Intelligence. External provider messages are analyze-only. Replies and actions are suggestions for human review. Seed phrases, private keys, passwords, OTP codes, payment execution and autonomous moderation are prohibited.",
  officialLinks: ["https://agenticopsai.xyz"],
  responseTone: "PROFESSIONAL" as const,
};

export async function analyzeCommunicationRisk(
  input: unknown,
): Promise<OkxAnalysisResponse> {
  const request = okxAnalysisRequestSchema.parse(input);
  const aiProvider = createTimeoutAiProvider(createDefaultAiAnalysisProvider());
  const securityAnalysis = await analyseMessage(
    {
      ...agenticOpsServiceProfile,
      messageContent: request.content,
      messageSource: request.source,
    },
    aiProvider,
  );
  const businessAnalysis = analyseBusinessCommunication({
    content: request.content,
    purpose: purposeForContext(request.context),
    profile: businessProfiles[0],
  });

  const result: OkxAnalysisResponse = {
    summary: securityAnalysis.shortSummary || businessAnalysis.summary,
    intent:
      securityAnalysis.detectedIntent ===
      "Unable to classify because AI analysis failed."
        ? businessAnalysis.intent
        : securityAnalysis.detectedIntent,
    sentiment: businessAnalysis.sentiment.toLowerCase(),
    priority: selectPriority(securityAnalysis, businessAnalysis.priority),
    riskLevel: toOutputRisk(securityAnalysis.finalRisk),
    riskSignals: createRiskSignals(securityAnalysis),
    recommendedAction: securityAnalysis.recommendedAction,
    suggestedReplyOutline: securityAnalysis.generatedReply,
    requiresHumanReview:
      securityAnalysis.shouldEscalate || businessAnalysis.requiresHumanReview,
    confidence: Math.min(securityAnalysis.confidence, businessAnalysis.confidence),
    explanation: [
      `Source ${request.source} was treated as untrusted input.`,
      `Context ${request.context} selected ${purposeForContext(request.context)} analysis.`,
      `Deterministic risk was ${securityAnalysis.deterministicRisk}; final risk is ${securityAnalysis.finalRisk}.`,
      ...securityAnalysis.triggeredRules.map(
        (rule) => `${rule.ruleId}: ${rule.description}`,
      ),
      ...businessAnalysis.explanation.slice(0, 2),
      "External execution is not available; human approval is required before action.",
    ].join(" "),
  };

  return okxAnalysisResponseSchema.parse(result);
}

function createTimeoutAiProvider(provider: AiAnalysisProvider): AiAnalysisProvider {
  return {
    async classifyMessage(input, context) {
      return withTimeout(
        provider.classifyMessage(input, context),
        serviceTimeoutMs,
        "AI analysis timed out.",
      );
    },
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function purposeForContext(context: OkxAnalysisRequest["context"]): BusinessAnalysisPurpose {
  const map: Record<OkxAnalysisRequest["context"], BusinessAnalysisPurpose> = {
    "web3-community": "General Communication",
    "customer-support": "Customer Support",
    "business-email": "Business Email",
    "social-comment": "General Communication",
    general: "General Communication",
  };
  return map[context];
}

function selectPriority(
  securityAnalysis: HybridMessageAnalysisResult,
  businessPriority: string,
) {
  if (securityAnalysis.finalRisk === "CRITICAL") {
    return "critical";
  }

  if (securityAnalysis.finalRisk === "HIGH" || businessPriority === "High") {
    return "high";
  }

  if (securityAnalysis.finalRisk === "MEDIUM" || businessPriority === "Medium") {
    return "medium";
  }

  return "low";
}

function toOutputRisk(risk: HybridMessageAnalysisResult["finalRisk"]) {
  return risk.toLowerCase() as OkxAnalysisResponse["riskLevel"];
}

function createRiskSignals(analysis: HybridMessageAnalysisResult) {
  if (analysis.triggeredRules.length === 0) {
    return [
      `No deterministic SEC rule triggered; deterministic risk ${analysis.deterministicRisk}.`,
    ];
  }

  return analysis.triggeredRules
    .slice(0, 8)
    .map((rule) => `${rule.ruleId}: ${rule.name}`);
}
