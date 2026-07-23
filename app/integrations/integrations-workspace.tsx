"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { GmailSyncButton } from "./gmail-sync-button";
import type {
  ApprovalCenterItem,
  CommunicationInboxItem,
  IntegrationProviderSummary,
  IntegrationStatus,
  IntegrationWorkspaceData,
  PlannedIntegrationGroup,
} from "../../lib/integrations/workspace";

type TabId =
  | "overview"
  | "connected"
  | "available"
  | "planned"
  | "inbox"
  | "approvals"
  | "events"
  | "health";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "connected", label: "Connected" },
  { id: "available", label: "Available" },
  { id: "planned", label: "Planned" },
  { id: "inbox", label: "Communication Inbox" },
  { id: "approvals", label: "Approval Center" },
  { id: "events", label: "Event Log" },
  { id: "health", label: "Health & Diagnostics" },
];

const readableStatus: Record<string, string> = {
  google_connected: "Gmail connected successfully.",
  google_token_error: "Gmail connection could not be saved. Check durable token storage.",
  google_state_error: "Gmail connection could not be completed. Start OAuth again.",
};

export function IntegrationsWorkspace({
  workspace,
  appBaseUrl,
}: {
  workspace: IntegrationWorkspaceData;
  appBaseUrl: string;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [providerFilter, setProviderFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [eventProviderFilter, setEventProviderFilter] = useState("all");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusCode = searchParams.get("status");
  const successMessage = statusCode ? readableStatus[statusCode] : undefined;

  useEffect(() => {
    if (statusCode) {
      const timeout = window.setTimeout(() => router.replace(pathname), 250);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [pathname, router, statusCode]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveTab(tabs[(index + 1) % tabs.length].id);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveTab(tabs[(index - 1 + tabs.length) % tabs.length].id);
    }
  }

  const inbox = useMemo(
    () =>
      workspace.inbox.filter((item) => {
        const matchesProvider =
          providerFilter === "all" ||
          item.provider.toLowerCase().includes(providerFilter);
        const matchesRisk =
          riskFilter === "all" || item.riskLevel.toLowerCase() === riskFilter;
        const matchesApproval =
          approvalFilter === "all" ||
          item.humanReviewStatus.toLowerCase().includes(approvalFilter);
        const matchesQuery =
          !query.trim() ||
          item.boundedPreview.toLowerCase().includes(query.toLowerCase()) ||
          item.intent.toLowerCase().includes(query.toLowerCase());
        return matchesProvider && matchesRisk && matchesApproval && matchesQuery;
      }),
    [approvalFilter, providerFilter, query, riskFilter, workspace.inbox],
  );

  const events = useMemo(
    () =>
      workspace.events.filter((event) => {
        const matchesProvider =
          eventProviderFilter === "all" || event.provider === eventProviderFilter;
        const matchesStatus =
          eventStatusFilter === "all" ||
          event.processingStatus === eventStatusFilter;
        return matchesProvider && matchesStatus;
      }),
    [eventProviderFilter, eventStatusFilter, workspace.events],
  );

  return (
    <div className="mt-6 space-y-6">
      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-900"
        >
          {successMessage}
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Integrations workspace sections"
        onKeyDown={onKeyDown}
        className="section-card flex gap-2 overflow-x-auto p-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`integrations-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`integrations-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-slate-950 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TabPanel id="overview" activeTab={activeTab}>
        <Overview workspace={workspace} appBaseUrl={appBaseUrl} />
      </TabPanel>
      <TabPanel id="connected" activeTab={activeTab}>
        <ProviderGrid
          title="Connected or Active Evidence"
          emptyText="No provider has verifiable connection or activity evidence yet."
          providers={workspace.connectedProviders}
          showActions
        />
      </TabPanel>
      <TabPanel id="available" activeTab={activeTab}>
        <ProviderGrid
          title="Available Integrations"
          emptyText="All implemented providers currently have some connection or activity evidence."
          providers={workspace.availableProviders}
          showActions
        />
      </TabPanel>
      <TabPanel id="planned" activeTab={activeTab}>
        <PlannedIntegrations groups={workspace.plannedProviders} />
      </TabPanel>
      <TabPanel id="inbox" activeTab={activeTab}>
        <CommunicationInbox
          items={inbox}
          providerFilter={providerFilter}
          riskFilter={riskFilter}
          approvalFilter={approvalFilter}
          query={query}
          setProviderFilter={setProviderFilter}
          setRiskFilter={setRiskFilter}
          setApprovalFilter={setApprovalFilter}
          setQuery={setQuery}
        />
      </TabPanel>
      <TabPanel id="approvals" activeTab={activeTab}>
        <ApprovalCenter approvals={workspace.approvals} />
      </TabPanel>
      <TabPanel id="events" activeTab={activeTab}>
        <EventLog
          events={events}
          providerFilter={eventProviderFilter}
          statusFilter={eventStatusFilter}
          setProviderFilter={setEventProviderFilter}
          setStatusFilter={setEventStatusFilter}
        />
      </TabPanel>
      <TabPanel id="health" activeTab={activeTab}>
        <HealthDiagnostics providers={workspace.providers} appBaseUrl={appBaseUrl} />
      </TabPanel>
    </div>
  );
}

function TabPanel({
  id,
  activeTab,
  children,
}: {
  id: TabId;
  activeTab: TabId;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`integrations-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`integrations-tab-${id}`}
      hidden={activeTab !== id}
    >
      {activeTab === id ? children : null}
    </section>
  );
}

function Overview({
  workspace,
  appBaseUrl,
}: {
  workspace: IntegrationWorkspaceData;
  appBaseUrl: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Connected" value={workspace.metrics.connectedProviders} />
        <MetricCard label="Active" value={workspace.metrics.activeProviders} />
        <MetricCard label="Analyzed" value={workspace.metrics.messagesAnalyzed} />
        <MetricCard label="High Risk" value={workspace.metrics.highRiskMessages} />
        <MetricCard label="Pending Reviews" value={workspace.metrics.pendingApprovals} />
        <MetricCard label="Failures" value={workspace.metrics.providerProcessingFailures} />
      </div>
      <ProviderGrid
        title="Provider Summary"
        emptyText="No integration providers are available."
        providers={workspace.providers}
        showActions
      />
      <section className="section-card p-5 md:p-6">
        <p className="kicker">Callback and Webhook URLs</p>
        <dl className="mt-5 grid gap-3 lg:grid-cols-2">
          {[
            ["Google OAuth localhost", "http://localhost:3000/api/integrations/google/callback"],
            ["Google OAuth production", `${appBaseUrl}/api/integrations/google/callback`],
            ["Meta webhook", `${appBaseUrl}/api/webhooks/meta`],
            ["Telegram webhook", `${appBaseUrl}/api/webhooks/telegram`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {label}
              </dt>
              <dd className="mt-2 break-all text-sm font-semibold text-slate-800">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <RoadmapPanels />
    </div>
  );
}

function ProviderGrid({
  title,
  emptyText,
  providers,
  showActions,
}: {
  title: string;
  emptyText: string;
  providers: IntegrationProviderSummary[];
  showActions?: boolean;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader title={title} text="Statuses are derived from durable OAuth records, webhook verification records, provider events and worker heartbeats where available." />
      {providers.length === 0 ? (
        <EmptyState title={title} text={emptyText} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} showActions={showActions} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProviderCard({
  provider,
  showActions,
}: {
  provider: IntegrationProviderSummary;
  showActions?: boolean;
}) {
  return (
    <article className="interactive-card flex min-h-80 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{provider.name}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            {provider.category}
          </p>
        </div>
        <IntegrationStatusBadge status={provider.status} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {provider.statusMeaning}
      </p>
      <dl className="mt-4 grid gap-2 text-sm">
        <Detail label="Last event" value={provider.lastSuccessfulEvent ?? "None recorded"} />
        <Detail label="Last sync" value={provider.lastSynchronization ?? "Not applicable"} />
        <Detail label="Last health check" value={provider.lastHealthCheck ?? "None recorded"} />
        <Detail label="Recent events" value={String(provider.recentEventCount)} />
      </dl>
      <CapabilityList title="Implemented" items={provider.currentCapabilities.slice(0, 4)} />
      <CapabilityList title="Limitations" items={provider.limitations.slice(0, 4)} muted />
      <p className="mt-4 text-sm font-semibold text-slate-800">
        {provider.actionRequired}
      </p>
      {showActions ? (
        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          {provider.id === "gmail" ? (
            <Link href="/api/integrations/google/auth" className="btn btn-primary">
              Connect Gmail
            </Link>
          ) : null}
          <Link href={provider.detailHref} className="btn btn-secondary">
            Open Workspace
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("agenticops:open-health"))}
            className="btn btn-secondary"
          >
            View Diagnostics
          </button>
        </div>
      ) : null}
      {provider.id === "gmail" && ["Connected", "Active"].includes(provider.status) ? (
        <GmailSyncButton />
      ) : null}
    </article>
  );
}

function CommunicationInbox({
  items,
  providerFilter,
  riskFilter,
  approvalFilter,
  query,
  setProviderFilter,
  setRiskFilter,
  setApprovalFilter,
  setQuery,
}: {
  items: CommunicationInboxItem[];
  providerFilter: string;
  riskFilter: string;
  approvalFilter: string;
  query: string;
  setProviderFilter: (value: string) => void;
  setRiskFilter: (value: string) => void;
  setApprovalFilter: (value: string) => void;
  setQuery: (value: string) => void;
}) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Unified Communication Inbox"
        text="Read-only normalized messages from supported providers. This is an intelligence workspace, not a replacement provider inbox."
      />
      <div className="section-card grid gap-4 p-5 md:grid-cols-4">
        <FilterSelect
          label="Provider"
          value={providerFilter}
          onChange={setProviderFilter}
          options={["all", "gmail", "telegram", "discord", "facebook", "instagram"]}
        />
        <FilterSelect
          label="Risk"
          value={riskFilter}
          onChange={setRiskFilter}
          options={["all", "safe", "low", "medium", "high", "critical", "unknown"]}
        />
        <FilterSelect
          label="Review"
          value={approvalFilter}
          onChange={setApprovalFilter}
          options={["all", "pending", "approved", "rejected", "needs"]}
        />
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">Search summaries</span>
          <input
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search bounded previews"
          />
        </label>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title="No inbox messages"
          text="Sync Gmail or send supported Telegram, Discord, Facebook or Instagram messages to populate the normalized inbox."
        />
      ) : (
        <div className="grid gap-4">
          {items.slice(0, 50).map((item) => (
            <article key={item.id} className="interactive-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {item.provider} · {item.providerMessageType}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.receivedAt} · {item.safeSenderReference}
                  </p>
                </div>
                <IntegrationStatusBadge
                  status={item.analysisStatus === "Completed" ? "Active" : "Action Required"}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                {item.boundedPreview}
              </p>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                <Detail label="Risk" value={item.riskLevel} />
                <Detail label="Intent" value={item.intent} />
                <Detail label="Priority" value={item.priority} />
                <Detail label="Review" value={item.humanReviewStatus} />
              </dl>
              <Link href={`/integrations/messages/${encodeURIComponent(item.id)}`} className="btn btn-secondary mt-5">
                Open Message Detail
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ApprovalCenter({ approvals }: { approvals: ApprovalCenterItem[] }) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Approval Center"
        text="Approve, reject or request more information for internal recommendations. Approval here never sends external messages or performs provider actions."
      />
      {approvals.length === 0 ? (
        <EmptyState
          title="No pending approvals"
          text="Suggested replies, escalations, risk alerts and proposed internal actions will appear here after provider messages are analyzed."
        />
      ) : (
        <div className="grid gap-4">
          {approvals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))}
        </div>
      )}
    </section>
  );
}

function ApprovalCard({ approval }: { approval: ApprovalCenterItem }) {
  const [status, setStatus] = useState(approval.status);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function update(nextStatus: "approved" | "rejected" | "needs_more_information" | "resolved_internal") {
    startTransition(async () => {
      const response = await fetch(`/api/integrations/approvals/${encodeURIComponent(approval.workflowId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          notes: note || undefined,
          actorLabel: "Internal reviewer",
          reason: "Manual internal review decision.",
        }),
      });
      if (response.ok) {
        const labels: Record<typeof nextStatus, string> = {
          approved: "Approved Internally",
          rejected: "Rejected",
          needs_more_information: "Needs More Information",
          resolved_internal: "Resolved Internally",
        };
        setStatus(labels[nextStatus]);
      }
    });
  }

  return (
    <article className="interactive-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{approval.sourceProvider}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {approval.recommendationType} · {approval.createdAt}
          </p>
        </div>
        <IntegrationStatusBadge
          status={status === "Pending Review" ? "Action Required" : "Connected"}
        />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">
        {approval.recommendation}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {approval.explanation}
      </p>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-4">
        <Detail label="Status" value={status} />
        <Detail label="Risk" value={approval.risk} />
        <Detail label="Priority" value={approval.priority} />
        <Detail label="Execution" value={approval.externalExecutionAvailability} />
      </dl>
      <label className="mt-4 block space-y-2">
        <span className="text-sm font-semibold text-slate-800">Internal note</span>
        <textarea
          className="field min-h-24"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional internal review note. This is not sent externally."
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={isPending} onClick={() => update("approved")} className="btn btn-primary">
          Approve Internally
        </button>
        <button type="button" disabled={isPending} onClick={() => update("rejected")} className="btn btn-secondary">
          Reject
        </button>
        <button type="button" disabled={isPending} onClick={() => update("needs_more_information")} className="btn btn-secondary">
          Request Info
        </button>
        <button type="button" disabled={isPending} onClick={() => update("resolved_internal")} className="btn btn-secondary">
          Mark Resolved
        </button>
      </div>
    </article>
  );
}

