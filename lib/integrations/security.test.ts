import { describe, expect, it } from "vitest";

import {
  redactExternalId,
  redactSecret,
  verifyTelegramSecret,
} from "./security";

describe("integration security helpers", () => {
  it("redacts token-like values", () => {
    expect(redactSecret("access_token=abc123")).toContain("<redacted>");
    expect(redactSecret('{"token":"secret-value"}')).toContain("<redacted>");
  });

  it("redacts external IDs", () => {
    expect(redactExternalId("1234567890")).toBe("123...890");
  });

  it("validates Telegram webhook secret", () => {
    expect(
      verifyTelegramSecret({
        configuredSecret: "secret",
        receivedSecret: "secret",
      }).valid,
    ).toBe(true);
    expect(
      verifyTelegramSecret({
        configuredSecret: "secret",
        receivedSecret: "wrong",
      }).valid,
    ).toBe(false);
  });
});
