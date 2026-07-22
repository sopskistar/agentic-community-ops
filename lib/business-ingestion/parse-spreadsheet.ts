import JSZip from "jszip";

import type { ParsedBusinessFile, BusinessFileParseInput } from "./types";
import { createPreview, formatBytes } from "./text-utils";
import { summarizeTable } from "./parse-csv";

type WorkbookSheet = {
  name: string;
  path: string;
};

export async function parseSpreadsheetFile(
  input: BusinessFileParseInput,
): Promise<ParsedBusinessFile> {
  try {
    const zip = await JSZip.loadAsync(input.buffer);
    const sheets = await readWorkbookSheets(zip);
    if (sheets.length === 0) {
      throw new Error("XLSX file did not contain any worksheets.");
    }

    const selectedSheet =
      sheets.find((sheet) => sheet.name === input.worksheetName) ?? sheets[0];
    const sharedStrings = await readSharedStrings(zip);
    const rows = await readWorksheetRows(zip, selectedSheet.path, sharedStrings);
    const table = summarizeTable(rows);

    return {
      filename: input.filename,
      kind: "xlsx",
      fileTypeLabel: "XLSX",
      sizeBytes: input.sizeBytes,
      text: table.text,
      preview: createPreview(table.text),
      extractedCharacterCount: table.text.length,
      truncated: table.truncated,
      detectedColumns: table.headers,
      importedRowCount: table.importedRowCount,
      truncatedRowCount: table.truncatedRowCount,
      importedColumnCount: table.importedColumnCount,
      worksheetName: selectedSheet.name,
      availableWorksheets: sheets.map((sheet) => sheet.name),
      extractionSummary: `Imported ${table.importedRowCount} rows and ${table.importedColumnCount} columns from worksheet "${selectedSheet.name}" (${formatBytes(input.sizeBytes)}).`,
      warnings: table.truncated
        ? ["Spreadsheet rows, columns or cells were truncated before analysis."]
        : [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "XLSX parsing failed.";
    if (/password|encrypted/i.test(message)) {
      throw new Error("Password-protected or encrypted XLSX files are not supported.");
    }
    if (message.includes("did not contain any worksheets")) {
      throw error;
    }
    throw new Error("XLSX could not be read. The file may be corrupted or unsupported.");
  }
}

async function readWorkbookSheets(zip: JSZip): Promise<WorkbookSheet[]> {
  const workbookXml = await readZipText(zip, "xl/workbook.xml");
  const relsXml = await readZipText(zip, "xl/_rels/workbook.xml.rels");
  const relationshipPaths = new Map<string, string>();

  for (const relationship of matchTags(relsXml, "Relationship")) {
    const id = getAttribute(relationship, "Id");
    const target = getAttribute(relationship, "Target");
    if (id && target) {
      relationshipPaths.set(id, normalizeWorkbookTarget(target));
    }
  }

  const sheets: WorkbookSheet[] = [];
  for (const sheet of matchTags(workbookXml, "sheet")) {
    const name = getAttribute(sheet, "name");
    const relationshipId =
      getAttribute(sheet, "r:id") ?? getAttribute(sheet, "id");
    const path = relationshipId ? relationshipPaths.get(relationshipId) : null;
    if (name && path) {
      sheets.push({
        name: decodeXml(name),
        path,
      });
    }
  }

  return sheets;
}

async function readSharedStrings(zip: JSZip) {
  const file = zip.file("xl/sharedStrings.xml");
  if (!file) {
    return [];
  }

  const xml = await file.async("text");
  return matchTagBodies(xml, "si").map((item) =>
    matchTagBodies(item, "t").map(decodeXml).join(""),
  );
}

async function readWorksheetRows(
  zip: JSZip,
  path: string,
  sharedStrings: string[],
) {
  const xml = await readZipText(zip, path);
  return matchTagBodies(xml, "row")
    .map((rowXml) => readCells(rowXml, sharedStrings))
    .filter((row) => row.some((cell) => cell.length > 0));
}

function readCells(rowXml: string, sharedStrings: string[]) {
  const cells: string[] = [];
  for (const cellXml of matchTags(rowXml, "c")) {
    const reference = getAttribute(cellXml, "r");
    const type = getAttribute(cellXml, "t");
    const columnIndex = reference ? columnReferenceToIndex(reference) : cells.length;
    cells[columnIndex] = readCellValue(cellXml, type, sharedStrings);
  }

  return cells.map((cell) => cell ?? "");
}

function readCellValue(
  cellXml: string,
  type: string | undefined,
  sharedStrings: string[],
) {
  if (type === "inlineStr") {
    return matchTagBodies(cellXml, "t").map(decodeXml).join("");
  }

  const rawValue = matchTagBodies(cellXml, "v")[0];
  if (rawValue === undefined) {
    return "";
  }

  if (type === "s") {
    return sharedStrings[Number(rawValue)] ?? "";
  }

  if (type === "str") {
    return decodeXml(rawValue);
  }

  return decodeXml(rawValue);
}

async function readZipText(zip: JSZip, path: string) {
  const file = zip.file(path);
  if (!file) {
    throw new Error("XLSX could not be read. The file may be corrupted or unsupported.");
  }

  return file.async("text");
}

function matchTags(xml: string, tagName: string) {
  const regex = new RegExp(`<${tagName}\\b[^>]*(?:/>|>[\\s\\S]*?</${tagName}>)`, "g");
  return xml.match(regex) ?? [];
}

function matchTagBodies(xml: string, tagName: string) {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, "g");
  const bodies: string[] = [];
  for (const match of xml.matchAll(regex)) {
    bodies.push(match[1]);
  }
  return bodies;
}

function getAttribute(xml: string, attributeName: string) {
  const escapedName = attributeName.replace(":", "\\:");
  const match = xml.match(new RegExp(`${escapedName}="([^"]*)"`, "i"));
  return match?.[1];
}

function normalizeWorkbookTarget(target: string) {
  if (target.startsWith("/")) {
    return target.slice(1);
  }

  return target.startsWith("xl/") ? target : `xl/${target}`;
}

function columnReferenceToIndex(reference: string) {
  const letters = reference.match(/^[A-Z]+/i)?.[0].toUpperCase() ?? "";
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + letter.charCodeAt(0) - 64;
  }
  return Math.max(index - 1, 0);
}

function decodeXml(value: string) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
