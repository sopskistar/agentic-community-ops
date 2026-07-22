import { businessUploadLimits, type TabularParseResult } from "./types";
import { sanitizeExtractedText } from "./text-utils";

export function parseCsvBuffer(buffer: Buffer): TabularParseResult {
  const content = stripBom(buffer.toString("utf8"));
  const rows = parseCsv(content);
  if (rows.length === 0) {
    throw new Error("CSV file did not contain any rows.");
  }

  return summarizeTable(rows);
}

export function summarizeTable(rows: string[][]): TabularParseResult {
  const nonEmptyRows = rows.filter((row) =>
    row.some((cell) => sanitizeCell(cell).length > 0),
  );
  if (!nonEmptyRows.length) {
    throw new Error("Uploaded table did not contain readable values.");
  }

  const headerRow = detectHeader(nonEmptyRows)
    ? nonEmptyRows[0]
    : createDefaultHeaders(nonEmptyRows[0]?.length ?? 0);
  const dataRows = detectHeader(nonEmptyRows) ? nonEmptyRows.slice(1) : nonEmptyRows;
  const importedColumnCount = Math.min(
    headerRow.length,
    businessUploadLimits.maxColumns,
  );
  const headers = headerRow
    .slice(0, businessUploadLimits.maxColumns)
    .map((cell, index) => sanitizeCell(cell) || `Column ${index + 1}`);
  const limitedRows = dataRows
    .slice(0, businessUploadLimits.maxRows)
    .map((row) =>
      row
        .slice(0, businessUploadLimits.maxColumns)
        .map((cell) => sanitizeCell(cell)),
    );
  const truncatedRowCount = Math.max(0, dataRows.length - limitedRows.length);
  const truncated =
    truncatedRowCount > 0 ||
    nonEmptyRows.some((row) => row.length > businessUploadLimits.maxColumns);

  const sampleLines = limitedRows.slice(0, 25).map((row, rowIndex) => {
    const cells = headers.map((header, index) => `${header}: ${row[index] ?? ""}`);
    return `Row ${rowIndex + 1}: ${cells.join("; ")}`;
  });
  const text = [
    `Structured data overview: ${limitedRows.length} imported rows, ${importedColumnCount} columns.`,
    headers.length ? `Detected columns: ${headers.join(", ")}.` : "",
    ...sampleLines,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    headers,
    rows: limitedRows,
    importedRowCount: limitedRows.length,
    truncatedRowCount,
    importedColumnCount,
    truncated,
    text: sanitizeExtractedText(text, businessUploadLimits.maxAnalysisCharacters),
  };
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        cell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function detectHeader(rows: string[][]) {
  if (rows.length < 2) {
    return true;
  }

  const first = rows[0].map((cell) => sanitizeCell(cell));
  const second = rows[1].map((cell) => sanitizeCell(cell));
  const firstLooksText = first.filter((cell) => /[A-Za-z]/.test(cell)).length;
  const secondLooksNumeric = second.filter((cell) => /^[$£€]?\s?\d/.test(cell)).length;
  return firstLooksText >= Math.max(1, Math.floor(first.length / 2)) || secondLooksNumeric > 0;
}

function createDefaultHeaders(length: number) {
  return Array.from({ length }, (_, index) => `Column ${index + 1}`);
}

function sanitizeCell(value: string) {
  return sanitizeExtractedText(value, businessUploadLimits.maxCellCharacters);
}

function stripBom(value: string) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}
