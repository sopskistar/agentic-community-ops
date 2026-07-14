"use client";

import { useState } from "react";

import type { HybridMessageAnalysisResult } from "../../../../../lib/analysis/types";
import type { Project } from "../../../../../lib/projects/types";

const messageSources = [
  "MANUAL",
  "X",
  "DISCORD",
  "TELEGRAM",
  "EMAIL",
  "OTHER",
] as const;

const exampleMessages = [
  {
    label: "Seed phrase scam",
    content: "Support needs you to send your seed phrase to verify the wallet.",
  },
  {
    label: "Fake admin",
    content: "I am the official admin. DM me and connect your wallet now.",
  },
  {
    label: "Failed tx",
    content: "My deposit transaction failed and I need help finding the status.",
  },
  {
    label: "Safe docs question",
    content: "Where can I find official documentation for support policies?",
  },
];

type ApiAnalysisResult = HybridMessageAnalysisResult & {
  explanations: Array<{
    ruleId: string;
    explanation: string;
    evidence: string[];
    recommendedAction: string;
  }>;
};

export function AnalyseClient({ project }: { project: Project }) {
  const [messageContent, setMessageContent] = useState("");
  const [messageSource, setMessageSource] =
    useState<(typeof messageSources)[number]>("MANUAL");
  const [analysis, setAnalysis] = useState<ApiAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  async function analyseMessage() {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setCopyState("idle");

    try {
      const response = await fetch("/api/v1/analyse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          message: {
            content: messageContent,
            source: messageSource,
          },
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "Analysis failed.");
        return;
      }

      setAnalysis(body);
    } catch {
      setError("Analysis request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyReply() {
    if (!analysis?.generatedReply) {
      return;
    }

    await navigator.clipboard.writeText(analysis.generatedReply);
    setCopyState("copied");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Message
            </span>
            <textarea
              value={messageContent}
              onChange={(event) => setMessageContent(event.target.value)}
              maxLength={2000}
              rows={7}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition-colors focus:border-emerald-600"
              placeholder="Paste a community message for analysis."
            />
            <span className="block text-xs text-slate-500">
              {messageContent.length}/2000 characters
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Source
              </span>
              <select
                value={messageSource}
                onChange={(event) =>
                  setMessageSource(
                    event.target.value as (typeof messageSources)[number],
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition-colors focus:border-emerald-600"
              >
                {messageSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Example messages
              </span>
              <div className="flex flex-wrap gap-2">
                {exampleMessages.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setMessageContent(example.content)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={analyseMessage}
            disabled={isLoading || messageContent.trim().length === 0}
            className="inline-flex h-11 w-fit items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? "Analysing..." : "Analyse"}
          </button>

          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            AI-generated replies are suggestions and should be reviewed before
            public use.
          </p>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : null}

      {analysis ? (
        <section className="space-y-6">
          {analysis.shouldEscalate ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              Escalation warning:{" "}
              {analysis.escalationReason ?? "Human review is required."}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <ResultCard
              title="Deterministic risk"
              value={analysis.deterministicRisk}
              detail={`Score: ${analysis.riskScore}`}
            />
            <ResultCard
              title="AI analysis"
              value={analysis.aiSuggestedRisk}
              detail={`${analysis.category} | confidence ${Math.round(
                analysis.confidence * 100,
              )}%`}
            />
            <ResultCard
              title="Final verdict"
              value={analysis.finalRisk}
              detail={
                analysis.shouldEscalate
                  ? "Escalate for review"
                  : "Eligible for safe reply review"
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Triggered rules</h2>
              {analysis.triggeredRules.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  No deterministic security rules were triggered.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {analysis.triggeredRules.map((rule) => (
                    <div
                      key={rule.ruleId}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold">
                          {rule.ruleId}: {rule.name}
                        </h3>
                        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {rule.severity}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {rule.description}
                      </p>
                      <p className="mt-3 text-sm font-medium text-slate-800">
                        Evidence: {rule.matchedEvidence.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Generated safe reply</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {analysis.generatedReply}
                </p>
                <button
                  type="button"
                  onClick={copyReply}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                >
                  {copyState === "copied" ? "Copied" : "Copy Reply"}
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Recommended action</h2>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {analysis.recommendedAction}
                </p>
                <p className="mt-4 text-sm font-semibold text-slate-800">
                  Knowledge grounding:{" "}
                  {analysis.answerGroundedInKnowledgeBase
                    ? "Grounded in project knowledge base"
                    : "Not grounded; review required"}
                </p>
              </div>
            </div>
          </div>

          <details className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <summary className="cursor-pointer text-lg font-semibold">
              Show Proof
            </summary>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
              <p>
                Deterministic risk is computed before AI analysis. Final risk is
                the higher of deterministic risk and AI-suggested risk.
              </p>
              <p>
                Detected intent: {analysis.detectedIntent}. Summary:{" "}
                {analysis.shortSummary}
              </p>
              <div>
                <p className="font-semibold text-slate-900">Evidence used</p>
                {analysis.evidenceUsed.length === 0 ? (
                  <p>No AI evidence was supplied.</p>
                ) : (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {analysis.evidenceUsed.map((evidence) => (
                      <li key={evidence}>{evidence}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Rule explanations
                </p>
                {analysis.explanations.length === 0 ? (
                  <p>No deterministic rule explanations.</p>
                ) : (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {analysis.explanations.map((explanation) => (
                      <li key={explanation.ruleId}>
                        {explanation.ruleId}: {explanation.explanation}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </details>
        </section>
      ) : null}
    </div>
  );
}

function ResultCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </div>
  );
}
