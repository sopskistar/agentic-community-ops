import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const pageSource = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");

describe("homepage positioning", () => {
  it("shows implemented file intelligence and live integrations as available today", () => {
    expect(pageSource).toContain("PDF, DOCX, CSV and XLSX business-file analysis");
    expect(pageSource).toContain("Gmail readonly analysis");
    expect(pageSource).toContain("Telegram ingestion");
    expect(pageSource).toContain("Facebook Messenger ingestion");
    expect(pageSource).toContain("Discord Gateway ingestion");
    expect(pageSource).toContain("Implemented File Inputs");
  });

  it("labels Instagram as foundation ready instead of fully live", () => {
    expect(pageSource).toContain("channel: \"Instagram\"");
    expect(pageSource).toContain("status: \"Foundation Ready\"");
    expect(pageSource).toContain("Broader production event coverage remains limited.");
  });

  it("keeps roadmap actions clearly planned", () => {
    expect(pageSource).toContain("AI Email Workspace actions");
    expect(pageSource).toContain("Planned: Email Sending");
    expect(pageSource).toContain("Planned: Moderation Actions");
    expect(pageSource).toContain("Planned: CRM Actions");
  });
});
