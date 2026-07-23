import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";

describe("Integrations workspace UI source", () => {
  it("defines the requested workspace sections and removes raw oauth status copy", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/integrations/integrations-workspace.tsx"),
      "utf8",
    );

    expect(source).toContain("Overview");
    expect(source).toContain("Communication Inbox");
    expect(source).toContain("Approval Center");
    expect(source).toContain("Health & Diagnostics");
    expect(source).toContain("Gmail connected successfully.");
    expect(source).not.toContain("Integration status: google_connected");
  });

  it("keeps future advertising and CRM capabilities marked as roadmap-only", () => {
    const source = readFileSync(
      path.join(process.cwd(), "lib/integrations/workspace.ts"),
      "utf8",
    );

    expect(source).toContain("Meta Ads");
    expect(source).toContain("HubSpot");
    expect(source).toContain("Future");
    expect(source).toContain("Planned");
  });
});
