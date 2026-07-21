import { ZodError } from "zod";

import { apiErrorResponse, zodIssuesToApiIssues } from "../../../../lib/api/responses";
import { normalizeTelegramUpdate } from "../../../../lib/integrations/adapters/telegram";
import { hasSeenIntegrationEvent } from "../../../../lib/integrations/dedupe";
import {
  addIntegrationEventLogEntry,
  recordIntegrationAnalysis,
} from "../../../../lib/integrations/event-log";
import { processNormalizedMessage } from "../../../../lib/integrations/processor";
import { verifyTelegramSecret } from "../../../../lib/integrations/security";

export async function POST(request: Request) {
  const secretResult = verifyTelegramSecret({
    configuredSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    receivedSecret: request.headers.get("x-telegram-bot-api-secret-token"),
  });

  if (!secretResult.valid) {
    return apiErrorResponse({
      code: "INVALID_TELEGRAM_SECRET",
      message: "Telegram webhook secret is invalid.",
      status: 401,
    });
  }

  try {
    const rawBody = await request.text();
    if (rawBody.length > 1_000_000) {
      return apiErrorResponse({
        code: "PAYLOAD_TOO_LARGE",
        message: "Telegram webhook payload is too large.",
        status: 413,
      });
    }

    const normalized = normalizeTelegramUpdate(JSON.parse(rawBody));

    if (!normalized) {
      await addIntegrationEventLogEntry({
        provider: "telegram",
        eventType: "unsupported_update",
        processingStatus: "ignored",
        analysisStatus: "not_started",
      });
      return Response.json({ received: true, processed: false });
    }

    if (hasSeenIntegrationEvent(normalized.id)) {
      await addIntegrationEventLogEntry({
        provider: normalized.source,
        eventType: "message",
        processingStatus: "ignored",
        analysisStatus: "not_started",
        externalId: normalized.externalId,
      });
      return Response.json({ received: true, processed: false, duplicate: true });
    }

    await addIntegrationEventLogEntry({
      provider: normalized.source,
      eventType: "message",
      processingStatus: "received",
      analysisStatus: "not_started",
      externalId: normalized.externalId,
    });
    const result = await processNormalizedMessage(normalized);
    await recordIntegrationAnalysis(result);
    await addIntegrationEventLogEntry({
      provider: "telegram",
      eventType: "message",
      processingStatus: "processed",
      analysisStatus: "completed",
      externalId: normalized.externalId,
    });

    return Response.json({
      received: true,
      processed: true,
      riskLevel: result.riskLevel,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse({
        code: "INVALID_TELEGRAM_PAYLOAD",
        message: "Invalid Telegram webhook payload.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }

    return apiErrorResponse({
      code: "TELEGRAM_WEBHOOK_FAILED",
      message: "Telegram webhook processing failed.",
      status: 500,
    });
  }
}
