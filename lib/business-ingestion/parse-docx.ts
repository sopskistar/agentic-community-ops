import mammoth from "mammoth";

import type { ParsedBusinessFile, BusinessFileParseInput } from "./types";
import { boundAnalysisText, createPreview, formatBytes } from "./text-utils";

export async function parseDocxFile(
  input: BusinessFileParseInput,
): Promise<ParsedBusinessFile> {
  try {
    const result = await mammoth.extractRawText({ buffer: input.buffer });
    const bounded = boundAnalysisText(result.value ?? "");
    if (!bounded.text) {
      throw new Error("DOCX file did not contain readable text.");
    }

    const warnings = result.messages
      .map((message) => message.message)
      .filter(Boolean)
      .slice(0, 3);

    if (bounded.truncated) {
      warnings.push("DOCX text was truncated before analysis to keep processing bounded.");
    }

    return {
      filename: input.filename,
      kind: "docx",
      fileTypeLabel: "DOCX",
      sizeBytes: input.sizeBytes,
      text: bounded.text,
      preview: createPreview(bounded.text),
      extractedCharacterCount: bounded.text.length,
      truncated: bounded.truncated,
      extractionSummary: `Extracted ${bounded.text.length} characters from DOCX file (${formatBytes(input.sizeBytes)}).`,
      warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "DOCX parsing failed.";
    if (/password|encrypted/i.test(message)) {
      throw new Error("Password-protected or encrypted DOCX files are not supported.");
    }
    throw new Error("DOCX could not be read. The file may be corrupted or unsupported.");
  }
}
