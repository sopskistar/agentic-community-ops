import { BusinessClient } from "./business-client";

export const metadata = {
  title: "Business Intelligence Workspace | AgenticOps AI",
  description:
    "Analyze communications, review business documents, identify risks, conduct preliminary audits, examine budgets and generate explainable executive reports.",
};

export default function BusinessPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="kicker">Business Communication Intelligence</p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Business Intelligence Workspace
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                Analyze communications, review business documents, identify
                risks, conduct preliminary audits, examine budgets and generate
                explainable executive reports. This is decision-support
                software for qualified human review.
              </p>
            </div>
            <div className="section-card p-5 md:p-6">
              <p className="kicker">Current Capability</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <StatusPill label="Paste text" status="Implemented" />
                <StatusPill label="TXT upload" status="Implemented" />
                <StatusPill label="PDF/DOCX files" status="Implemented" />
                <StatusPill label="CSV/XLSX files" status="Implemented" />
                <StatusPill label="CRM sync" status="Planned" />
              </div>
              <p className="warning-card mt-5 rounded-lg px-4 py-3 text-sm font-semibold leading-6">
                Business analysis remains decision-support only: no external
                business AI call, CRM integration, email sending or autonomous
                action runs on this page.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BusinessClient />
    </main>
  );
}

function StatusPill({
  label,
  status,
}: {
  label: string;
  status: "Implemented" | "Planned";
}) {
  const statusClass =
    status === "Implemented"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <span className={`badge mt-2 ${statusClass}`}>{status}</span>
    </div>
  );
}
