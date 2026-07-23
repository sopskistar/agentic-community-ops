export const metadata = {
  title: "Data Deletion Instructions | AgenticOps AI",
  description: "How to disconnect integrations and request deletion.",
};

export default function DataDeletionPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-4xl">
        <article className="section-card p-6 md:p-8">
          <p className="kicker">Data Deletion</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Data Deletion Instructions
          </h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
            <p>
              This is the current data deletion instructions page for the
              implemented AgenticOps AI MVP and configured integrations.
              AgenticOps AI currently provides a manual deletion request
              process. Automatic deletion infrastructure is not yet implemented.
            </p>
            <ul className="list-disc space-y-3 pl-5">
              <li>
                Google/Gmail: disconnect the app in your Google Account security
                settings, then request deletion of any stored OAuth token record.
              </li>
              <li>
                Meta/Facebook/Instagram: remove the app from Meta Business
                integrations and request deletion of stored webhook metadata.
              </li>
              <li>
                Discord: remove the bot from your server and request deletion of
                stored integration event metadata.
              </li>
              <li>
                Telegram: remove the bot from chats or revoke the bot token in
                BotFather, then request deletion of stored event metadata.
              </li>
              <li>
                Business workspace: request deletion of saved analysis records,
                generated reports, business profiles, proposed action records or
                profile knowledge text. Deleting an AgenticOps AI analysis record
                does not delete the original provider message or source file.
              </li>
              <li>
                Integrations workspace: request deletion of bounded normalized
                communication records, integration workflow records, approval
                notes, diagnostics or worker heartbeat metadata. This does not
                delete the original message from Gmail, Discord, Telegram,
                Facebook or Instagram.
              </li>
            </ul>
            <p>
              To request deletion, contact the project owner with the provider,
              approximate connection date and account or workspace identifier.
              Configure a production support email before public launch.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
