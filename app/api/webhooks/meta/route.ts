import { ZodError } from "zod";

import { apiErrorResponse, zodIssuesToApiIssues } from "../../../../lib/api/responses";
import { inspectMetaWebhookPayload } from "../../../../lib/integrations/adapters/meta";
import { hasSeenIntegrationEvent } from "../../../../lib/integrations/dedupe";
import type { NormalizedCommunicationMessage } from "../../../../lib/integrations/normalized";
import {
  addIntegrationEventLogEntry,
  type CreateIntegrationEventLogEntry,
  recordIntegrationAnalysis,
} from "../../../../lib/integrations/event-log";
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
    await recordMetaDiagnostic({
      provider: "meta",
      eventType: "meta_verification_success",
      processingStatus: "processed",
      analysisStatus: "not_started",
    });
    return new Response(challenge, { status: 200 });
  }

  await recordMetaDiagnostic({
    provider: "meta",
    eventType: "meta_verification_failed",
    processingStatus: "error",
    analysisStatus: "not_started",
    errorSummary: "Meta webhook verification failed.",
  });
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
    await recordMetaDiagnostic({
      provider: "meta",
      eventType: "meta_signature_failed",
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
    const { messages, diagnostics } = inspectMetaWebhookPayload(JSON.parse(rawBody));
    const processed = [];

    for (const diagnostic of diagnostics) {
      await recordMetaDiagnostic({
        provider: diagnostic.provider,
        eventType: diagnostic.eventType,
        processingStatus:
          diagnostic.eventType === "meta_payload_unsupported" ||
          diagnostic.eventType === "meta_comment_unsupported" ||
          diagnostic.eventType === "facebook_comment_removed"
            ? "ignored"
            : "received",
        analysisStatus: "not_started",
        externalId: diagnostic.externalId,
        errorSummary: diagnostic.reason,
      });
    }

    for (const message of messages) {
      if (hasSeenIntegrationEvent(message.id)) {
        await recordMetaDiagnostic({
          provider: message.source,
          eventType: isMetaComment(message)
            ? "meta_comment_unsupported"
            : "meta_payload_unsupported",
          processingStatus: "ignored",
          analysisStatus: "not_started",
          externalId: message.externalId,
          errorSummary: "duplicate_event",
        });
        continue;
      }

      await recordMetaDiagnostic({
        provider: message.source,
        eventType: receivedEventTypeFor(message),
        processingStatus: "received",
        analysisStatus: "not_started",
        externalId: message.externalId,
      });
      await recordMetaDiagnostic({
        provider: message.source,
        eventType: "meta_analysis_started",
        processingStatus: "received",
        analysisStatus: "not_started",
        externalId: message.externalId,
      });

      try {
        const result = await processNormalizedMessage(message);
        await recordMetaWorkflow(result);
        await recordMetaDiagnostic({
          provider: message.source,
          eventType: "meta_analysis_completed",
          processingStatus: "processed",
          analysisStatus: "completed",
          externalId: message.externalId,
        });
        await recordMetaDiagnostic({
          provider: message.source,
          eventType: "meta_suggested",
          processingStatus: "processed",
          analysisStatus: "completed",
          externalId: message.externalId,
        });
        processed.push({ id: message.id, riskLevel: result.riskLevel });
      } catch {
        await recordMetaDiagnostic({
          provider: message.source,
          eventType: isMetaComment(message)
            ? "meta_comment_analysis_failed"
            : "meta_failed",
          processingStatus: "error",
          analysisStatus: "failed",
          externalId: message.externalId,
          errorSummary: "Meta message analysis failed.",
        });
      }
    }

    return Response.json({ received: true, processed });
  } catch (error) {
    await recordMetaDiagnostic({
      provider: "meta",
      eventType:
        error instanceof ZodError
          ? "meta_comment_normalization_failed"
          : "meta_payload_unsupported",
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

async function recordMetaDiagnostic(entry: CreateIntegrationEventLogEntry) {
  try {
    await addIntegrationEventLogEntry(entry);
  } catch {
    const isCommentEvent =
      entry.eventType.includes("comment") || entry.eventType.includes("mention");
    console.error(
      isCommentEvent
        ? "meta_comment_persistence_failed"
        : "meta_event_persistence_failed",
    );
  }
}

async function recordMetaWorkflow(
  result: Awaited<ReturnType<typeof processNormalizedMessage>>,
) {
  try {
    await recordIntegrationAnalysis(result);
  } catch {
    await recordMetaDiagnostic({
      provider: result.message.source,
      eventType: isMetaComment(result.message)
        ? "meta_comment_persistence_failed"
        : "meta_failed",
      processingStatus: "error",
      analysisStatus: "failed",
      externalId: result.message.externalId,
      errorSummary: "Meta workflow persistence failed.",
    });
  }
}

function isMetaComment(message: NormalizedCommunicationMessage) {
  return (
    message.channelId === "facebook_comment" ||
    message.channelId === "instagram_comment" ||
    message.metadata?.kind === "comment" ||
    message.metadata?.kind === "mention"
  );
}

function receivedEventTypeFor(message: NormalizedCommunicationMessage) {
  const verb =
    typeof message.metadata?.verb === "string"
      ? message.metadata.verb.toLowerCase()
      : undefined;

  if (message.channelId === "facebook_comment") {
    return verb === "edited" || verb === "edit"
      ? "facebook_comment_edited"
      : "facebook_comment_received";
  }

  if (message.channelId === "instagram_comment") {
    return message.metadata?.kind === "mention"
      ? "instagram_mention_received"
      : "instagram_comment_received";
  }

  return "meta_message_received";
}
