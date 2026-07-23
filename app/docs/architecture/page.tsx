import Link from "next/link";

export const metadata = {
  title: "Architecture | AgenticOps AI",
  description:
    "Production architecture overview for AgenticOps AI communication intelligence, integrations, business workspace and approval model.",
};

const layers = [
  {
    title: "Inputs and Channels",
    items: [
      "Manual and uploaded business inputs",
      "Gmail readonly sync",
      "Telegram webhook",
      "Discord Railway Gateway worker",
      "Facebook Messenger webhook foundation",
      "Instagram webhook foundation",
    ],
  },
  {
    title: "Normalized Models",
    items: [
      "Shared message model",
      "Provider-neutral integration workflow records",
      "Business analysis records",
      "Audit findings",
      "Internal approval records",
    ],
  },
  {
    title: "Intelligence Engine",
    items: [
      "Deterministic Web3 rules",
      "AI-assisted classification",
      "Business communication analysis",
      "Budget calculations where source columns exist",
      "Explainability and human-review flags",
    ],
  },
  {
    title: "Outputs",
    items: [
      "Risk, intent and priority",
      "Suggested replies and actions",
      "Business reports",
      "Integration event log",
      "Approval Center",
      "Diagnostics and health states",
    ],
  },
];

export default function ArchitectureDocsPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <section className="section-card p-6 md:p-8">
          <p className="kicker">Architecture</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            AgenticOps AI Architecture
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
            A production-facing overview of the implemented platform boundaries.
            Future capabilities remain separated from current analyze-only
            functionality.
          </p>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          {layers.map((layer) => (
            <article key={layer.title} className="interactive-card p-5">
              <h2 className="text-xl font-semibold">{layer.title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {layer.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">Platform Flow</h2>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700 md:grid-cols-4">
            {[
              "Incoming Message",
              "Normalize",
              "Analyze",
              "Recommend",
              "Human Review",
              "Report",
              "Audit Trail",
              "Future Execution",
            ].map((step) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                {step}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Future execution is disabled by default and requires provider
            permissions, explicit human approval, audit logging and confirmation.
          </p>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/docs/asp" className="btn btn-secondary">
            ASP Docs
          </Link>
          <Link href="/integrations" className="btn btn-primary">
            Integrations Workspace
          </Link>
        </div>
      </div>
    </main>
  );
}
