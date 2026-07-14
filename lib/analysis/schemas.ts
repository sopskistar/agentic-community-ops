import { z } from "zod";

import { responseToneSchema } from "../projects/schemas";
import { analysisCategories } from "./types";

export const riskSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const analysisCategorySchema = z.enum(analysisCategories);

export const messageAnalysisInputSchema = z.object({
  projectName: z.string().trim().min(1),
  projectDescription: z.string().trim().min(1),
  documentationText: z.string().trim().min(1),
  officialLinks: z.array(z.url()).default([]),
  responseTone: responseToneSchema,
  messageContent: z.string().trim().min(1),
  messageSource: z.string().trim().min(1),
});

export const aiMessageAnalysisSchema = z.object({
  category: analysisCategorySchema,
  detectedIntent: z.string().trim().min(1),
  shortSummary: z.string().trim().min(1),
  aiSuggestedRisk: riskSeveritySchema,
  confidence: z.number().min(0).max(1),
  generatedReply: z.string().trim().min(1),
  shouldEscalate: z.boolean(),
  escalationReason: z.string().trim().min(1).nullable(),
  recommendedAction: z.string().trim().min(1),
  answerGroundedInKnowledgeBase: z.boolean(),
  evidenceUsed: z.array(z.string().trim().min(1)).default([]),
});
