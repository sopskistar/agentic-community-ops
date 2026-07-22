import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/business/ingest", () => {
  it("requires a file upload", async () => {
    const response = await POST(
      new Request("https://agenticopsai.xyz/api/business/ingest", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("BUSINESS_UPLOAD_MISSING_FILE");
  });

  it("extracts TXT content without returning raw files", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      new File(["Customer needs a quote and support follow-up."], "note.txt", {
        type: "text/plain",
      }),
    );

    const response = await POST(
      new Request("https://agenticopsai.xyz/api/business/ingest", {
        method: "POST",
        body: formData,
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.extraction.kind).toBe("text");
    expect(payload.extraction.analysisContent).toContain("Customer needs");
    expect(JSON.stringify(payload)).not.toContain("base64");
  });

  it("rejects unsupported extensions", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      new File(["not allowed"], "malware.html", { type: "text/html" }),
    );

    const response = await POST(
      new Request("https://agenticopsai.xyz/api/business/ingest", {
        method: "POST",
        body: formData,
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.message).toContain("Unsupported file type");
  });

  it("enforces content-length before parsing", async () => {
    const response = await POST(
      new Request("https://agenticopsai.xyz/api/business/ingest", {
        method: "POST",
        headers: {
          "content-length": String(20 * 1024 * 1024),
        },
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(413);
  });
});
