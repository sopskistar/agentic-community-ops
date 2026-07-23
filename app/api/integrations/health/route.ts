import { getIntegrationWorkspaceData } from "../../../../lib/integrations/workspace";

export const dynamic = "force-dynamic";

export async function GET() {
  const workspace = await getIntegrationWorkspaceData();
  return Response.json({
    providers: workspace.providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      status: provider.status,
      lastSuccessfulEvent: provider.lastSuccessfulEvent,
      lastFailedEvent: provider.lastFailedEvent,
      lastSynchronization: provider.lastSynchronization,
      lastHealthCheck: provider.lastHealthCheck,
      recentEventCount: provider.recentEventCount,
      recentFailureCount: provider.recentFailureCount,
      actionRequired: provider.actionRequired,
    })),
    metrics: workspace.metrics,
  });
}
