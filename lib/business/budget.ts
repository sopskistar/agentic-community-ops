export type BudgetRow = Record<string, string | number | null | undefined>;

export type BudgetVariance = {
  category: string;
  department: string;
  budgetedAmount: number | null;
  actualAmount: number | null;
  variance: number | null;
  variancePercentage: number | null;
  currency: string | null;
  notes: string[];
};

export type BudgetIntelligenceResult = {
  reportingPeriod: string;
  currency: string | null;
  totalBudgeted: number | null;
  totalActual: number | null;
  totalVariance: number | null;
  totalVariancePercentage: number | null;
  variances: BudgetVariance[];
  positiveVariances: BudgetVariance[];
  negativeVariances: BudgetVariance[];
  largestExpenseCategories: BudgetVariance[];
  largestDeviations: BudgetVariance[];
  dataQualityWarnings: string[];
  questionsForFinanceStaff: string[];
};

export function analyzeBudgetRows(rows: BudgetRow[]): BudgetIntelligenceResult {
  const dataQualityWarnings: string[] = [];
  if (rows.length === 0) {
    return emptyBudgetResult(["Insufficient information: no budget rows were supplied."]);
  }

  const columns = new Set(rows.flatMap((row) => Object.keys(row).map(normalizeKey)));
  const hasBudget = [...columns].some((column) => /budget|planned|forecast/.test(column));
  const hasActual = [...columns].some((column) => /actual|spent|expense|revenue/.test(column));
  if (!hasBudget || !hasActual) {
    dataQualityWarnings.push(
      "Insufficient financial columns: variance cannot be calculated without budget/planned and actual/spent columns.",
    );
  }

  const variances = rows.slice(0, 200).map((row, index) => {
    const budgetedAmount = readAmount(row, ["budget", "budgeted", "planned", "forecast"]);
    const actualAmount = readAmount(row, ["actual", "spent", "expense", "revenue"]);
    const variance =
      budgetedAmount === null || actualAmount === null
        ? null
        : actualAmount - budgetedAmount;
    const variancePercentage =
      variance === null || budgetedAmount === null || budgetedAmount === 0
        ? null
        : Number(((variance / budgetedAmount) * 100).toFixed(2));
    const category = readText(row, ["category", "account", "line item"]) ??
      `Row ${index + 1}`;
    const department = readText(row, ["department", "team", "cost center"]) ??
      "General";
    const notes = [];
    if (budgetedAmount === null) {
      notes.push("Missing budgeted amount.");
    }
    if (actualAmount === null) {
      notes.push("Missing actual amount.");
    }
    if (!readText(row, ["category", "account", "line item"])) {
      notes.push("Missing category.");
    }

    return {
      category,
      department,
      budgetedAmount,
      actualAmount,
      variance,
      variancePercentage,
      currency: readCurrency(row),
      notes,
    } satisfies BudgetVariance;
  });

  const duplicateKeys = new Set<string>();
  const seenKeys = new Set<string>();
  for (const variance of variances) {
    const key = `${variance.department}:${variance.category}`.toLowerCase();
    if (seenKeys.has(key)) {
      duplicateKeys.add(key);
    }
    seenKeys.add(key);
  }
  if (duplicateKeys.size > 0) {
    dataQualityWarnings.push("Duplicate or repeated department/category rows were detected.");
  }

  if (variances.some((variance) => variance.notes.length > 0)) {
    dataQualityWarnings.push("Some rows contain missing or incomplete values.");
  }

  const totalBudgeted = sumNullable(variances.map((variance) => variance.budgetedAmount));
  const totalActual = sumNullable(variances.map((variance) => variance.actualAmount));
  const totalVariance =
    totalBudgeted === null || totalActual === null ? null : totalActual - totalBudgeted;
  const totalVariancePercentage =
    totalVariance === null || totalBudgeted === null || totalBudgeted === 0
      ? null
      : Number(((totalVariance / totalBudgeted) * 100).toFixed(2));

  const withVariance = variances.filter(
    (variance): variance is BudgetVariance & { variance: number } =>
      variance.variance !== null,
  );

  return {
    reportingPeriod:
      readText(rows[0], ["period", "reporting period", "year"]) ??
      "Insufficient information: reporting period not supplied.",
    currency: variances.find((variance) => variance.currency)?.currency ?? null,
    totalBudgeted,
    totalActual,
    totalVariance,
    totalVariancePercentage,
    variances,
    positiveVariances: withVariance
      .filter((variance) => variance.variance < 0)
      .sort((a, b) => a.variance - b.variance)
      .slice(0, 5),
    negativeVariances: withVariance
      .filter((variance) => variance.variance > 0)
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 5),
    largestExpenseCategories: [...variances]
      .filter((variance) => variance.actualAmount !== null)
      .sort((a, b) => Math.abs(b.actualAmount ?? 0) - Math.abs(a.actualAmount ?? 0))
      .slice(0, 5),
    largestDeviations: withVariance
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
      .slice(0, 5),
    dataQualityWarnings,
    questionsForFinanceStaff: [
      totalVariance === null
        ? "Which columns contain budgeted and actual values?"
        : "Are the budgeted and actual amounts complete for the selected period?",
      "Which department owns each high-variance category?",
      "Are missing categories, duplicate rows or unusual entries expected?",
    ],
  };
}

