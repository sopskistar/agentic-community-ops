import Link from "next/link";
import type { ReactNode } from "react";

import { GmailSyncButton } from "./gmail-sync-button";
import { getGmailConnectionStatus } from "../../lib/integrations/google/gmail-service";
import { getDiscordWorkerStatus } from "../../lib/integrations/discord/status";
import {
  listIntegrationEventLogEntries,
  listIntegrationWorkflowRecords,
} from "../../lib/integrations/event-log";
import { getMetaProviderStatus } from "../../lib/integrations/meta/status";

const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.APP_BASE_URL?.trim() ||
  "https://YOUR_DEPLOYMENT_URL";

export const metadata = {
  title: "Integrations | AgenticOps AI",
  description:
    "Integration status and setup notes for AgenticOps AI communication channels.",
};

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const gmailStatus = await getGmailConnectionStatus();
  const facebookStatus = await getMetaProviderStatus("facebook");
  const instagramStatus = await getMetaProviderStatus("instagram");
  const discordStatus = await getDiscordWorkerStatus();
  const eventLog = await safeListIntegrationEventLogEntries();
  const workflows = await safeListIntegrationWorkflowRecords();
  const gmailStats = getGmailEventStats(eventLog);

  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-7xl">
        <section className="section-card p-6 md:p-8">
          <p className="kicker">Integrations</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Communication integrations
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            External channels run in analyze-only mode. AgenticOps AI can inspect
            normalized messages and produce recommendations, but it does not
            send replies, moderate users, modify email, manage ads or publish
            content in this phase.
          </p>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <IntegrationCard
            name="Gmail"
            status={formatGmailStatus(gmailStatus.status)}
            detail={`Readonly sync and analysis only. Last successful sync: ${gmailStats.lastSync ?? "never"}. Last event: ${gmailStats.lastReceived ?? "none"}. Latest imported: ${gmailStats.latestImported}.`}
            actionHref="/api/integrations/google/auth"
            actionLabel="Connect Gmail"
            actionElement={
              gmailStatus.status === "connected" ? <GmailSyncButton /> : undefined
            }
          />
          <IntegrationCard
            name="Facebook Messenger"
            status={formatMetaStatus(facebookStatus.status)}
            detail={formatMetaDetail(facebookStatus, "Facebook Page")}
          />
          <IntegrationCard
            name="Instagram"
            status={formatMetaStatus(instagramStatus.status)}
            detail={formatMetaDetail(instagramStatus, "Instagram Business")}
          />
          <IntegrationCard
            name="Telegram"
            status={process.env.TELEGRAM_BOT_TOKEN ? "Configuration detected" : "Not configured"}
            detail="Webhook route validates the secret token when configured and analyzes text messages only."
          />
          <IntegrationCard
            name="Discord"
            status={formatDiscordStatus(discordStatus.status)}
            detail={formatDiscordDetail(discordStatus)}
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
            <p className="kicker">Integration Event Log</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Events are redacted. Use Vercel KV/Upstash environment variables
              for durable production storage; otherwise local development uses a
              file fallback.
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

        <section className="section-card mt-6 p-5 md:p-6">
          <p className="kicker">Human Approval Workflow</p>
          <h2 className="mt-3 text-2xl font-semibold">
            Analysis, suggestions and actions stay separated
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            AgenticOps AI stores received messages, analysis results and suggested
            replies as separate workflow records. External execution remains
            unavailable until provider permissions, tenant ownership and explicit
            human approval workflows are configured.
          </p>
          <div className="mt-5 grid gap-3">
            {workflows.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No analyzed integration workflow records are available yet.
              </p>
            ) : (
              workflows.map((workflow) => (
                <article
                  key={workflow.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {workflow.provider} · {workflow.status}
                      </p>
                      <p className="mt-1 text-slate-600">
                        Risk {workflow.analysis?.riskLevel ?? "pending"} ·{" "}
                        {workflow.analysis?.intent ?? "No intent yet"}
                      </p>
                    </div>
                    <span className="badge border-amber-200 bg-amber-50 text-amber-900">
                      Approval required
                    </span>
                  </div>
                  <p className="mt-3 text-slate-600">
                    {workflow.receivedMessage.textPreview}
                  </p>
                </article>
              ))
            )}
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
  actionElement,
}: {
  name: string;
  status: string;
  detail: string;
  actionHref?: string;
  actionLabel?: string;
  actionElement?: ReactNode;
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
      {actionElement}
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
    return "Configuration required";
  }

  return "Configuration required";
}

async function safeListIntegrationEventLogEntries() {
  try {
    return await listIntegrationEventLogEntries();
  } catch {
    return [];
  }
}

