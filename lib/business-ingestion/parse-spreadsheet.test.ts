import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { parseSpreadsheetFile } from "./parse-spreadsheet";
import { validateBusinessUpload } from "./validate-upload";

describe("parseSpreadsheetFile", () => {
  it("detects worksheets and imports bounded rows and columns", async () => {
    const buffer = await createWorkbookBuffer();
    const result = await parseSpreadsheetFile({
      filename: "budget.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sizeBytes: buffer.length,
      buffer,
      worksheetName: "Budget",
    });

    expect(result.availableWorksheets).toEqual(["Budget", "Notes"]);
    expect(result.worksheetName).toBe("Budget");
    expect(result.detectedColumns).toContain("Department");
    expect(result.importedRowCount).toBeGreaterThan(0);
    expect(result.text).toContain("Revenue");
  });

  it("uses cached formula results without evaluating formulas", async () => {
    const buffer = await createWorkbookBuffer({
      sheetRows: [
        ["Metric", "Value"],
        ["Total", { formula: "1+1", value: "2" }],
      ],
    });

    const result = await parseSpreadsheetFile({
      filename: "formula.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sizeBytes: buffer.length,
      buffer,
    });

    expect(result.text).toContain("Total");
    expect(result.text).toContain("2");
    expect(result.text).not.toContain("1+1");
  });

  it("rejects macro-enabled spreadsheets and legacy XLS in validation", () => {
    expect(() =>
      validateBusinessUpload({
        filename: "macro.xlsm",
        mimeType: "application/vnd.ms-excel.sheet.macroEnabled.12",
        sizeBytes: 100,
      }),
    ).toThrow("Macro-enabled XLSM");

    expect(() =>
      validateBusinessUpload({
        filename: "legacy.xls",
        mimeType: "application/vnd.ms-excel",
        sizeBytes: 100,
      }),
    ).toThrow("Legacy XLS");
  });
});

async function createWorkbookBuffer({
  sheetRows = [
    ["Department", "Category", "Amount"],
    ["Revenue", "Line 1", "100"],
    ["Revenue", "Line 2", "101"],
  ],
}: {
  sheetRows?: Array<Array<string | { formula: string; value: string }>>;
} = {}) {
  const sharedStrings = new Map<string, number>();
  const zip = new JSZip();
  zip.file("[Content_Types].xml", contentTypesXml);
  zip.folder("_rels")?.file(".rels", packageRelationshipsXml);
  zip.folder("xl")?.file("workbook.xml", workbookXml);
  zip.folder("xl")?.folder("_rels")?.file("workbook.xml.rels", workbookRelationshipsXml);
  zip.folder("xl")?.folder("worksheets")?.file("sheet1.xml", worksheetXml(sheetRows, sharedStrings));
  zip.folder("xl")?.folder("worksheets")?.file("sheet2.xml", worksheetXml([["Note"]], sharedStrings));
  zip.folder("xl")?.file("sharedStrings.xml", sharedStringsXml(sharedStrings));
  return Buffer.from(await zip.generateAsync({ type: "nodebuffer" }));
}

function worksheetXml(
  rows: Array<Array<string | { formula: string; value: string }>>,
  sharedStrings: Map<string, number>,
) {
  const rowXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, columnIndex) => {
          const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
          if (typeof cell !== "string") {
            return `<c r="${reference}"><f>${escapeXml(cell.formula)}</f><v>${escapeXml(cell.value)}</v></c>`;
          }

          const sharedStringIndex = getSharedStringIndex(sharedStrings, cell);
          return `<c r="${reference}" t="s"><v>${sharedStringIndex}</v></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function sharedStringsXml(sharedStrings: Map<string, number>) {
  const values = [...sharedStrings.entries()]
    .sort(([, left], [, right]) => left - right)
    .map(([value]) => `<si><t>${escapeXml(value)}</t></si>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${values}</sst>`;
}

function getSharedStringIndex(sharedStrings: Map<string, number>, value: string) {
  const existing = sharedStrings.get(value);
  if (existing !== undefined) {
    return existing;
  }
  const next = sharedStrings.size;
  sharedStrings.set(value, next);
  return next;
}

function columnName(index: number) {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`;

const packageRelationshipsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const workbookXml = `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Budget" sheetId="1" r:id="rId1"/>
    <sheet name="Notes" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`;

const workbookRelationshipsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>`;
