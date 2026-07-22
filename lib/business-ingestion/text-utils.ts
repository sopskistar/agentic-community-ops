import { businessUploadLimits } from "./types";

export function sanitizeExtractedText(value: string, maxLength = 40_000) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

export function createPreview(text: string) {
  return sanitizeExtractedText(text, businessUploadLimits.previewCharacters);
}

export function boundAnalysisText(text: string) {
  const sanitized = sanitizeExtractedText(
    text,
    businessUploadLimits.maxAnalysisCharacters + 1,
  );
  return {
    text: sanitized.slice(0, businessUploadLimits.maxAnalysisCharacters),
    truncated: sanitized.length > businessUploadLimits.maxAnalysisCharacters,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 102.4) / 10} KB`;
  }

  return `${Math.round(bytes / 1024 / 102.4) / 10} MB`;
}
