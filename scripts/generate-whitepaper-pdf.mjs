import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const inputPath = "docs/whitepaper.md";
const outputPath = "public/whitepaper/AgenticOps-AI-White-Paper-v1.pdf";

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const maxWidth = pageWidth - margin * 2;
const lineHeight = 14;
const titleLineHeight = 24;
const sectionGap = 10;

const markdown = readFileSync(inputPath, "utf8");
const pages = [];
let currentLines = [];
let cursorY = pageHeight - margin;

function sanitize(value) {
  return value
    .normalize("NFKD")
    .replaceAll("①", "1.")
    .replaceAll("②", "2.")
    .replaceAll("—", "-")
    .replaceAll("–", "-")
    .replaceAll("“", "\"")
    .replaceAll("”", "\"")
    .replaceAll("’", "'")
    .replaceAll("•", "-")
    .replaceAll("→", "->")
    .replaceAll(/[^\x09\x0a\x0d\x20-\x7e]/g, "");
}

function pushPage() {
  pages.push(currentLines);
  currentLines = [];
  cursorY = pageHeight - margin;
}

function ensureSpace(height) {
  if (cursorY - height < margin) {
    pushPage();
  }
}

function addLine(text, size = 10, options = {}) {
  const font = options.bold ? "F2" : "F1";
  const x = options.indent ? margin + options.indent : margin;
  ensureSpace(options.lineHeight ?? lineHeight);
  currentLines.push({
    text: sanitize(text),
    x,
    y: cursorY,
    size,
    font,
  });
  cursorY -= options.lineHeight ?? lineHeight;
}

function addGap(height = sectionGap) {
  ensureSpace(height);
  cursorY -= height;
}

function wrapText(text, size = 10, indent = 0) {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  const averageCharWidth = size * 0.52;
  const charsPerLine = Math.max(
    28,
    Math.floor((maxWidth - indent) / averageCharWidth),
  );
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > charsPerLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function addParagraph(text, options = {}) {
  const size = options.size ?? 10;
  const indent = options.indent ?? 0;
  for (const line of wrapText(text, size, indent)) {
    addLine(line, size, {
      bold: options.bold,
      indent,
      lineHeight: options.lineHeight ?? lineHeight,
    });
  }
}

function stripMarkdown(value) {
  return value
    .replaceAll(/\*\*(.*?)\*\*/g, "$1")
    .replaceAll(/`([^`]+)`/g, "$1")
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

let inCodeBlock = false;
for (const rawLine of markdown.split(/\r?\n/)) {
  const line = rawLine.trimEnd();

  if (line.startsWith("```")) {
    inCodeBlock = !inCodeBlock;
    if (!inCodeBlock) {
      addGap(4);
    }
    continue;
  }

  if (inCodeBlock) {
    addParagraph(line || " ", { size: 8, indent: 14, lineHeight: 11 });
    continue;
  }

  if (!line.trim()) {
    addGap(5);
    continue;
  }

  if (line === "---") {
    addGap(16);
    continue;
  }

  if (line.startsWith("# ")) {
    addGap(12);
    addParagraph(line.replace(/^#\s+/, ""), {
      size: 17,
      bold: true,
      lineHeight: titleLineHeight,
    });
    addGap(5);
    continue;
  }

  if (line.startsWith("## ")) {
    addGap(8);
    addParagraph(line.replace(/^##\s+/, ""), {
      size: 13,
      bold: true,
      lineHeight: 18,
    });
    addGap(3);
    continue;
  }

  if (line.startsWith("- ")) {
    addParagraph(`- ${stripMarkdown(line.slice(2))}`, { indent: 12 });
    continue;
  }

  if (/^\d+\.\s+/.test(line)) {
    addParagraph(stripMarkdown(line), { indent: 12 });
    continue;
  }

  addParagraph(stripMarkdown(line));
}

if (currentLines.length > 0) {
  pushPage();
}

const objects = [];

function addObject(value) {
  objects.push(value);
  return objects.length;
}

const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
const pagesId = addObject("PAGES_PLACEHOLDER");
const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
const pageIds = [];

function escapePdfText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
  const content = [
    "BT",
    ...pages[pageIndex].map(
      (line) =>
        `/${line.font} ${line.size} Tf ${line.x.toFixed(2)} ${line.y.toFixed(2)} Td (${escapePdfText(line.text)}) Tj`,
    ),
    "ET",
  ].join("\n");
  const contentId = addObject(
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  );
  const footer = `BT /F1 8 Tf ${margin.toFixed(2)} 28 Td (AgenticOps AI Technical White Paper v1.0 - Page ${pageIndex + 1} of ${pages.length}) Tj ET`;
  const footerId = addObject(
    `<< /Length ${Buffer.byteLength(footer)} >>\nstream\n${footer}\nendstream`,
  );
  const pageId = addObject(
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents [${contentId} 0 R ${footerId} 0 R] >>`,
  );
  pageIds.push(pageId);
}

objects[pagesId - 1] =
  `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;

let pdf = "%PDF-1.4\n";
const offsets = [0];
for (let index = 0; index < objects.length; index += 1) {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let index = 1; index < offsets.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, pdf);
console.log(`Generated ${outputPath} from ${inputPath}`);
