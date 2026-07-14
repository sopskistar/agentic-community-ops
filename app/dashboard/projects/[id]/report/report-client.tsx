"use client";

import { useMemo, useState } from "react";

import { createBatchSummary } from "../../../../../lib/analysis/batch";
import type {
  BatchAnalysedMessage,
  BatchAnalysisSummary,
} from "../../../../../lib/analysis/batch";
import type { Project } from "../../../../../lib/projects/types";

type StoredBatch = {
  summary: BatchAnalysisSummary;
  successfulResults: BatchAnalysedMessage[];
  failedResults: Array<{ index: number; content?: string; error: string }>;
};

export function ReportClient({ project }: { project: Project }) {
  const [storedBatch, setStoredBatch] = useState<StoredBatch | null>(() =>
    loadStoredBatch(project.id),
  );

  const recomputedSummary = useMemo(() => {
    if (!storedBatch) {
      return null;
    }

    return createBatchSummary(
      storedBatch.successfulResults,
      storedBatch.failedResults,
    );
  }, [storedBatch]);

  const report = useMemo(() => {
    if (!storedBatch || !recomputedSummary) {
      return null;
    }

    return createMeasuredReport(storedBatch, recomputedSummary);
  }, [recomputedSummary, storedBatch]);

  function recomputeReport() {
    setStoredBatch(loadStoredBatch(project.id));
  }

  function exportJson() {
    if (!storedBatch || !recomputedSummary) {
      return;
    }

    downloadText(
      `${project.id}-security-report.json`,
      JSON.stringify({ summary: recomputedSummary, report }, null, 2),
      "application/json",
    );
  }

  function exportMarkdown() {
    if (!report) {
      return;
    }

    downloadText(`${project.id}-security-report.md`, report.markdown, "text/markdown");
  }

  if (!storedBatch || !recomputedSummary || !report) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-2xl font-semibold">No batch results stored</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Run batch analysis for this project first. The report uses actual
          analysis results stored in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={recomputeReport}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
        >
          Recompute Report
        </button>
        <button
          type="button"
          onClick={exportMarkdown}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
        >
          Export as Markdown
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Export as JSON
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Total" value={recomputedSummary.totalMessages} />
        <Metric label="Safe" value={recomputedSummary.safeMessages} />
        <Metric label="Medium" value={recomputedSummary.mediumRisk} />
        <Metric label="High" value={recomputedSummary.highRisk} />
        <Metric label="Critical" value={recomputedSummary.criticalRisk} />
        <Metric label="Escalations" value={recomputedSummary.escalations} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ReportPanel title="Most-triggered rules" items={report.ruleLines} />
        <ReportPanel title="Common categories" items={report.categoryLines} />
        <ReportPanel title="Scam and phishing patterns" items={report.scamLines} />
        <ReportPanel
          title="Transaction complaints"
          items={report.transactionLines}
        />
        <ReportPanel
          title="Recommended actions"
          items={report.recommendedActionLines}
        />
        <ReportPanel
          title="Recent critical cases"
          items={report.criticalCaseLines}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">AI interpretation boundary</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Measured data above comes directly from stored analysis results. Any
          future AI-written narrative must use these measured values and must
          not invent counts, cases, links or outcomes.
        </p>
      </section>
    </div>
  );
}

function createMeasuredReport(batch: StoredBatch, summary: BatchAnalysisSummary) {
  const scamResults = batch.successfulResults.filter((item) =>
    ["SCAM", "SECURITY", "SPAM"].includes(item.result.category),
  );
  const transactionResults = batch.successfulResults.filter(
    (item) => item.result.category === "TRANSACTION_ISSUE",
  );
  const criticalResults = batch.successfulResults.filter(
    (item) => item.result.finalRisk === "CRITICAL",
  );
  const recommendedActions = [
    ...new Set(
      batch.successfulResults
        .filter((item) => item.result.shouldEscalate)
        .map((item) => item.result.recommendedAction),
    ),
  ];

  const ruleLines = summary.mostTriggeredRules.map(
    (rule) => `${rule.ruleId} ${rule.name}: ${rule.count}`,
  );
  const categoryLines = summary.topCategories.map(
    (category) => `${category.category}: ${category.count}`,
  );
  const scamLines = scamResults.map(
    (item) => `#${item.index + 1} ${item.result.finalRisk}: ${item.content}`,
  );
  const transactionLines = transactionResults.map(
    (item) => `#${item.index + 1}: ${item.content}`,
  );
  const recommendedActionLines =
    recommendedActions.length > 0
      ? recommendedActions
      : ["No escalation-specific recommended actions measured."];
  const criticalCaseLines = criticalResults.map(
    (item) => `#${item.index + 1}: ${item.content}`,
  );

  return {
    ruleLines: fallbackLines(ruleLines),
    categoryLines: fallbackLines(categoryLines),
    scamLines: fallbackLines(scamLines),
    transactionLines: fallbackLines(transactionLines),
    recommendedActionLines,
    criticalCaseLines: fallbackLines(criticalCaseLines),
    markdown: [
      `# ${batch.successfulResults.length} Message Security Report`,
      "",
      "## Measured Summary",
      `- Total messages analysed: ${summary.totalMessages}`,
      `- Safe messages: ${summary.safeMessages}`,
      `- Medium risk: ${summary.mediumRisk}`,
      `- High risk: ${summary.highRisk}`,
      `- Critical risk: ${summary.criticalRisk}`,
      `- Escalations: ${summary.escalations}`,
      "",
      "## Most-triggered Rules",
      ...fallbackLines(ruleLines).map((line) => `- ${line}`),
      "",
      "## Common Categories",
      ...fallbackLines(categoryLines).map((line) => `- ${line}`),
      "",
      "## Scam and Phishing Patterns",
      ...fallbackLines(scamLines).map((line) => `- ${line}`),
      "",
      "## Transaction Complaints",
      ...fallbackLines(transactionLines).map((line) => `- ${line}`),
      "",
      "## Recommended Actions",
      ...recommendedActionLines.map((line) => `- ${line}`),
      "",
      "## Recent Critical Cases",
      ...fallbackLines(criticalCaseLines).map((line) => `- ${line}`),
    ].join("\n"),
  };
}

function ReportPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function loadStoredBatch(projectId: string): StoredBatch | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = localStorage.getItem(`aco:batch:${projectId}`);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredBatch;
  } catch {
    return null;
  }
}

function fallbackLines(lines: string[]) {
  return lines.length > 0 ? lines : ["No measured cases in this batch."];
}

function downloadText(filename: string, text: string, mimeType: string) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
