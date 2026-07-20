import Link from "next/link";

import { getGmailConnectionStatus } from "../../lib/integrations/google/gmail-service";
import { listIntegrationEventLogEntries } from "../../lib/integrations/event-log";

const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.APP_BASE_URL?.trim() ||
  "https://YOUR_DEPLOYMENT_URL";

export const metadata = {
  title: "Integrations | Agentic Ops",
  description:
    "Integration status and setup notes for Agentic Ops communication channels.",
};

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const gmailStatus = await getGmailConnectionStatus();
  const eventLog = listIntegrationEventLogEntries();

  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-7xl">
        <section className="section-card p-6 md:p-8">
          <p className="kicker">Integrations</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Communication integrations
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            External channels run in analyze-only mode. Agentic Ops can inspect
            normalized messages and produce recommendations, but it does not
            send replies, moderate users, modify email, manage ads or publish
            content in this phase.
          </p>
          {params.status ? (
            <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              Integration status: {params.status}
            </p>
          ) : null}
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <IntegrationCard
            name="Gmail"
            status={formatGmailStatus(gmailStatus.status)}
            detail="Uses gmail.readonly only. No email send, archive, label or delete actions are implemented."
            actionHref="/api/integrations/google/auth"
            actionLabel="Connect Gmail"
          />
          <IntegrationCard
            name="Facebook Messenger"
            status={process.env.META_VERIFY_TOKEN ? "Configuration detected" : "Not configured"}
            detail="Webhook verification and signed event reception are implemented for analyze-only processing."
          />
          <IntegrationCard
            name="Instagram"
            status={process.env.META_VERIFY_TOKEN ? "Configuration detected" : "Not configured"}
            detail="Instagram messaging webhook events are normalized when Meta sends supported payloads."
          />
          <IntegrationCard
            name="Telegram"
            status={process.env.TELEGRAM_BOT_TOKEN ? "Configuration detected" : "Not configured"}
            detail="Webhook route validates the secret token when configured and analyzes text messages only."
          />
          <IntegrationCard
            name="Discord"
            status={process.env.DISCORD_BOT_TOKEN ? "Configuration detected" : "Not configured"}
            detail="Discord Gateway requires the separate persistent worker, not the Vercel request runtime."
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="section-card p-5 md:p-6">
            <p className="kicker">Callback URLs</p>
            <UrlList
              urls={[
                ["Google OAuth localhost", "http://localhost:3000/api/integrations/google/callback"],
                ["Google OAuth production", `${appBaseUrl}/api/integrations/google/callback`],
                ["Meta webhook", `${appBaseUrl}/api/webhooks/meta`],
                ["Telegram webhook", `${appBaseUrl}/api/webhooks/telegram`],
              ]}
            />
          </div>

          <div className="section-card p-5 md:p-6">
            <p className="kicker">Development Event Log</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This in-memory log is redacted and not production persistence.
            </p>
            <div className="mt-5 space-y-3">
              {eventLog.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  No integration events recorded in this server instance.
                </p>
              ) : (
                eventLog.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="rounded-lg bg-slate-50 p-4 text-sm">
                    <p className="font-semibold text-slate-900">
                      {entry.provider} · {entry.eventType}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {entry.processingStatus} / {entry.analysisStatus}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.timestamp}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="mt-6">
          <Link href="/integrations/gmail" className="btn btn-secondary">
            Open Gmail Connection
          </Link>
        </div>
      </div>
    </main>
  );
}

function IntegrationCard({
  name,
  status,
  detail,
  actionHref,
  actionLabel,
}: {
  name: string;
  status: string;
  detail: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <article className="interactive-card flex min-h-56 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold">{name}</h2>
        <span className="badge border-slate-200 bg-slate-50 text-slate-700">
          {status}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{detail}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-primary mt-5 w-fit">
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}

function UrlList({ urls }: { urls: Array<[string, string]> }) {
  return (
    <dl className="mt-5 grid gap-3">
      {urls.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </dt>
          <dd className="mt-2 break-all text-sm font-semibold text-slate-800">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatGmailStatus(status: string) {
  if (status === "connected") {
    return "Connected";
  }

  if (status === "reconnect_required") {
    return "Reconnect required";
  }

  if (status === "not_configured") {
    return "Not configured";
  }

  return "Configuration required";
}
