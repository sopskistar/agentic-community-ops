import { describe, expect, it } from "vitest";

import { normalizedCommunicationMessageSchema } from "./normalized";

describe("normalized communication message validation", () => {
  it("validates normalized integration messages", () => {
    expect(
      normalizedCommunicationMessageSchema.safeParse({
        id: "telegram:1",
        source: "telegram",
        text: "Hello",
        timestamp: new Date().toISOString(),
      }).success,
    ).toBe(true);
  });

  it("rejects unsupported sources", () => {
    expect(
      normalizedCommunicationMessageSchema.safeParse({
        id: "bad:1",
        source: "myspace",
        text: "Hello",
        timestamp: new Date().toISOString(),
      }).success,
    ).toBe(false);
  });
});
