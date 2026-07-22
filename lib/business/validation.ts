import { z } from "zod";

import {
  auditCategories,
  businessAnalysisPurposes,
  businessReportTypes,
} from "./types";

export const saveBusinessAnalysisSchema = z.object({
  content: z.string().trim().min(1).max(12_000),
  purpose: z.enum(businessAnalysisPurposes),
  profileId: z.string().trim().min(1).max(80),
  inputType: z.string().trim().min(1).max(80).default("Pasted Text"),
  extraction: z
    .object({
      filename: z.string().trim().min(1).max(180),
      fileTypeLabel: z.string().trim().min(1).max(40),
      sizeBytes: z.number().int().nonnegative().max(10 * 1024 * 1024),
      extractedCharacterCount: z.number().int().nonnegative().max(200_000),
      pageCount: z.number().int().positive().max(1_000).optional(),
      worksheetName: z.string().trim().max(120).optional(),
      importedRowCount: z.number().int().nonnegative().max(10_000).optional(),
      importedColumnCount: z.number().int().nonnegative().max(500).optional(),
      truncated: z.boolean(),
    })
    .optional(),
  auditCategory: z.enum(auditCategories).optional(),
});

export const createBusinessReportSchema = z.object({
  analysisId: z.string().trim().min(1).max(160),
  reportType: z.enum(businessReportTypes),
});

export const saveBusinessProfileSchema = z.object({
  id: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(120),
  businessType: z.string().trim().max(120).optional(),
  context: z.string().trim().min(1).max(1_000),
  description: z.string().trim().max(2_000).optional(),
  departments: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  productsOrServices: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
  supportTone: z.string().trim().max(120).optional(),
  communicationStyle: z.string().trim().max(120).optional(),
  riskTolerance: z.enum(["Low", "Medium", "High"]).optional(),
  priorityRules: z.array(z.string().trim().min(1).max(240)).max(20).optional(),
  escalationRoles: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
  officialDomains: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
  trustedLinks: z.array(z.string().url().max(300)).max(20).optional(),
  policyNotes: z.string().trim().max(4_000).optional(),
  auditCriteria: z.array(z.string().trim().min(1).max(240)).max(20).optional(),
  budgetCategories: z.array(z.string().trim().min(1).max(120)).max(60).optional(),
  reportingCurrency: z.string().trim().max(12).optional(),
  reportingYear: z.string().trim().max(12).optional(),
  knowledgeText: z.string().trim().max(8_000).optional(),
  responseStyle: z.string().trim().min(1).max(120),
});

export type SaveBusinessAnalysisRequest = z.infer<typeof saveBusinessAnalysisSchema>;
export type CreateBusinessReportRequest = z.infer<typeof createBusinessReportSchema>;
