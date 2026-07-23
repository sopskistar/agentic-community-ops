import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import { appVersion, getAppBaseUrl } from "../lib/app-config";

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("production polish", () => {
  it("centralizes the application version and uses it in layout", () => {
    const layout = read("app/layout.tsx");

    expect(appVersion).toBe("v1.0.0");
    expect(layout).toContain("appVersion");
    expect(layout).not.toContain("Version 0.1.0");
  });

  it("keeps metadata, robots and sitemap tied to the production base URL helper", () => {
    const layout = read("app/layout.tsx");
    const robots = read("app/robots.ts");
    const sitemap = read("app/sitemap.ts");

    expect(getAppBaseUrl()).toMatch(/^https:\/\//);
    expect(layout).toContain("metadataBase");
    expect(layout).toContain("twitter");
    expect(robots).toContain("sitemap.xml");
    expect(sitemap).toContain("/docs/architecture");
  });

  it("provides global not-found and loading states", () => {
    expect(read("app/not-found.tsx")).toContain("Page not found");
    expect(read("app/loading.tsx")).toContain("skeleton");
    expect(read("app/global-error.tsx")).toContain("diagnostic details");
  });

  it("keeps global dark mode mappings for common production UI states", () => {
    const css = read("app/globals.css");

    expect(css).toContain(".dark .bg-blue-50");
    expect(css).toContain(".dark table");
    expect(css).toContain(".dark code");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("documents implemented capabilities separately from future roadmap items", () => {
    const readme = read("README.md");
    const aspDocs = read("app/docs/asp/page.tsx");

    expect(readme).toContain("Implemented Features");
    expect(readme).toContain("Roadmap items are not implemented");
    expect(aspDocs).toContain("Current Limitations");
    expect(aspDocs).toContain("Roadmap");
  });
});