function EventLog({
  events,
  providerFilter,
  statusFilter,
  setProviderFilter,
  setStatusFilter,
}: {
  events: IntegrationWorkspaceData["events"];
  providerFilter: string;
  statusFilter: string;
  setProviderFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
}) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Integration Event Log"
        text="Operational lifecycle records are redacted and bounded. Full private message content and raw provider payloads are not displayed here."
      />
      <div className="section-card grid gap-4 p-5 md:grid-cols-2">
        <FilterSelect
          label="Provider"
          value={providerFilter}
          onChange={setProviderFilter}
          options={["all", "gmail", "telegram", "discord", "facebook", "instagram", "meta"]}
        />
        <FilterSelect
          label="Processing status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["all", "received", "processed", "ignored", "error"]}
        />
      </div>
      {events.length === 0 ? (
        <EmptyState title="No integration events" text="Provider lifecycle events will appear after webhooks, syncs or worker heartbeats are received." />
      ) : (
        <div className="section-card overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="p-4">Provider</th>
                <th className="p-4">Event</th>
                <th className="p-4">Status</th>
                <th className="p-4">Analysis</th>
                <th className="p-4">Time</th>
                <th className="p-4">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {events.slice(0, 75).map((event) => (
                <tr key={event.id}>
                  <td className="p-4 font-semibold text-slate-900">{event.provider}</td>
                  <td className="p-4 text-slate-700">{event.eventType}</td>
                  <td className="p-4 text-slate-700">{event.processingStatus}</td>
                  <td className="p-4 text-slate-700">{event.analysisStatus}</td>
                  <td className="p-4 text-slate-600">{event.timestamp}</td>
                  <td className="p-4 text-slate-600">{event.errorSummary ?? "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function HealthDiagnostics({
  providers,
  appBaseUrl,
}: {
  providers: IntegrationProviderSummary[];
  appBaseUrl: string;
}) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Health & Diagnostics"
        text="Health is derived from durable provider events, OAuth records, webhook verification and worker heartbeat evidence."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <article key={provider.id} className="section-card p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">{provider.name}</h3>
              <IntegrationStatusBadge status={provider.status} />
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <Detail label="Recent successes" value={String(provider.recentEventCount)} />
              <Detail label="Recent failures" value={String(provider.recentFailureCount)} />
              <Detail label="Last failure" value={provider.lastFailedEvent ?? "None recorded"} />
              <Detail label="Next action" value={provider.actionRequired} />
            </dl>
          </article>
        ))}
      </div>
      <section className="section-card p-5">
        <p className="kicker">Safe Manual Checks</p>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
          <li>Validate Gmail by opening `/integrations/gmail` and running manual sync.</li>
          <li>Check Discord heartbeat through the Worker Online status above.</li>
          <li>Verify Meta callback in the Meta dashboard: `{appBaseUrl}/api/webhooks/meta`.</li>
          <li>Verify Telegram webhook with the provider API using placeholder secrets only.</li>
          <li>Check durable storage by confirming events persist after refresh.</li>
          <li>Check AI provider configuration through successful analysis events.</li>
        </ul>
      </section>
    </section>
  );
}

