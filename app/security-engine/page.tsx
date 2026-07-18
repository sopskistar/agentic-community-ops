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
                Deterministic rules for the current MVP.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                Deterministic rules are one module of the broader communication
                intelligence engine. They set the minimum risk level before AI
                analysis runs. Today&apos;s rule catalog focuses on Web3 Community
                Security; future rule suites can use the same foundation for
                other communication contexts.
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
