import { ZodError } from "zod";

import { apiErrorResponse, zodIssuesToApiIssues } from "../../../../lib/api/responses";
import { normalizeMetaWebhookPayload } from "../../../../lib/integrations/adapters/meta";
import { hasSeenIntegrationEvent } from "../../../../lib/integrations/dedupe";
import { addIntegrationEventLogEntry } from "../../../../lib/integrations/event-log";
import { processNormalizedMessage } from "../../../../lib/integrations/processor";
import { verifyMetaSignature } from "../../../../lib/integrations/security";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.META_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, { status: 200 });
  }

  return apiErrorResponse({
    code: "META_VERIFICATION_FAILED",
    message: "Meta webhook verification failed.",
    status: 403,
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (rawBody.length > 1_000_000) {
    return apiErrorResponse({
      code: "PAYLOAD_TOO_LARGE",
      message: "Meta webhook payload is too large.",
      status: 413,
    });
  }

  const signature = verifyMetaSignature({
    appSecret: process.env.META_APP_SECRET,
    rawBody,
    signatureHeader: request.headers.get("x-hub-signature-256"),
  });

  if (!signature.valid) {
    addIntegrationEventLogEntry({
      provider: "meta",
      eventType: "webhook_signature",
      processingStatus: "error",
      analysisStatus: "not_started",
      errorSummary: "Invalid Meta webhook signature.",
    });
    return apiErrorResponse({
      code: "INVALID_SIGNATURE",
      message: "Invalid Meta webhook signature.",
      status: 401,
    });
  }

  try {
    const messages = normalizeMetaWebhookPayload(JSON.parse(rawBody));
    const processed = [];

    for (const message of messages) {
      if (hasSeenIntegrationEvent(message.id)) {
        addIntegrationEventLogEntry({
          provider: message.source,
          eventType: "message",
          processingStatus: "ignored",
          analysisStatus: "not_started",
          externalId: message.externalId,
        });
        continue;
      }

      const result = await processNormalizedMessage(message);
      addIntegrationEventLogEntry({
        provider: message.source,
        eventType: "message",
        processingStatus: "processed",
        analysisStatus: "completed",
        externalId: message.externalId,
      });
      processed.push({ id: message.id, riskLevel: result.riskLevel });
    }

    return Response.json({ received: true, processed });
  } catch (error) {
    addIntegrationEventLogEntry({
      provider: "meta",
      eventType: "webhook",
      processingStatus: "error",
      analysisStatus: "failed",
      errorSummary: "Meta webhook processing failed.",
    });

    if (error instanceof ZodError) {
      return apiErrorResponse({
        code: "INVALID_META_PAYLOAD",
        message: "Invalid Meta webhook payload.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }

    return apiErrorResponse({
      code: "META_WEBHOOK_FAILED",
      message: "Meta webhook processing failed.",
      status: 400,
    });
  }
}
