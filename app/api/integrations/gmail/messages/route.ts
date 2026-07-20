import { ZodError, z } from "zod";

import { apiErrorResponse, zodIssuesToApiIssues } from "../../../../../lib/api/responses";
import {
  listRecentGmailMessages,
  normalizeGmailSummaryForProcessing,
} from "../../../../../lib/integrations/google/gmail-service";
import { processNormalizedMessage } from "../../../../../lib/integrations/processor";

const requestSchema = z.object({
  messageId: z.string().trim().min(1).optional(),
});

export async function GET() {
  try {
    return Response.json({
      messages: await listRecentGmailMessages(5),
    });
  } catch (error) {
    return apiErrorResponse({
      code: "GMAIL_READ_FAILED",
      message: getReconnectMessage(error),
      status: 503,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const messages = await listRecentGmailMessages(5);
    const selected = body.messageId
      ? messages.find((message) => message.id === body.messageId)
      : messages[0];

    if (!selected) {
      return apiErrorResponse({
        code: "GMAIL_MESSAGE_NOT_FOUND",
        message: "Gmail message was not found in the recent inbox window.",
        status: 404,
      });
    }

    const normalized = normalizeGmailSummaryForProcessing(selected);
    const result = await processNormalizedMessage(normalized);
    return Response.json({ normalized, result });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse({
        code: "INVALID_REQUEST",
        message: "Invalid Gmail analysis request.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }

    return apiErrorResponse({
      code: "GMAIL_ANALYSIS_FAILED",
      message: getReconnectMessage(error),
      status: 503,
    });
  }
}

function getReconnectMessage(error: unknown) {
  return error instanceof Error &&
    (error.message === "not_connected" ||
      error.message === "reconnect_required")
    ? "Gmail is not connected or requires reconnect."
    : "Gmail inbox read failed.";
}
