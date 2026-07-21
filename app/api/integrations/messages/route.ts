import { ZodError } from "zod";

import {
  apiErrorResponse,
  zodIssuesToApiIssues,
} from "../../../../lib/api/responses";
import {
  normalizedCommunicationMessageSchema,
} from "../../../../lib/integrations/normalized";
import {
  addIntegrationEventLogEntry,
  recordIntegrationAnalysis,
} from "../../../../lib/integrations/event-log";
import { processNormalizedMessage } from "../../../../lib/integrations/processor";
import { verifyTelegramSecret } from "../../../../lib/integrations/security";

export async function POST(request: Request) {
  if (!process.env.INTERNAL_INTEGRATION_SECRET) {
    return apiErrorResponse({
      code: "INTEGRATION_SECRET_NOT_CONFIGURED",
      message: "Integration processing endpoint is not configured.",
      status: 503,
    });
  }

  const authResult = verifyTelegramSecret({
    configuredSecret: process.env.INTERNAL_INTEGRATION_SECRET,
    receivedSecret: request.headers.get("x-agenticops-integration-secret"),
  });

  if (!authResult.valid) {
    return apiErrorResponse({
      code: "UNAUTHORIZED",
      message: "Integration request is not authorized.",
      status: 401,
    });
  }

  try {
    const normalized = normalizedCommunicationMessageSchema.parse(
      await request.json(),
    );
    await addIntegrationEventLogEntry({
      provider: normalized.source,
      eventType: "worker_message",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: normalized.externalId,
    });
    const result = await processNormalizedMessage(normalized);
    await recordIntegrationAnalysis(result);
    await addIntegrationEventLogEntry({
      provider: normalized.source,
      eventType: "worker_message",
      processingStatus: "processed",
      analysisStatus: "completed",
      externalId: normalized.externalId,
    });
    return Response.json({ result });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse({
        code: "INVALID_NORMALIZED_MESSAGE",
        message: "Invalid normalized message.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }

    return apiErrorResponse({
      code: "INTEGRATION_PROCESSING_FAILED",
      message: "Integration message processing failed.",
      status: 500,
    });
  }
}
