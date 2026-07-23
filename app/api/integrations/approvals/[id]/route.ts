import { ZodError, z } from "zod";

import {
  apiErrorResponse,
  zodIssuesToApiIssues,
} from "../../../../../lib/api/responses";
import { updateIntegrationWorkflowApproval } from "../../../../../lib/integrations/event-log";

export const dynamic = "force-dynamic";

const approvalUpdateSchema = z.object({
  status: z.enum([
    "approved",
    "rejected",
    "needs_more_information",
    "resolved_internal",
  ]),
  notes: z.string().trim().max(500).optional(),
  responsibleRole: z.string().trim().max(160).optional(),
  internalPriority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  reason: z.string().trim().max(300).optional(),
  actorLabel: z.string().trim().max(120).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isSafeWorkflowId(id)) {
    return apiErrorResponse({
      code: "INVALID_APPROVAL_ID",
      message: "Invalid approval id.",
      status: 400,
    });
  }

  try {
    const body = approvalUpdateSchema.parse(await request.json());
    const workflow = await updateIntegrationWorkflowApproval({
      workflowId: id,
      ...body,
    });

    if (!workflow) {
      return apiErrorResponse({
        code: "APPROVAL_NOT_FOUND",
        message: "Approval record was not found.",
        status: 404,
      });
    }

    return Response.json({
      workflow,
      externalExecution: "unavailable",
      message: "Internal approval state updated. No external action was executed.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse({
        code: "INVALID_APPROVAL_UPDATE",
        message: "Invalid approval update.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }

    return apiErrorResponse({
      code: "APPROVAL_UPDATE_FAILED",
      message: "Approval update failed.",
      status: 500,
    });
  }
}

function isSafeWorkflowId(id: string) {
  return /^[a-z0-9:_-]{1,240}$/i.test(id);
}