function PlannedIntegrations({ groups }: { groups: PlannedIntegrationGroup[] }) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Planned Integrations Catalog"
        text="These providers are roadmap items. They do not have active connection buttons and no production connection is implied."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <article key={group.title} className="section-card p-5">
            <h3 className="text-xl font-semibold">{group.title}</h3>
            <div className="mt-4 grid gap-3">
              {group.items.map((item) => (
                <div key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <span className="badge border-slate-200 bg-white text-slate-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                  <button type="button" disabled className="btn btn-secondary mt-3 cursor-not-allowed opacity-60">
                    Planned
                  </button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoadmapPanels() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {[
        ["Future Email Workspace", "Draft replies, human-approved sending, gmail.send, gmail.modify, labels, archive, follow-up reminders, SLA tracking, shared inbox, assignment and attachment intelligence."],
        ["Marketing & Ads Intelligence", "Inbound Meta message intelligence exists today. Ads analysis, budget pacing, creative recommendations and campaign changes are future and require human approval."],
        ["CRM & Business Data", "HubSpot, Salesforce, Zendesk, BigQuery, Microsoft 365, QuickBooks, Xero, Stripe and Shopify remain planned or future integrations."],
      ].map(([title, text]) => (
        <article key={title} className="section-card p-5">
          <p className="kicker">Roadmap</p>
          <h3 className="mt-2 text-lg font-semibold">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
        </article>
      ))}
    </div>
  );
}

function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  const styles: Record<string, string> = {
    Connected: "border-emerald-200 bg-emerald-50 text-emerald-900",
    Active: "border-emerald-200 bg-emerald-50 text-emerald-900",
    "Worker Online": "border-emerald-200 bg-emerald-50 text-emerald-900",
    "Webhook Verified": "border-blue-200 bg-blue-50 text-blue-900",
    Configured: "border-blue-200 bg-blue-50 text-blue-900",
    Available: "border-blue-200 bg-blue-50 text-blue-900",
    "Awaiting First Event": "border-amber-200 bg-amber-50 text-amber-900",
    "Action Required": "border-amber-200 bg-amber-50 text-amber-900",
    "Permission Required": "border-amber-200 bg-amber-50 text-amber-900",
    "Provider Review Required": "border-amber-200 bg-amber-50 text-amber-900",
    Degraded: "border-red-200 bg-red-50 text-red-900",
    Error: "border-red-200 bg-red-50 text-red-900",
    Disconnected: "border-slate-200 bg-slate-50 text-slate-700",
    Planned: "border-slate-200 bg-slate-50 text-slate-700",
  };
  return (
    <span className={`badge ${styles[status] ?? styles.Planned}`} aria-label={`Status: ${status}`}>
      {status}
    </span>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function CapabilityList({
  title,
  items,
  muted,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm leading-6 ${muted ? "text-slate-500" : "text-slate-700"}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All" : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-slate-700">{value}</dd>
    </div>
  );
}

function SectionHeader({ title, text }: { title: string; text: string }) {
  return (
    <header>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{text}</p>
    </header>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="section-card border-dashed p-6 text-sm text-slate-600">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 leading-6">{text}</p>
    </div>
  );
}
