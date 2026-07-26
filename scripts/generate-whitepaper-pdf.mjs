import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const outputPath = "public/whitepaper/AgenticOps-AI-White-Paper-v1.pdf";
const avatarPath = "public/logos/agenticops-ai-avatar-v2.jpg";

const pageWidth = 612;
const pageHeight = 792;
const margin = 58;
const contentWidth = pageWidth - margin * 2;
const footerY = 30;
const topY = pageHeight - margin;
const bottomY = margin;

const palette = {
  navy: [8, 18, 44],
  blue: [21, 68, 133],
  cyan: [20, 184, 220],
  slate: [37, 50, 69],
  muted: [91, 107, 128],
  light: [241, 245, 249],
  border: [203, 213, 225],
  white: [255, 255, 255],
};

const body = {
  font: "F1",
  size: 10.5,
  lineHeight: 15,
  color: palette.slate,
};

const whitePaper = {
  title: "AgenticOps AI",
  subtitle: "AI Security and Communication Intelligence Platform",
  documentType: "Technical White Paper",
  version: "Version 1.0",
  date: "July 2026",
  sections: [
    {
      title: "Executive Summary",
      paragraphs: [
        "AgenticOps AI is an AI Security and Communication Intelligence Platform for teams that need to understand, prioritize, and safely respond to modern communications. It combines deterministic security rules, AI-assisted analysis, explainable risk scoring, confidence scoring, and human approval workflows.",
        "Version 1.0 focuses on two implemented communication contexts: Web3 Community Security and Business Communication Intelligence. The platform also includes document analysis, connected ingestion foundations, a Communication Inbox, a Human Approval Center, event logs, reports, and durable workflow storage.",
        "The product is intentionally safety-first. It analyzes messages and documents, explains risks, recommends actions, and keeps humans in control. It does not autonomously send emails, reply to communities, moderate users, modify inboxes, spend money, or launch campaigns.",
      ],
    },
    {
      title: "Problem Statement",
      paragraphs: [
        "Organizations now operate across fragmented communication surfaces: community chat, email, social messaging, business documents, spreadsheets, and support workflows. Important risks and opportunities are spread across these channels.",
      ],
      bullets: [
        "Web3 scams, phishing, fake administrators, and social engineering move quickly through community channels.",
        "Manual moderation is slow, inconsistent, and difficult to audit.",
        "Business communication overload hides urgent requests, complaints, leads, and operational risks.",
        "Documents and spreadsheets contain valuable business signals but are often reviewed separately from communication records.",
        "Teams lack a single explainable system for message normalization, risk analysis, recommended actions, and review history.",
      ],
    },
    {
      title: "AgenticOps AI Solution",
      paragraphs: [
        "AgenticOps AI provides one shared intelligence engine for communication and document review. Inputs are validated, normalized, assigned a communication context, analyzed by deterministic rules where appropriate, evaluated by AI-assisted reasoning, and presented as structured outputs.",
        "The system supports safe decision support rather than autonomous external execution. Reviewers receive summaries, risk signals, intent, sentiment, priority, recommended actions, suggested reply outlines, confidence, and explanation.",
      ],
      callouts: [
        "Implemented: Web3 Community Security, Business Communication Intelligence, supported file analysis, connected ingestion foundations, event log, reports, and human approval records.",
        "Future: broader email actions, customer support workflows, marketing intelligence, CRM integrations, advertising intelligence, and AI business operator automation.",
      ],
    },
    {
      title: "Security and Communication Intelligence Engine",
      paragraphs: [
        "The engine is provider-neutral. Source channels do not automatically determine risk. A Telegram message, Discord message, Gmail message, Facebook Messenger event, Instagram foundation event, manual input, or document upload is normalized before analysis.",
        "Context-aware analysis then determines whether the message should be treated as Web3 security, business communication, email intelligence, social communication, or a general communication review.",
      ],
      bullets: [
        "Risk: scams, phishing, impersonation, credential requests, malicious links, abuse, and operational risk.",
        "Intent: support request, complaint, purchase intent, lead, FAQ, feedback, abuse, scam, phishing, or unknown.",
        "Priority: low, medium, high, or critical based on urgency, risk, and requested action.",
        "Review: sensitive outputs remain approval-required and non-executing by default.",
      ],
    },
    {
      title: "Deterministic Security Rules",
      paragraphs: [
        "The deterministic rule catalogue originated with the Web3 Community Security MVP. The active catalogue includes SEC-001 through SEC-015 and detects high-confidence security patterns such as seed phrase requests, private-key requests, fake administrator behavior, suspicious links, remote access requests, OTP/password requests, prompt injection, spam, and abuse.",
        "Deterministic rules are stable, reproducible, and auditable. They provide rule IDs, evidence, severity, and recommended action. Business Communication Intelligence also uses structured explainable analysis, but it is not falsely described as applying every Web3 security rule in every business context.",
      ],
    },
    {
      title: "AI-Assisted Analysis",
      paragraphs: [
        "OpenRouter-compatible LLM reasoning adds summarization, sentiment, intent classification, priority assessment, missing-context detection, confidence scoring, suggested next steps, and reply outlines.",
        "AI reasoning is useful for ambiguous communications where deterministic rules alone are not enough. AgenticOps AI uses AI to support human judgment, not replace it.",
      ],
      bullets: [
        "Outputs are structured and schema-oriented.",
        "Errors are sanitized and bounded.",
        "Risk and confidence are explained in plain language.",
        "AI recommendations remain subject to human review.",
      ],
    },
    {
      title: "Human Approval Workflow",
      paragraphs: [
        "AgenticOps AI separates received messages, AI analysis, suggested responses, human approval, approved execution, and audit history. Version 1.0 generates suggested replies and recommended actions, but external execution remains unavailable or approval-required.",
      ],
      bullets: [
        "No automatic email sending or Gmail modification.",
        "No automatic Telegram, Discord, Facebook, or Instagram replies.",
        "No automatic moderation, bans, deletions, ad actions, payment actions, or CRM writeback.",
        "Approval updates internal review state unless a future provider-specific execution system is explicitly authorized and audited.",
      ],
    },
    {
      title: "Web3 Security Use Cases",
      bullets: [
        "Detect seed phrase, private key, wallet recovery, and credential requests.",
        "Identify fake administrator and impersonation messages.",
        "Flag malicious or suspicious links.",
        "Detect phishing, scams, abuse, spam, and prompt injection attempts.",
        "Generate safe moderator reply guidance for human review.",
        "Run batch analysis and produce auditable security reports.",
      ],
    },
    {
      title: "Business Communication Use Cases",
      bullets: [
        "Analyze pasted business messages and supported document uploads.",
        "Classify customer support, business email, sales conversation, internal team, general communication, business audit, and budget review purposes.",
        "Extract and analyze TXT, text-based PDF, DOCX, CSV, and XLSX content.",
        "Generate executive summaries, risk indicators, missing context, recommended actions, and report-ready findings.",
        "Support preliminary business review, not certified accounting, statutory audit, legal advice, or financial advice.",
      ],
    },
    {
      title: "Integrations",
      paragraphs: [
        "Version 1.0 includes implemented and foundation-level communication integrations. These integrations feed the shared normalized message pipeline and preserve analyze-only or approval-required boundaries.",
      ],
      bullets: [
        "Gmail: readonly OAuth connection, manual sync, message normalization, analysis, and suggestions. No send, modify, archive, label, or delete.",
        "Telegram: webhook ingestion, secret validation, text-message normalization, analysis, and approval-required suggestions.",
        "Discord: persistent Gateway worker, normalized message handoff, shared analysis pipeline, and durable event workflow.",
        "Facebook Messenger: webhook verification, signature validation, supported message-event normalization, analysis, and persistence where events are delivered.",
        "Instagram: verified webhook and supported payload foundation. Broader production event coverage depends on provider configuration, permissions, and delivery.",
      ],
    },
    {
      title: "A2MCP / OKX.AI Service",
      paragraphs: [
        "AgenticOps AI exposes an A2MCP-compatible Communication Intelligence service for external AI systems. The callable tool is analyze_communication_risk.",
        "Production endpoints are https://agenticopsai.xyz/api/mcp, https://agenticopsai.xyz/api/okx/analyze, and https://agenticopsai.xyz/api/v1/health.",
        "The service accepts bounded message content, communication context, and source channel. It returns summary, intent, sentiment, priority, risk level, risk signals, recommended action, suggested reply outline, human-review requirement, confidence, and explanation.",
        "The OKX service is analyze-only and does not expose OAuth operations, provider credentials, approval mutation, Gmail synchronization, private integration events, or autonomous execution.",
      ],
    },
    {
      title: "Architecture",
      paragraphs: [
        "The architecture uses a shared validation, normalization, analysis, output, and audit pattern. Provider adapters remain separate from the core analysis engine.",
      ],
      diagram: [
        "Incoming Message or File",
        "Validate and Bound Input",
        "Normalize Message or Data",
        "Identify Communication Context",
        "Deterministic Checks",
        "AI-Assisted Analysis",
        "Structured Risk and Intent Output",
        "Inbox, Reports, Approval Center, Event Log",
      ],
    },
    {
      title: "Privacy and Safety",
      bullets: [
        "Provider credentials stay server-side.",
        "Google OAuth tokens are encrypted at rest when durable storage is configured.",
        "Gmail uses readonly scope only.",
        "Inputs and outputs are bounded.",
        "Webhook signatures and secrets are validated where configured.",
        "Raw provider payloads and unbounded private message bodies are not stored by default.",
        "Human review remains the boundary for sensitive recommendations and future external actions.",
      ],
    },
    {
      title: "Roadmap",
      paragraphs: [
        "The following capabilities are planned future work and must not be interpreted as implemented Version 1.0 features.",
      ],
      bullets: [
        "Communication channels: X, LinkedIn, Slack, Microsoft Teams, WhatsApp Business, and live chat.",
        "Social intelligence: broader social comment intelligence, direct-message intelligence, brand monitoring, and reputation analytics.",
        "Marketing intelligence: social ad management with human approval and AI marketing intelligence.",
        "Business operations: Gmail send/modify actions with user approval, calendar intelligence, workflow automation, and CRM integrations.",
        "Enterprise: BigQuery, Google Cloud integrations, business intelligence expansion, organization management, workspaces, billing, and role-based access.",
        "AI platform: multiple LLM providers, AI agent orchestration, and AI business operator workflows.",
      ],
    },
    {
      title: "Conclusion",
      breakBefore: true,
      paragraphs: [
        "AgenticOps AI Version 1.0 is the first production release of an AI Security and Communication Intelligence Platform. It provides practical Web3 security analysis, business communication intelligence, document analysis, integrations, explainable outputs, reports, durable event workflows, and human approval boundaries.",
        "The long-term vision is a broader AI operations layer for communication, business intelligence, audit, compliance, marketing, and workflow automation. The Version 1.0 boundary remains clear: analyze communications, explain risk, recommend actions, and keep humans in control.",
      ],
      bullets: [
        "Implemented today: Web3 Community Security, Business Communication Intelligence, supported file analysis, connected ingestion foundations, reports, event logs, and approval-required recommendations.",
        "Not autonomous: AgenticOps AI does not send messages, modify inboxes, moderate users, launch campaigns, spend money, or change external systems without future explicit authorization and audit controls.",
        "Roadmap direction: expand communication intelligence into broader email, customer support, marketing, CRM, business data, audit, compliance, and AI operations workflows.",
        "Production service: agenticopsai.xyz hosts the website, MCP endpoint, analysis endpoint, and health endpoint used by the callable service.",
        "Operating model: deterministic checks, AI-assisted reasoning, structured outputs, durable event records, and human approval work together to support auditable decisions.",
        "Review boundary: Version 1.0 is decision-support software and does not claim certified audit, legal advice, financial advice, or autonomous business management.",
      ],
    },
  ],
};

