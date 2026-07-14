import { z } from "zod";

import { responseTones } from "./types";

const urlSchema = z
  .url("Enter a valid URL.")
  .refine((url) => url.startsWith("https://") || url.startsWith("http://"), {
    message: "URL must start with http:// or https://.",
  });

export const responseToneSchema = z.enum(responseTones);

export const projectInputSchema = z.object({
  name: z.string().trim().min(2, "Project name is required.").max(120),
  description: z.string().trim().min(10, "Description is required.").max(500),
  websiteUrl: urlSchema,
  documentationText: z
    .string()
    .trim()
    .min(20, "Documentation text is required.")
    .max(20_000),
  officialLinks: z
    .array(urlSchema)
    .max(20, "Use 20 or fewer official links.")
    .default([]),
  responseTone: responseToneSchema,
});

export const projectSchema = projectInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const projectCollectionSchema = z.array(projectSchema);

export function parseOfficialLinks(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return [];
  }

  return rawValue
    .split(/\r?\n/)
    .map((link) => link.trim())
    .filter(Boolean);
}
