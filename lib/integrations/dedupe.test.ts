import { describe, expect, it } from "vitest";

import {
  hasSeenIntegrationEvent,
  resetIntegrationDedupeForTests,
} from "./dedupe";

describe("integration dedupe", () => {
  it("deduplicates event IDs", () => {
    resetIntegrationDedupeForTests();

    expect(hasSeenIntegrationEvent("event-1")).toBe(false);
    expect(hasSeenIntegrationEvent("event-1")).toBe(true);
  });
});
