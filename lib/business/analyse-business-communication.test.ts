import { describe, expect, it } from "vitest";

import { analyseBusinessCommunication } from "./analyse-business-communication";
import { businessProfiles } from "./profiles";

const defaultProfile = businessProfiles[0];

describe("analyseBusinessCommunication", () => {
  it("detects sales intent and recommended next steps", () => {
    const result = analyseBusinessCommunication({
      content:
        "Hi Acme, we are interested in pricing for your platform. Can you send a quote and schedule a demo next week?",
      purpose: "Sales Conversation",
      profile: defaultProfile,
    });

    expect(result.intent).toBe("Purchase or sales intent");
    expect(result.priority).toBe("Medium");
    expect(result.keyTopics).toContain("Pricing");
    expect(result.requestedActions.join(" ")).toContain("schedule a demo");
    expect(result.recommendedNextStep).toContain("qualification");
    expect(result.analysisMode).toBe("Local demonstration logic");
  });

  it("flags sensitive business messages as higher risk", () => {
    const result = analyseBusinessCommunication({
      content:
        "This is urgent. The contract has a legal issue and the customer mentioned a possible lawsuit today.",
      purpose: "Business Email",
      profile: defaultProfile,
    });

    expect(result.priority).toBe("Critical");
    expect(result.riskLevel).toBe("High");
    expect(result.recommendedNextStep).toContain("Escalate");
    expect(result.explanation.some((line) => line.includes("Risk"))).toBe(true);
  });

  it("returns safe defaults when no explicit action exists", () => {
    const result = analyseBusinessCommunication({
      content: "Thanks for the update. The team appreciates the quick progress.",
      purpose: "General Communication",
      profile: defaultProfile,
    });

    expect(result.sentiment).toBe("Positive");
    expect(result.riskLevel).toBe("Safe");
    expect(result.requestedActions).toEqual([
      "No explicit requested action detected.",
    ]);
    expect(result.confidence).toBeGreaterThanOrEqual(0.58);
  });
});
