import { ZodError } from "zod";
import { z } from "zod";

import {
  apiErrorResponse,
  zodIssuesToApiIssues,
} from "../../../../lib/api/responses";
import { hasSeenIntegrationEvent } from "../../../../lib/integrations/dedupe";
import {
  normalizedCommunicationMessageSchema,
} from "../../../../lib/integrations/normalized";
import {
  addIntegrationEventLogEntry,
  getIntegrationWorkflowRecord,
  recordIntegrationAnalysis,
} from "../../../../lib/integrations/event-log";
import { processNormalizedMessage } from "../../../../lib/integrations/processor";
import { verifyTelegramSecret } from "../../../../lib/integrations/security";

const maxRequestBodyLength = 100_000;
const heartbeatSchema = z.object({
  type: z.literal("heartbeat"),
  provider: z.literal("discord"),
});
const strictNormalizedMessageSchema = normalizedCommunicationMessageSchema.strict();

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
    const rawBody = await request.text();
    if (rawBody.length > maxRequestBodyLength) {
      return apiErrorResponse({
        code: "PAYLOAD_TOO_LARGE",
        message: "Integration message payload is too large.",
        status: 413,
      });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody) as unknown;
    } catch {
      return apiErrorResponse({
        code: "INVALID_JSON",
        message: "Integration message payload must be valid JSON.",
        status: 400,
      });
    }
    const heartbeat = heartbeatSchema.safeParse(payload);
    if (heartbeat.success) {
      await addIntegrationEventLogEntry({
        provider: "discord",
        eventType: "discord_worker_heartbeat",
        processingStatus: "processed",
        analysisStatus: "not_started",
      });
      return Response.json({ received: true, type: "heartbeat" });
    }

    const normalized = strictNormalizedMessageSchema.parse(payload);
    if (normalized.source === "discord") {
      return await processDiscordMessage(normalized);
    }

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

async function processDiscordMessage(
  normalized: z.infer<typeof normalizedCommunicationMessageSchema>,
) {
  const existingWorkflow = await getIntegrationWorkflowRecord(normalized.id);
  if (existingWorkflow || hasSeenIntegrationEvent(normalized.id)) {
    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_message_duplicate",
      processingStatus: "ignored",
      analysisStatus: "not_started",
      externalId: normalized.externalId,
    });
    return Response.json({ received: true, duplicate: true });
  }

  await addIntegrationEventLogEntry({
    provider: "discord",
    eventType: "discord_message_received",
    processingStatus: "received",
    analysisStatus: "not_started",
    externalId: normalized.externalId,
  });
  await addIntegrationEventLogEntry({
    provider: "discord",
    eventType: "discord_analysis_started",
    processingStatus: "received",
    analysisStatus: "not_started",
    externalId: normalized.externalId,
  });

  try {
    const result = await processNormalizedMessage(normalized);
    await recordIntegrationAnalysis(result);
    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_analysis_completed",
      processingStatus: "processed",
      analysisStatus: "completed",
      externalId: normalized.externalId,
    });
    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_suggested",
      processingStatus: "processed",
      analysisStatus: "completed",
      externalId: normalized.externalId,
    });
    return Response.json({ result });
  } catch {
    await addIntegrationEventLogEntry({
      provider: "discord",
      eventType: "discord_analysis_failed",
      processingStatus: "error",
      analysisStatus: "failed",
      externalId: normalized.externalId,
      errorSummary: "Discord message analysis failed.",
    });
    return apiErrorResponse({
      code: "INTEGRATION_PROCESSING_FAILED",
      message: "Integration message processing failed.",
      status: 500,
    });
  }
}
