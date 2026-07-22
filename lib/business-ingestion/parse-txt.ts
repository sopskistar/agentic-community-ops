import type { ParsedBusinessFile, BusinessFileParseInput } from "./types";
import { boundAnalysisText, createPreview, formatBytes } from "./text-utils";

export function parseTxtFile(input: BusinessFileParseInput): ParsedBusinessFile {
  const raw = input.buffer.toString("utf8");
  const bounded = boundAnalysisText(raw);
  if (!bounded.text) {
    throw new Error("TXT file did not contain readable text.");
  }

  return {
    filename: input.filename,
    kind: "text",
    fileTypeLabel: "TXT",
    sizeBytes: input.sizeBytes,
    text: bounded.text,
    preview: createPreview(bounded.text),
    extractedCharacterCount: bounded.text.length,
    truncated: bounded.truncated,
    extractionSummary: `Extracted ${bounded.text.length} characters from ${formatBytes(input.sizeBytes)} TXT file.`,
    warnings: bounded.truncated
      ? ["Content was truncated before analysis to keep processing bounded."]
      : [],
  };
}
