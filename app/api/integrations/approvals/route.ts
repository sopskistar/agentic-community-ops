import { listIntegrationWorkflowRecords } from "../../../../lib/integrations/event-log";
import { workflowToApprovalItem } from "../../../../lib/integrations/workspace";

export const dynamic = "force-dynamic";

export async function GET() {
  const workflows = await listIntegrationWorkflowRecords(100);
  return Response.json({
    approvals: workflows
      .filter((workflow) => workflow.suggestion || workflow.approval)
      .map(workflowToApprovalItem),
  });
}
