import Link from "next/link";
import { notFound } from "next/navigation";

import { getIntegrationWorkflowRecord } from "../../../../lib/integrations/event-log";
import { providerLabel } from "../../../../lib/integrations/workspace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Integration Message Detail | AgenticOps AI",
  description: "Read-only integration message detail and analysis.",
};

export default async function IntegrationMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-z0-9:_-]{1,240}$/i.test(id)) {
    notFound();
  }
  const workflow = await getIntegrationWorkflowRecord(id);
  if (!workflow) {
    notFound();
  }

  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-5xl">
        <Link href="/integrations" className="btn btn-secondary">
          Back to Integrations
        </Link>
        <article className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">Message Detail</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            {providerLabel(workflow.provider)} Communication
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only normalized message detail. Provider identifiers are
            redacted and no external action can be executed from this page.
          </p>
        </article>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1fr]">
          <article className="section-card p-5">
            <h2 className="text-xl font-semibold">Message Information</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <Detail label="Provider" value={providerLabel(workflow.provider)} />
              <Detail label="Time received" value={workflow.receivedMessage.timestamp} />
              <Detail label="Message type" value={String(workflow.receivedMessage.metadata?.channel ?? workflow.receivedMessage.channelId ?? workflow.receivedMessage.source)} />
              <Detail label="Safe sender" value={workflow.receivedMessage.senderName ?? workflow.receivedMessage.senderId ?? "Redacted sender"} />
              <Detail label="Workflow status" value={workflow.status} />
            </dl>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Bounded content
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {workflow.receivedMessage.textPreview}
              </p>
            </div>
          </article>

          <article className="section-card p-5">
            <h2 className="text-xl font-semibold">Analysis</h2>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Detail label="Risk" value={workflow.analysis?.riskLevel ?? "Pending"} />
              <Detail label="Intent" value={workflow.analysis?.intent ?? "Pending"} />
              <Detail label="Classification" value={workflow.analysis?.aiClassification ?? "Pending"} />
              <Detail label="Human review" value={workflow.approval?.status ?? "pending"} />
            </dl>
            <h3 className="mt-6 text-lg font-semibold">Explainability</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {(workflow.analysis?.explainability ?? [
                "Analysis has not completed for this message.",
              ]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 className="mt-6 text-lg font-semibold">Suggested Response</h3>
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              {workflow.suggestion?.suggestedReply ??
                "No suggested reply is available yet."}
            </p>
            <dl className="mt-4 grid gap-3 text-sm">
              <Detail
                label="Execution"
                value={
                  workflow.suggestion?.outboundUnavailableReason ??
                  "External execution is unavailable."
                }
              />
              <Detail
                label="Approval"
                value={workflow.approval?.status ?? "pending"}
              />
            </dl>
          </article>
        </section>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-slate-700">{value}</dd>
    </div>
  );
}
