import { describe, expect, it } from "vitest";

import {
  getBusinessUploadMaxBytes,
  validateBusinessUpload,
} from "./validate-upload";

describe("validateBusinessUpload", () => {
  it("allows supported extensions and MIME types", () => {
    expect(
      validateBusinessUpload({
        filename: "message.pdf",
        mimeType: "application/pdf",
        sizeBytes: 100,
      }).kind,
    ).toBe("pdf");
  });

  it("rejects unsupported extensions and legacy XLS", () => {
    expect(() =>
      validateBusinessUpload({
        filename: "script.html",
        mimeType: "text/html",
        sizeBytes: 100,
      }),
    ).toThrow("Unsupported file type");

    expect(() =>
      validateBusinessUpload({
        filename: "legacy.xls",
        mimeType: "application/vnd.ms-excel",
        sizeBytes: 100,
      }),
    ).toThrow("Legacy XLS files are not supported");
  });

  it("rejects MIME mismatches, empty files and large files", () => {
    expect(() =>
      validateBusinessUpload({
        filename: "document.pdf",
        mimeType: "text/plain",
        sizeBytes: 100,
      }),
    ).toThrow("extension and MIME type");

    expect(() =>
      validateBusinessUpload({
        filename: "empty.txt",
        mimeType: "text/plain",
        sizeBytes: 0,
      }),
    ).toThrow("empty");

    expect(() =>
      validateBusinessUpload({
        filename: "large.csv",
        mimeType: "text/csv",
        sizeBytes: 101,
        env: { BUSINESS_UPLOAD_MAX_BYTES: "100" } as unknown as NodeJS.ProcessEnv,
      }),
    ).toThrow("too large");
  });

  it("uses a safe default and caps configured upload size", () => {
    expect(getBusinessUploadMaxBytes({} as NodeJS.ProcessEnv)).toBe(
      4 * 1024 * 1024,
    );
    expect(
      getBusinessUploadMaxBytes({
        BUSINESS_UPLOAD_MAX_BYTES: String(50 * 1024 * 1024),
      } as unknown as NodeJS.ProcessEnv),
    ).toBe(10 * 1024 * 1024);
  });
});
