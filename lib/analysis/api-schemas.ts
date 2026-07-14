import { z } from "zod";

export const messageSources = [
  "MANUAL",
  "X",
  "DISCORD",
  "TELEGRAM",
  "EMAIL",
  "OTHER",
] as const;

export const analyseApiRequestSchema = z.object({
  projectId: z.string().trim().min(1).max(120),
  message: z.object({
    content: z.string().trim().min(1).max(2_000),
    source: z.enum(messageSources),
    authorName: z.string().trim().min(1).max(120).optional(),
  }),
});

export type AnalyseApiRequest = z.infer<typeof analyseApiRequestSchema>;
