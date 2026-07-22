import { describe, expect, it } from "vitest";

import { parseCsvBuffer, summarizeTable } from "./parse-csv";

describe("parseCsvBuffer", () => {
  it("parses headers, quoted values, commas and UTF-8", () => {
    const result = parseCsvBuffer(
      Buffer.from('Name,Note,Amount\n"Acme, Inc.","Café support request",$120\n'),
    );

    expect(result.headers).toEqual(["Name", "Note", "Amount"]);
    expect(result.importedRowCount).toBe(1);
    expect(result.text).toContain("Acme, Inc.");
    expect(result.text).toContain("Café");
  });

  it("enforces row and column limits with truncation metadata", () => {
    const rows = Array.from({ length: 205 }, (_, rowIndex) =>
      Array.from({ length: 35 }, (_, columnIndex) => `${rowIndex}-${columnIndex}`),
    );
    const result = summarizeTable(rows);

    expect(result.importedRowCount).toBe(200);
    expect(result.importedColumnCount).toBe(30);
    expect(result.truncatedRowCount).toBeGreaterThan(0);
    expect(result.truncated).toBe(true);
  });
});