async function safeListIntegrationWorkflowRecords() {
  try {
    return await listIntegrationWorkflowRecords(10);
  } catch {
    return [];
  }
}

function formatMetaStatus(status: string) {
  if (status === "receiving_events") {
    return "Connected";
  }

  if (status === "webhook_verified") {
    return "Webhook verified";
  }

  if (status === "no_event_received_yet") {
    return "No event received yet";
  }

  if (status === "configuration_detected") {
    return "Configuration detected";
  }

  if (status === "error") {
    return "Error";
  }

  return "Not configured";
}

function formatMetaDetail(
  status: Awaited<ReturnType<typeof getMetaProviderStatus>>,
  providerName: string,
) {
  const activity = `Last DM event: ${status.latestDirectMessageEventReceived ?? "none"}. Last comment event: ${status.latestCommentEventReceived ?? "none"}. Last provider event: ${status.latestProviderEventReceived ?? status.latestVerificationTime ?? "none"}. Messages: ${status.messageCount}. Comments: ${status.commentCount}.`;

  if (!status.repositoryAvailable) {
    return `${providerName} diagnostics could not read durable storage. Check KV/Upstash configuration.`;
  }

  if (status.status === "receiving_events") {
    return `${providerName} is receiving webhook events and analyzing them in approval-required mode. ${activity}`;
  }

  if (status.status === "webhook_verified") {
    return `${providerName} webhook verification has succeeded. ${activity}`;
  }

  if (status.status === "no_event_received_yet") {
    return `${providerName} environment variables are detected. Confirm Meta dashboard subscriptions and account/Page linkage. ${activity}`;
  }

  if (status.status === "configuration_detected") {
    return `${providerName} configuration is partially detected. Add verify token, app secret and required Meta dashboard subscriptions.`;
  }

  if (status.status === "error") {
    return `${providerName} has a recent diagnostic error. Review the redacted integration event log.`;
  }

  return `${providerName} is not configured. Add the required Meta environment variables and dashboard subscriptions.`;
}

function formatDiscordStatus(status: string) {
  if (status === "worker_recently_active") {
    return "Worker online";
  }

  if (status === "worker_stale") {
    return "Worker stale";
  }

  if (status === "worker_never_seen") {
    return "Worker never seen";
  }

  if (status === "configuration_detected") {
    return "Configuration detected";
  }

  if (status === "error") {
    return "Error";
  }

  return "Not configured";
}

function formatDiscordDetail(
  status: Awaited<ReturnType<typeof getDiscordWorkerStatus>>,
) {
  const activity = `Last heartbeat: ${status.latestHeartbeat ?? "none"}. Last message: ${status.latestMessageReceived ?? "none"}. Last processing success: ${status.latestProcessingSuccess ?? "none"}. Messages: ${status.messageCount}.`;

  if (!status.repositoryAvailable) {
    return "Discord diagnostics could not read durable storage. Check KV/Upstash configuration.";
  }

  if (status.status === "worker_recently_active") {
    return `Discord Gateway worker is recently active on a persistent runtime. ${activity}`;
  }

  if (status.status === "worker_stale") {
    return `Discord worker heartbeat is stale. Check the Railway worker logs. ${activity}`;
  }

  if (status.status === "worker_never_seen") {
    return `Discord configuration is detected, but no worker heartbeat has been recorded. Start the Railway worker. ${activity}`;
  }

  if (status.status === "configuration_detected") {
    return `Discord configuration is partially detected. Railway must run the persistent worker; Vercel remains the web/API host. ${activity}`;
  }

  if (status.status === "error") {
    return `Discord has a recent diagnostic error. Review the redacted event log and Railway logs. ${activity}`;
  }

  return "Discord is not configured. Add worker environment variables in Railway before starting the Gateway worker.";
}

function getGmailEventStats(
  eventLog: Awaited<ReturnType<typeof listIntegrationEventLogEntries>>,
) {
  const latestSync = eventLog.find(
    (event) =>
      event.provider === "gmail" &&
      event.eventType === "gmail_sync_completed" &&
      event.analysisStatus === "completed",
  );
  const latestStart = eventLog.find(
    (event) => event.provider === "gmail" && event.eventType === "gmail_sync_started",
  );
  const latestReceived = eventLog.find(
    (event) => event.provider === "gmail" && event.eventType === "gmail_message_received",
  );
  const latestImported =
    latestStart && latestSync
      ? eventLog.filter(
          (event) =>
            event.provider === "gmail" &&
            event.eventType === "gmail_analysis_completed" &&
            event.timestamp >= latestStart.timestamp &&
            event.timestamp <= latestSync.timestamp,
        ).length
      : 0;

  return {
    lastSync: latestSync?.timestamp,
    lastReceived: latestReceived?.timestamp,
    latestImported,
  };
}
