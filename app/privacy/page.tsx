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
              Current integrations run in analyze-only mode. AgenticOps AI does
              not automatically send external replies, delete messages, archive
              email, label email, ban users, publish posts, manage ads or change
              provider data in this phase.
            </p>
            <p>
              Development token storage is encrypted at rest when configured but
              is not a substitute for production database-backed secret storage.
              Production deployments should use durable encrypted storage,
              access controls, audit logs and retention policies appropriate to
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