export function parseBudgetRowsFromText(content: string): BudgetRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 250);

  const tableLines = lines.filter((line) => /[,|\t]/.test(line));
  if (tableLines.length < 2) {
    return [];
  }

  const delimiter = chooseDelimiter(tableLines[0]);
  const headers = splitDelimitedLine(tableLines[0], delimiter)
    .map((header) => header.trim())
    .filter(Boolean)
    .slice(0, 30);

  if (headers.length === 0) {
    return [];
  }

  return tableLines.slice(1).map((line) => {
    const cells = splitDelimitedLine(line, delimiter).slice(0, headers.length);
    return headers.reduce<BudgetRow>((row, header, index) => {
      row[header] = cells[index]?.trim() ?? "";
      return row;
    }, {});
  });
}

function emptyBudgetResult(warnings: string[]): BudgetIntelligenceResult {
  return {
    reportingPeriod: "Insufficient information",
    currency: null,
    totalBudgeted: null,
    totalActual: null,
    totalVariance: null,
    totalVariancePercentage: null,
    variances: [],
    positiveVariances: [],
    negativeVariances: [],
    largestExpenseCategories: [],
    largestDeviations: [],
    dataQualityWarnings: warnings,
    questionsForFinanceStaff: ["Provide budget/planned and actual/spent values."],
  };
}

function readAmount(row: BudgetRow, names: string[]) {
  const value = readValue(row, names);
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function readText(row: BudgetRow, names: string[]) {
  const value = readValue(row, names);
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value).trim();
}

function readCurrency(row: BudgetRow) {
  const explicit = readText(row, ["currency"]);
  if (explicit) {
    return explicit;
  }
  const values = Object.values(row).map((value) => String(value ?? ""));
  if (values.some((value) => value.includes("$"))) {
    return "USD";
  }
  if (values.some((value) => value.includes("£"))) {
    return "GBP";
  }
  if (values.some((value) => value.includes("€"))) {
    return "EUR";
  }
  return null;
}

function readValue(row: BudgetRow, names: string[]) {
  const entries = Object.entries(row);
  for (const name of names) {
    const match = entries.find(([key]) => normalizeKey(key).includes(name));
    if (match) {
      return match[1];
    }
  }
  return undefined;
}

function sumNullable(values: Array<number | null>) {
  if (values.some((value) => value === null)) {
    return null;
  }

  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function chooseDelimiter(headerLine: string) {
  const candidates = [",", "\t", "|"] as const;
  return candidates
    .map((delimiter) => ({
      delimiter,
      count: headerLine.split(delimiter).length,
    }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function splitDelimitedLine(line: string, delimiter: "," | "\t" | "|") {
  if (delimiter !== ",") {
    return line.split(delimiter);
  }

  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];
    if (character === "\"" && nextCharacter === "\"") {
      current += "\"";
      index += 1;
      continue;
    }
    if (character === "\"") {
      inQuotes = !inQuotes;
      continue;
    }
    if (character === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += character;
  }

  cells.push(current);
  return cells;
}
