import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const demoSource = readFileSync(join(process.cwd(), "app/demo/page.tsx"), "utf8");

describe("guided demo positioning", () => {
  it("contains the required guided demo sections and anchors", () => {
    expect(demoSource).toContain("AgenticOps AI Guided Platform Demo");
    expect(demoSource).toContain("id=\"overview\"");
    expect(demoSource).toContain("id=\"pipeline\"");
    expect(demoSource).toContain("id=\"web3-case-study\"");
    expect(demoSource).toContain("id=\"business-case-study\"");
    expect(demoSource).toContain("id=\"integrations\"");
    expect(demoSource).toContain("id=\"roadmap\"");
  });

  it("preserves the NovaBridge Web3 case study", () => {
    expect(demoSource).toContain("NovaBridge");
    expect(demoSource).toContain("Single-message verdicts");
    expect(demoSource).toContain("Batch audit: ten messages");
    expect(demoSource).toContain("Measured security report");
    expect(demoSource).toContain("Why the results are auditable");
  });

  it("adds a real business case study without presenting roadmap actions as live", () => {
    expect(demoSource).toContain("Business Communication Demonstration");
    expect(demoSource).toContain("Business audit sample");
    expect(demoSource).toContain("Budget review sample");
    expect(demoSource).toContain("Future platform areas remain disabled");
  });
});
