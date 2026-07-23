import { apiErrorResponse } from "../../../../../lib/api/responses";
import { getIntegrationWorkflowRecord } from "../../../../../lib/integrations/event-log";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isSafeWorkflowId(id)) {
    return apiErrorResponse({
      code: "INVALID_MESSAGE_ID",
      message: "Invalid integration message id.",
      status: 400,
    });
  }

  const workflow = await getIntegrationWorkflowRecord(id);
  if (!workflow) {
    return apiErrorResponse({
      code: "MESSAGE_NOT_FOUND",
      message: "Integration message was not found.",
      status: 404,
    });
  }

  return Response.json({ workflow });
}

function isSafeWorkflowId(id: string) {
  return /^[a-z0-9:_-]{1,240}$/i.test(id);
}
