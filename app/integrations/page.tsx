import { IntegrationsWorkspace } from "./integrations-workspace";
import { getIntegrationWorkspaceData } from "../../lib/integrations/workspace";

const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.APP_BASE_URL?.trim() ||
  "https://agenticopsai.xyz";

export const metadata = {
  title: "Integrations & AI Workspace | AgenticOps AI",
  description:
    "Provider connection status, communication inbox, approval center and diagnostics for AgenticOps AI integrations.",
};

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const workspace = await getIntegrationWorkspaceData();

  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-7xl">
        <section className="section-card p-6 md:p-8">
          <p className="kicker">Integrations</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Integrations & AI Workspace
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
            Monitor connected channels, review normalized communication events,
            inspect AI analysis, manage internal approvals and understand future
            integration paths. All providers remain analyze-only unless a future
            permissioned execution layer is explicitly configured and approved.
          </p>
        </section>

        <IntegrationsWorkspace workspace={workspace} appBaseUrl={appBaseUrl} />
      </div>
    </main>
  );
}
