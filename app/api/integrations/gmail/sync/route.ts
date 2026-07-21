import { ZodError, z } from "zod";

import {
  apiErrorResponse,
  zodIssuesToApiIssues,
} from "../../../../../lib/api/responses";
import { syncRecentGmailMessages } from "../../../../../lib/integrations/google/gmail-service";

const syncRequestSchema = z.object({
  maxResults: z.number().int().min(1).max(10).optional(),
  q: z.string().trim().max(120).optional(),
  unreadOnly: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = syncRequestSchema.parse(await request.json().catch(() => ({})));
    const result = await syncRecentGmailMessages({
      maxResults: body.maxResults,
      query: body.q,
      unreadOnly: body.unreadOnly,
    });

    return Response.json({
      imported: result.imported,
      skipped: result.skipped,
      failed: result.failed,
      query: result.query,
      maxResults: result.maxResults,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse({
        code: "INVALID_GMAIL_SYNC_REQUEST",
        message: "Invalid Gmail sync request.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }

    const reason = error instanceof Error ? error.message : "gmail_sync_failed";
    if (reason === "not_connected" || reason === "reconnect_required") {
      return apiErrorResponse({
        code: "GMAIL_RECONNECT_REQUIRED",
        message: "Gmail is not connected or requires reconnect.",
        status: 401,
      });
    }

    if (reason === "gmail_list_failed") {
      return apiErrorResponse({
        code: "GMAIL_LIST_FAILED",
        message: "Gmail message listing failed.",
        status: 502,
      });
    }

    return apiErrorResponse({
      code: "GMAIL_SYNC_FAILED",
      message: "Gmail sync failed.",
      status: 500,
    });
  }
}
