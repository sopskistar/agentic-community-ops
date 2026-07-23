import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("post Release 4 production corrections", () => {
  it("uses semantic capability panel and warning tokens for theme-safe contrast", () => {
    const home = read("app/page.tsx");
    const businessPage = read("app/business/page.tsx");
    const businessClient = read("app/business/business-client.tsx");
    const css = read("app/globals.css");

    expect(home).toContain("capability-panel");
    expect(home).toContain("status-marker");
    expect(css).toContain("--warning-bg");
    expect(css).toContain("--success-bg");
    expect(css).toContain("--roadmap-bg");
    expect(css).toContain(".dark .capability-panel");
    expect(businessPage).toContain("warning-card");
    expect(businessClient).toContain("warning-card");
  });

  it("positions the engine as source-neutral before preserving the Web3 rule catalog", () => {
    const engine = read("app/security-engine/page.tsx");

    expect(engine).toContain("Source channel does not");
    expect(engine).toContain("messages are normalized first");
    expect(engine).toContain("Business Communication Intelligence uses structured");
    for (const source of [
      "Manual input",
      "Gmail readonly sync",
      "Facebook Messenger",
      "Instagram",
      "Telegram",
      "Discord Gateway",
      "TXT",
      "PDF",
      "DOCX",
      "CSV",
      "XLSX",
    ]) {
      expect(engine).toContain(source);
    }
    for (const step of [
      "Source",
      "Normalize",
      "Identify Context",
      "Deterministic Checks",
      "AI-Assisted Analysis",
      "Suggested Action",
      "Human Review",
    ]) {
      expect(engine).toContain(step);
    }
    expect(engine).toContain("publicSecurityRules.map");
  });

  it("makes dashboard project workflow actions and breadcrumbs visible", () => {
    const dashboard = read("app/dashboard/page.tsx");
    const projectNavigation = read("app/dashboard/projects/project-navigation.tsx");
    const projectPage = read("app/dashboard/projects/[id]/page.tsx");

    expect(dashboard).toContain("Create a communication profile");
    expect(dashboard).toContain("Open Project");
    expect(dashboard).toContain("Review Message");
    expect(dashboard).toContain("Batch Review");
    expect(dashboard).toContain("View Report");
    expect(projectNavigation).toContain("Platform Dashboard");
    expect(projectNavigation).toContain("Project workflow");
    expect(projectNavigation).toContain("Settings");
    expect(projectPage).toContain("Project Configuration");
  });

  it("prevents the batch review stuck state and sends users to the report", () => {
    const batchClient = read("app/dashboard/projects/[id]/batch/batch-client.tsx");

    expect(batchClient).toContain("batchRequestTimeoutMs");
    expect(batchClient).toContain("AbortController");
    expect(batchClient).toContain("isLoading");
    expect(batchClient).toContain("Batch analysis timed out");
    expect(batchClient).toContain("isBatchApiResponse");
    expect(batchClient).toContain("router.push(`/dashboard/projects/${project.id}/report`)");
    expect(batchClient).toContain("Retry");
    expect(batchClient).toContain("View Report");
  });

  it("explains report empty state and direct navigation without requiring edit mode", () => {
    const reportPage = read("app/dashboard/projects/[id]/report/page.tsx");
    const reportClient = read("app/dashboard/projects/[id]/report/report-client.tsx");
    const batchPage = read("app/dashboard/projects/[id]/batch/page.tsx");

    expect(reportClient).toContain("No completed batch analysis is available");
    expect(reportClient).toContain("Reports are calculated from stored analysis results");
    expect(reportClient).toContain("Last updated");
    expect(reportClient).toContain("Browser-local batch analysis results");
    expect(reportPage).toContain("Project Overview");
    expect(reportPage).toContain("Platform Dashboard");
    expect(batchPage).toContain("Project Overview");
    expect(batchPage).toContain("Platform Dashboard");
    expect(reportPage).not.toContain("Edit Project");
    expect(batchPage).not.toContain("Edit Project");
  });

  it("keeps unsupported autonomous actions out of corrected surfaces", () => {
    const home = read("app/page.tsx");
    const batchClient = read("app/dashboard/projects/[id]/batch/batch-client.tsx");
    const reportClient = read("app/dashboard/projects/[id]/report/report-client.tsx");

    expect(home).toContain("Autonomous execution remains planned");
    expect(batchClient).not.toContain("send email");
    expect(batchClient).not.toContain("ban user");
    expect(reportClient).toContain("not invent counts");
  });
});
