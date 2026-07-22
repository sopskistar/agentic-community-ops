import { describe, expect, it } from "vitest";

import { analyzeBudgetRows, parseBudgetRowsFromText } from "./budget";

describe("analyzeBudgetRows", () => {
  it("calculates totals, variance and rankings deterministically", () => {
    const result = analyzeBudgetRows([
      { Department: "Marketing", Category: "Ads", Budgeted: "1000", Actual: "1200", Currency: "USD" },
      { Department: "Operations", Category: "Software", Budgeted: "800", Actual: "700", Currency: "USD" },
    ]);

    expect(result.totalBudgeted).toBe(1800);
    expect(result.totalActual).toBe(1900);
    expect(result.totalVariance).toBe(100);
    expect(result.totalVariancePercentage).toBe(5.56);
    expect(result.negativeVariances[0].category).toBe("Ads");
    expect(result.positiveVariances[0].category).toBe("Software");
    expect(result.currency).toBe("USD");
  });

  it("does not calculate variance when required columns are missing", () => {
    const result = analyzeBudgetRows([
      { Department: "Finance", Category: "Travel", Actual: "300" },
    ]);

    expect(result.totalBudgeted).toBeNull();
    expect(result.totalVariance).toBeNull();
    expect(result.dataQualityWarnings.join(" ")).toContain(
      "variance cannot be calculated",
    );
  });

  it("flags duplicate and incomplete rows", () => {
    const result = analyzeBudgetRows([
      { Department: "Marketing", Category: "Ads", Budgeted: "1000", Actual: "1200" },
      { Department: "Marketing", Category: "Ads", Budgeted: "1000", Actual: "" },
    ]);

    expect(result.dataQualityWarnings.join(" ")).toContain("Duplicate");
    expect(result.dataQualityWarnings.join(" ")).toContain("missing");
  });

  it("parses bounded pasted CSV budget rows", () => {
    const rows = parseBudgetRowsFromText(
      "Department,Category,Budgeted,Actual,Currency\nMarketing,\"Ads, paid\",1000,1200,USD",
    );

    expect(rows).toEqual([
      {
        Department: "Marketing",
        Category: "Ads, paid",
        Budgeted: "1000",
        Actual: "1200",
        Currency: "USD",
      },
    ]);
  });
});
