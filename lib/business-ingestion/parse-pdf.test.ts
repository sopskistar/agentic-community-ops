import { describe, expect, it } from "vitest";

import { parsePdfFile } from "./parse-pdf";

describe("parsePdfFile", () => {
  it("extracts text and page count from a text PDF", async () => {
    const result = await parsePdfFile({
      filename: "sample.pdf",
      mimeType: "application/pdf",
      sizeBytes: samplePdf.length,
      buffer: Buffer.from(samplePdf),
    });

    expect(result.pageCount).toBe(1);
    expect(result.text).toContain("Hello PDF text");
    expect(result.extractedCharacterCount).toBeGreaterThan(0);
  });

  it("reports PDFs with no extractable text", async () => {
    await expect(
      parsePdfFile({
        filename: "empty.pdf",
        mimeType: "application/pdf",
        sizeBytes: noTextPdf.length,
        buffer: Buffer.from(noTextPdf),
      }),
    ).rejects.toThrow("No extractable text was found");
  });

  it("rejects encrypted and corrupted PDFs safely", async () => {
    await expect(
      parsePdfFile({
        filename: "encrypted.pdf",
        mimeType: "application/pdf",
        sizeBytes: encryptedPdf.length,
        buffer: Buffer.from(encryptedPdf),
      }),
    ).rejects.toThrow("encrypted PDF");

    await expect(
      parsePdfFile({
        filename: "bad.pdf",
        mimeType: "application/pdf",
        sizeBytes: 4,
        buffer: Buffer.from("nope"),
      }),
    ).rejects.toThrow("could not be read");
  });
});

const samplePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 24 Tf 72 720 Td (Hello PDF text) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000251 00000 n 
0000000345 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
415
%%EOF`;

const noTextPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer << /Size 4 /Root 1 0 R >>
startxref
200
%%EOF`;

const encryptedPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
trailer << /Root 1 0 R /Encrypt 3 0 R >>
%%EOF`;