const pages = [];
let page = null;
let cursorY = topY;

function rgb(values) {
  return values.map((value) => (value / 255).toFixed(4)).join(" ");
}

function escapePdfText(value) {
  return value
    .normalize("NFKD")
    .replaceAll("’", "'")
    .replaceAll("“", "\"")
    .replaceAll("”", "\"")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("•", "-")
    .replaceAll("→", "->")
    .replaceAll(/[^\x09\x0a\x0d\x20-\x7e]/g, "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function newPage({ cover = false } = {}) {
  page = { cover, commands: [], audit: [] };
  pages.push(page);
  cursorY = topY;
}

function addRaw(command) {
  page.commands.push(command);
}

function addRect(x, y, width, height, color, stroke = null) {
  addRaw(`q ${rgb(color)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f Q`);
  if (stroke) {
    addRaw(`q ${rgb(stroke)} RG 0.8 w ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S Q`);
  }
}

function addImage(x, y, width, height) {
  addRaw(`q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /ImAvatar Do Q`);
  page.audit.push({ type: "image", x, y, width, height });
}

function addText(text, x, y, options = {}) {
  const font = options.font ?? body.font;
  const size = options.size ?? body.size;
  const color = options.color ?? body.color;
  addRaw(`BT ${rgb(color)} rg /${font} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET`);
  page.audit.push({ type: "text", x, y, size, text, color });
}

function estimateTextWidth(text, size, font = "F1") {
  const factor = font === "F2" ? 0.57 : 0.52;
  return text.length * size * factor;
}

function wrap(text, size = body.size, width = contentWidth, font = "F1") {
  const sanitized = escapePdfText(text).replaceAll("\\(", "(").replaceAll("\\)", ")").replaceAll("\\\\", "\\");
  const words = sanitized.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (estimateTextWidth(candidate, size, font) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function ensureSpace(height) {
  if (cursorY - height < bottomY + 24) {
    addFooter();
    newPage();
  }
}

function addHeading(title) {
  ensureSpace(58);
  addText(title, margin, cursorY, {
    font: "F2",
    size: 20,
    color: palette.navy,
  });
  cursorY -= 10;
  addRect(margin, cursorY, 92, 3, palette.cyan);
  cursorY -= 24;
}

function addParagraph(text, options = {}) {
  const size = options.size ?? body.size;
  const lineHeight = options.lineHeight ?? body.lineHeight;
  const x = options.x ?? margin;
  const width = options.width ?? contentWidth;
  const font = options.font ?? body.font;
  const color = options.color ?? body.color;
  const lines = wrap(text, size, width, font);
  ensureSpace(lines.length * lineHeight + 4);
  for (const line of lines) {
    addText(line, x, cursorY, { font, size, color });
    cursorY -= lineHeight;
  }
  cursorY -= options.after ?? 4;
}

function addBullet(text) {
  const size = 10.2;
  const lineHeight = 14.5;
  const bulletX = margin + 8;
  const textX = margin + 24;
  const width = contentWidth - 24;
  const lines = wrap(text, size, width);
  ensureSpace(lines.length * lineHeight + 5);
  addText("-", bulletX, cursorY, { font: "F2", size, color: palette.cyan });
  for (let index = 0; index < lines.length; index += 1) {
    addText(lines[index], textX, cursorY, { size, color: palette.slate });
    cursorY -= lineHeight;
  }
  cursorY -= 2;
}

function addCallout(text, index) {
  const boxHeight = 58;
  ensureSpace(boxHeight + 12);
  addRect(margin, cursorY - boxHeight + 12, contentWidth, boxHeight, index === 0 ? [232, 252, 245] : [239, 246, 255], index === 0 ? [167, 243, 208] : [191, 219, 254]);
  addParagraph(text, {
    x: margin + 16,
    width: contentWidth - 32,
    size: 10.2,
    lineHeight: 14,
    after: 0,
    color: palette.slate,
  });
  cursorY -= 12;
}

function addDiagram(stages) {
  const boxHeight = 34;
  const gap = 10;
  const boxWidth = (contentWidth - gap) / 2;
  const rows = Math.ceil(stages.length / 2);
  ensureSpace(rows * (boxHeight + gap) + 8);
  for (let index = 0; index < stages.length; index += 1) {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + column * (boxWidth + gap);
    const y = cursorY - row * (boxHeight + gap) - boxHeight;
    addRect(x, y, boxWidth, boxHeight, palette.light, palette.border);
    addText(`${index + 1}. ${stages[index]}`, x + 10, y + 13, {
      font: "F2",
      size: 9.6,
      color: palette.navy,
    });
  }
  cursorY -= rows * (boxHeight + gap) + 4;
}

function addFooter() {
  if (page.cover) return;
  addRect(margin, footerY + 11, contentWidth, 0.8, palette.border);
  addText("AgenticOps AI Technical White Paper v1.0", margin, footerY, {
    size: 8.8,
    color: palette.muted,
  });
  addText(`Page ${pages.indexOf(page) + 1}`, pageWidth - margin - 42, footerY, {
    size: 8.8,
    color: palette.muted,
  });
}

function renderCover() {
  newPage({ cover: true });
  addRect(0, 0, pageWidth, pageHeight, palette.navy);
  addRect(0, pageHeight - 170, pageWidth, 170, [10, 35, 72]);
  addImage(pageWidth - margin - 146, pageHeight - margin - 146, 146, 146);
  addText(whitePaper.documentType.toUpperCase(), margin, pageHeight - 115, {
    font: "F2",
    size: 10,
    color: palette.cyan,
  });
  addText(whitePaper.title, margin, pageHeight - 196, {
    font: "F2",
    size: 34,
    color: palette.white,
  });
  cursorY = pageHeight - 260;
  for (const line of wrap(whitePaper.subtitle, 22, 340, "F2")) {
    addText(line, margin, cursorY, {
      font: "F2",
      size: 22,
      color: [226, 232, 240],
    });
    cursorY -= 28;
  }
  cursorY -= 38;
  addRect(margin, cursorY + 14, 116, 4, palette.cyan);
  addParagraph("A production-ready technical overview of the AgenticOps AI platform, implemented capabilities, safety model, OKX.AI service, and planned roadmap.", {
    x: margin,
    width: 420,
    size: 12.5,
    lineHeight: 18,
    color: [226, 232, 240],
  });
  addText(whitePaper.version, margin, 128, { font: "F2", size: 13, color: palette.white });
  addText(whitePaper.date, margin, 106, { size: 11, color: [203, 213, 225] });
  addText("agenticopsai.xyz", margin, 78, { font: "F2", size: 11, color: palette.cyan });
}

function renderSection(section) {
  if (section.breakBefore && cursorY < topY - 24) {
    addFooter();
    newPage();
  }
  addHeading(section.title);
  for (const paragraph of section.paragraphs ?? []) {
    addParagraph(paragraph);
  }
  for (const callout of section.callouts ?? []) {
    addCallout(callout, section.callouts.indexOf(callout));
  }
  for (const bullet of section.bullets ?? []) {
    addBullet(bullet);
  }
  if (section.diagram) {
    addDiagram(section.diagram);
  }
  cursorY -= 8;
}

renderCover();
newPage();
for (const section of whitePaper.sections) {
  renderSection(section);
}
addFooter();

for (const candidate of pages) {
  page = candidate;
  if (!candidate.cover) {
    const hasFooter = candidate.commands.some((command) => command.includes("Page "));
    if (!hasFooter) addFooter();
  }
}

const avatar = readFileSync(avatarPath);
const avatarMeta = await sharp(avatarPath).metadata();
if (avatarMeta.width !== 1080 || avatarMeta.height !== 1080 || avatarMeta.hasAlpha) {
  throw new Error("Avatar must be a 1080x1080 solid-background image before PDF generation.");
}

function auditPages() {
  const failures = [];
  pages.forEach((candidate, index) => {
    const textEntries = candidate.audit.filter((entry) => entry.type === "text");
    if (textEntries.length === 0) {
      failures.push(`Page ${index + 1} has no text.`);
    }
    for (const entry of textEntries) {
      if (entry.size < 8.5) failures.push(`Page ${index + 1} has text below readable minimum.`);
      if (!candidate.cover && (entry.x < margin - 1 || entry.y < footerY - 2 || entry.y > pageHeight - 38)) {
        failures.push(`Page ${index + 1} has text outside printable bounds.`);
      }
    }
  });
  if (failures.length > 0) {
    throw new Error(`PDF layout audit failed:\n${failures.join("\n")}`);
  }
}

auditPages();

const objects = [];
function addObject(value) {
  objects.push(value);
  return objects.length;
}

const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
const pagesId = addObject("PAGES_PLACEHOLDER");
const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
const avatarId = addObject(`<< /Type /XObject /Subtype /Image /Width ${avatarMeta.width} /Height ${avatarMeta.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${avatar.length} >>\nstream\n${avatar.toString("binary")}\nendstream`);
const pageIds = [];

for (const renderedPage of pages) {
  const content = renderedPage.commands.join("\n");
  const contentId = addObject(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
  const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> /XObject << /ImAvatar ${avatarId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  pageIds.push(pageId);
}

objects[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;

let pdf = "%PDF-1.4\n";
const offsets = [0];
for (let index = 0; index < objects.length; index += 1) {
  offsets.push(Buffer.byteLength(pdf, "binary"));
  pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, "binary");
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let index = 1; index < offsets.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, Buffer.from(pdf, "binary"));
console.log(`Generated ${outputPath}`);
console.log(`Pages: ${pages.length}`);
console.log("Layout audit: passed");

if (process.env.WHITEPAPER_PREVIEW_DIR) {
  const previewDir = process.env.WHITEPAPER_PREVIEW_DIR;
  mkdirSync(previewDir, { recursive: true });
  const avatarDataUri = `data:image/jpeg;base64,${avatar.toString("base64")}`;
  const toHex = (values) =>
    `#${values.map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("")}`;
  const escapeXml = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;");

  for (const [index, renderedPage] of pages.entries()) {
    const elements = [];
    elements.push(
      `<rect x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="${renderedPage.cover ? "#08122c" : "#ffffff"}"/>`,
    );
    if (renderedPage.cover) {
      elements.push(`<rect x="0" y="0" width="${pageWidth}" height="170" fill="#0a2348"/>`);
    }
    for (const entry of renderedPage.audit) {
      if (entry.type === "image") {
        elements.push(
          `<image href="${avatarDataUri}" x="${entry.x}" y="${pageHeight - entry.y - entry.height}" width="${entry.width}" height="${entry.height}"/>`,
        );
      }
      if (entry.type === "text") {
        elements.push(
          `<text x="${entry.x}" y="${pageHeight - entry.y}" font-family="Arial, Helvetica, sans-serif" font-size="${entry.size}" fill="${toHex(entry.color)}">${escapeXml(entry.text)}</text>`,
        );
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">${elements.join("")}</svg>`;
    const svgPath = `${previewDir}/page-${String(index + 1).padStart(2, "0")}.svg`;
    const pngPath = `${previewDir}/page-${String(index + 1).padStart(2, "0")}.png`;
    writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
  }
  console.log(`Preview pages: ${previewDir}`);
}
