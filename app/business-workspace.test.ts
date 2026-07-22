import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const businessClient = readFileSync(
  join(process.cwd(), "app/business/business-client.tsx"),
  "utf8",
);
const businessPage = readFileSync(join(process.cwd(), "app/business/page.tsx"), "utf8");
const businessAudit = readFileSync(join(process.cwd(), "lib/business/audit.ts"), "utf8");

describe("business workspace positioning", () => {
  it("uses the required workspace title and tabs", () => {
    expect(businessPage).toContain("Business Intelligence Workspace");
    for (const label of [
      "Analyze",
      "Audit",
      "Budget",
      "Reports",
      "Knowledge Hub",
      "Analysis History",
    ]) {
      expect(businessClient).toContain(label);
    }
    expect(businessClient).toContain("role=\"tablist\"");
  });

  it("keeps financial and audit safety disclaimers visible", () => {
    expect(businessAudit).toContain(
      "preliminary business and data-review assistance",
    );
    expect(businessClient).toContain("not certified audit assurance");
    expect(businessClient).toContain("does not certify financial");
  });

  it("does not present fake PDF downloads", () => {
    expect(businessClient).toContain("Print / Save as PDF");
    expect(businessClient).toContain("JSON Export");
    expect(businessClient).toContain("CSV Findings");
    expect(businessClient).not.toContain("PDF download");
  });
});
