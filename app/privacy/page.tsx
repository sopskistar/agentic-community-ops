export const metadata = {
  title: "Privacy Policy | AgenticOps AI",
  description: "Current privacy information for AgenticOps AI integration processing.",
};

export default function PrivacyPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-4xl">
        <article className="section-card p-6 md:p-8">
          <p className="kicker">Privacy Policy</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            AgenticOps AI Privacy Policy
          </h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
            <p>
              This is the current policy page for the implemented AgenticOps AI
              MVP and configured integrations.
            </p>
            <p>
              AgenticOps AI is an AI Communication Intelligence Platform. It can
              process communication data from configured channels to provide
              analysis, risk signals, intent classification, suggested actions
              and human-review recommendations.
            </p>
            <p>
              Depending on enabled integrations, processed data may include
              message text, sender identifiers, channel identifiers, timestamps,
              provider message IDs, thread IDs, labels, and limited metadata
              needed to normalize and analyze messages. OAuth tokens may be
              stored server-side for connected Google/Gmail access.
            </p>
            <p>
              The Business Intelligence Workspace may store bounded analysis
              records, generated report metadata, audit findings, proposed
              internal action records and business profile context. Uploaded file
              bytes are parsed for extraction and are not permanently stored by
              the current implementation.
            </p>
            <p>
              Current integrations run in analyze-only mode. AgenticOps AI does
              not automatically send external replies, delete messages, archive
              email, label email, ban users, publish posts, manage ads or change
              provider data in this phase.
            </p>
            <p>
              Google OAuth tokens are encrypted before server-side persistence.
              Business and integration records use the configured durable
              repository when available. Production deployments should define
              retention, access controls and audit-log policies appropriate to
              the organization.
            </p>
            <p>
              Users can request deletion of stored integration data or OAuth
              tokens through the project owner. A configurable contact address
              should be added before production launch.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
