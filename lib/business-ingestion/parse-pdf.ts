import { PDFParse } from "pdf-parse";

import type { ParsedBusinessFile, BusinessFileParseInput } from "./types";
import { boundAnalysisText, createPreview, formatBytes } from "./text-utils";

export async function parsePdfFile(
  input: BusinessFileParseInput,
): Promise<ParsedBusinessFile> {
  try {
    if (input.buffer.includes(Buffer.from("/Encrypt"))) {
      throw new Error("Password-protected or encrypted PDF files are not supported.");
    }
    const parser = new PDFParse({ data: new Uint8Array(input.buffer) });
    const parsed = await parser.getText();
    await parser.destroy();
    const extractedText = parsed.pages.map((page) => page.text).join("\n\n");
    const extractedBounded = boundAnalysisText(extractedText);
    if (!extractedBounded.text) {
      throw new Error(
        "No extractable text was found. OCR is not implemented in the current MVP.",
      );
    }

    const pageText = parsed.pages
      .map((page) => `--- Page ${page.num} ---\n${page.text}`)
      .join("\n\n");
    const bounded = boundAnalysisText(pageText);
    const pageCount = parsed.total ?? parsed.pages.length;

    return {
      filename: input.filename,
      kind: "pdf",
      fileTypeLabel: "PDF",
      sizeBytes: input.sizeBytes,
      text: bounded.text,
      preview: createPreview(bounded.text),
      extractedCharacterCount: bounded.text.length,
      truncated: bounded.truncated,
      pageCount,
      extractionSummary: `Extracted ${bounded.text.length} characters from ${pageCount} PDF page${pageCount === 1 ? "" : "s"} (${formatBytes(input.sizeBytes)}).`,
      warnings: bounded.truncated
        ? ["PDF text was truncated before analysis to keep processing bounded."]
        : [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF parsing failed.";
    if (/password|encrypted/i.test(message)) {
      throw new Error("Password-protected or encrypted PDF files are not supported.");
    }
    if (message.includes("No extractable text")) {
      throw error;
    }
    throw new Error("PDF could not be read. The file may be corrupted or unsupported.");
  }
}
