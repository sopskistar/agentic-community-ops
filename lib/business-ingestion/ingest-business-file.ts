import { parseCsvBuffer } from "./parse-csv";
import { parseDocxFile } from "./parse-docx";
import { parsePdfFile } from "./parse-pdf";
import { parseSpreadsheetFile } from "./parse-spreadsheet";
import { parseTxtFile } from "./parse-txt";
import type { BusinessFileParseInput, ParsedBusinessFile } from "./types";
import { createPreview, formatBytes, sanitizeExtractedText } from "./text-utils";
import { validateBusinessUpload } from "./validate-upload";

export async function ingestBusinessFile(
  input: BusinessFileParseInput,
): Promise<ParsedBusinessFile> {
  const validation = validateBusinessUpload(input);

  if (validation.kind === "text") {
    return parseTxtFile(input);
  }

  if (validation.kind === "pdf") {
    return parsePdfFile(input);
  }

  if (validation.kind === "docx") {
    return parseDocxFile(input);
  }

  if (validation.kind === "csv") {
    const table = parseCsvBuffer(input.buffer);
    return {
      filename: input.filename,
      kind: "csv",
      fileTypeLabel: "CSV",
      sizeBytes: input.sizeBytes,
      text: table.text,
      preview: createPreview(table.text),
      extractedCharacterCount: table.text.length,
      truncated: table.truncated,
      detectedColumns: table.headers,
      importedRowCount: table.importedRowCount,
      truncatedRowCount: table.truncatedRowCount,
      importedColumnCount: table.importedColumnCount,
      extractionSummary: `Imported ${table.importedRowCount} CSV rows and ${table.importedColumnCount} columns from ${formatBytes(input.sizeBytes)} file.`,
      warnings: table.truncated
        ? ["CSV rows or columns were truncated before analysis."]
        : [],
    };
  }

  return parseSpreadsheetFile(input);
}

export function createAnalysisContent(parsed: ParsedBusinessFile) {
  const metadataLines = [
    `Uploaded file: ${parsed.filename}`,
    `File type: ${parsed.fileTypeLabel}`,
    parsed.pageCount ? `PDF pages: ${parsed.pageCount}` : "",
    parsed.worksheetName ? `Worksheet: ${parsed.worksheetName}` : "",
    parsed.detectedColumns?.length
      ? `Detected columns: ${parsed.detectedColumns.join(", ")}`
      : "",
    parsed.importedRowCount !== undefined
      ? `Imported rows: ${parsed.importedRowCount}`
      : "",
    parsed.truncatedRowCount
      ? `Truncated rows: ${parsed.truncatedRowCount}`
      : "",
  ].filter(Boolean);

  return sanitizeExtractedText(
    [
      "AI-assisted business file review input.",
      ...metadataLines,
      "",
      parsed.text,
    ].join("\n"),
    12_000,
  );
}
