import Link from "next/link";

import { publicSecurityRules } from "../../lib/security/rules";
import type { RiskSeverity } from "../../lib/security/types";

const severityStyles: Record<RiskSeverity, string> = {
  LOW: "bg-emerald-50 text-emerald-800 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
  HIGH: "bg-orange-50 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-50 text-red-800 border-red-200",
};

const severityCounts = publicSecurityRules.reduce<Record<RiskSeverity, number>>(
  (counts, rule) => ({
    ...counts,
    [rule.severity]: counts[rule.severity] + 1,
  }),
  { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
);

const implementedMessageSources = [
  "Manual input",
  "Gmail readonly sync",
  "Facebook Messenger",
  "Instagram",
  "Telegram",
  "Discord Gateway",
  "TXT",
  "PDF",
  "DOCX",
  "CSV",
  "XLSX",
];

const pipelineSteps = [
  "Source",
  "Normalize",
  "Identify Context",
  "Deterministic Checks",
  "AI-Assisted Analysis",
  "Suggested Action",
  "Human Review",
];

export default function SecurityEnginePage() {
  return (
    <main className="app-bg text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <p className="kicker">
                Analysis Engine
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold text-slate-950 sm:text-5xl">
                Deterministic checks inside the communication intelligence engine.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                The published SEC-001 through SEC-015 catalogue originated in
                the Web3 Community Security MVP and remains active today. The
                broader platform now receives normalized inputs from Gmail,
                Facebook Messenger, Instagram, Telegram, Discord, manual text
                and supported business documents. Source channel does not
                automatically determine risk: messages are normalized first,
                then context-aware deterministic and AI-assisted analysis runs.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Business Communication Intelligence uses structured,
                explainable analysis after normalization. It should not be read
                as applying every Web3-specific rule to every business context.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="badge border-emerald-200 bg-emerald-50 text-emerald-800">
                  Implemented Today
                </span>
                <span className="badge border-slate-200 bg-slate-50 text-slate-700">
                  AI cannot lower risk
                </span>
                <span className="badge border-slate-200 bg-slate-50 text-slate-700">
                  Explainable decisions
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as RiskSeverity[]).map(
                (severity) => (
                  <div
                    key={severity}
                    className={`metric-card border p-4 ${severityStyles[severity]}`}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.14em]">
                      {severity}
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                      {severityCounts[severity]}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="section-card p-5 md:p-6">
          <p className="kicker">Implemented message sources</p>
          <h2 className="mt-3 text-2xl font-semibold">Inputs normalized before analysis.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            These sources can feed implemented AgenticOps AI workflows today.
            Provider status is still evidence-based; configured credentials
            alone do not mean a provider is actively receiving events.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {implementedMessageSources.map((source) => (
              <span
                key={source}
                className="badge border-emerald-200 bg-emerald-50 text-emerald-800"
              >
                {source}
              </span>
            ))}
          </div>
        </div>

        <div className="section-card p-5 md:p-6">
          <p className="kicker">Platform flow</p>
          <h2 className="mt-3 text-2xl font-semibold">Source, context and rules stay separate.</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pipelineSteps.map((step, index) => (
              <li
                key={step}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
                  Step {index + 1}
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-800">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Published rule catalog</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              AI may add classification and suggested replies, but final risk is
              never allowed to fall below these deterministic results.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="btn btn-primary"
          >
            Open Dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {publicSecurityRules.map((rule) => (
            <article
              key={rule.ruleId}
              className="interactive-card group flex min-h-full flex-col p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-emerald-700">
                    {rule.ruleId}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    {rule.name}
                  </h3>
                </div>
                <span
                  className={`badge shrink-0 ${severityStyles[rule.severity]}`}
                >
                  {rule.severity}
                </span>
              </div>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">
                {rule.description}
              </p>
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Recommended action
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {rule.recommendedAction}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
