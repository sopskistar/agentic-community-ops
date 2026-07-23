import Link from "next/link";

import { getIntegrationWorkspaceData, type ProviderId } from "../../lib/integrations/workspace";

export const dynamic = "force-dynamic";

export async function ProviderDetailPage({ providerId }: { providerId: ProviderId }) {
  const workspace = await getIntegrationWorkspaceData();
  const provider = workspace.providers.find((item) => item.id === providerId);

  if (!provider) {
    return null;
  }

  const providerEvents = workspace.events.filter(
    (event) => event.provider === providerId || (providerId === "facebook" && event.provider === "meta"),
  );

  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <Link href="/integrations" className="btn btn-secondary">
          Back to Integrations
        </Link>
        <section className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">Provider Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            {provider.name}
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
            {provider.statusMeaning} Current capabilities remain analyze-only
            and approval-required. No provider write action is available from
            this release.
          </p>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <InfoCard title="Status" items={[provider.status, provider.actionRequired]} />
          <InfoCard title="Permissions" items={provider.currentPermissions} />
          <InfoCard title="Limitations" items={provider.limitations} />
        </section>

        <section className="section-card mt-6 p-5 md:p-6">
          <h2 className="text-2xl font-semibold">Current Capabilities</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {provider.currentCapabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </section>

        <section className="section-card mt-6 p-5 md:p-6">
          <h2 className="text-2xl font-semibold">Recent Diagnostics</h2>
          {providerEvents.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No durable diagnostic events are recorded for this provider yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {providerEvents.slice(0, 15).map((event) => (
                <div key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-900">
                    {event.eventType} · {event.processingStatus}
                  </p>
                  <p className="mt-1 text-slate-600">
                    {event.timestamp} · analysis {event.analysisStatus}
                  </p>
                  {event.errorSummary ? (
                    <p className="mt-1 text-red-700">{event.errorSummary}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="section-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
