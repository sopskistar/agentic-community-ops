import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { parseDocxFile } from "./parse-docx";

describe("parseDocxFile", () => {
  it("extracts paragraphs and table text", async () => {
    const buffer = await createDocxBuffer();
    const result = await parseDocxFile({
      filename: "review.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sizeBytes: buffer.length,
      buffer,
    });

    expect(result.text).toContain("Quarterly Review");
    expect(result.text).toContain("Table Cell");
    expect(result.preview).toContain("Quarterly Review");
  });

  it("rejects invalid DOCX files safely", async () => {
    await expect(
      parseDocxFile({
        filename: "bad.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sizeBytes: 10,
        buffer: Buffer.from("not a docx"),
      }),
    ).rejects.toThrow("DOCX could not be read");
  });
});

async function createDocxBuffer() {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Quarterly Review</w:t></w:r></w:p>
    <w:tbl><w:tr><w:tc><w:p><w:r><w:t>Table Cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
  </w:body>
</w:document>`,
  );
  return Buffer.from(await zip.generateAsync({ type: "nodebuffer" }));
}
