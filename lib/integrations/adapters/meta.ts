import { createHash } from "crypto";
import { z } from "zod";

import {
  createIntegrationMessageId,
  type CommunicationSource,
  type NormalizedCommunicationMessage,
} from "../normalized";

type MetaChannel =
  | "messenger"
  | "instagram"
  | "facebook_comment"
  | "instagram_comment";

type MetaNormalizedEventKind =
  | "message"
  | "comment"
  | "reaction"
  | "postback"
  | "mention";

const metaWebhookSchema = z
  .object({
    object: z.string(),
    entry: z.array(
      z
        .object({
          id: z.string().optional(),
          time: z.number().optional(),
          messaging: z.array(z.record(z.string(), z.unknown())).optional(),
          changes: z
            .array(
              z
                .object({
                  field: z.string().optional(),
                  value: z.record(z.string(), z.unknown()).optional(),
                })
                .passthrough(),
            )
            .optional(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export function normalizeMetaWebhookPayload(input: unknown) {
  return inspectMetaWebhookPayload(input).messages;
}

export type MetaWebhookDiagnostic = {
  provider: "meta" | "facebook" | "instagram";
  eventType:
    | "meta_payload_unsupported"
    | "meta_comment_unsupported"
    | "meta_message_received"
    | "meta_comment_received"
    | "facebook_comment_received"
    | "facebook_comment_edited"
    | "facebook_comment_removed"
    | "instagram_comment_received"
    | "instagram_mention_received";
  externalId?: string;
  reason?: string;
};

export function inspectMetaWebhookPayload(input: unknown) {
  const payload = metaWebhookSchema.parse(input);
  const source = detectMetaSource(payload.object);
  const messages: NormalizedCommunicationMessage[] = [];
  const diagnostics: MetaWebhookDiagnostic[] = [];

  for (const entry of payload.entry) {
    const entryMessages = entry.messaging ?? [];
    const entryChanges = entry.changes ?? [];

    if (!entryMessages.length && !entryChanges.length) {
      diagnostics.push({
        provider: source,
        eventType: "meta_payload_unsupported",
        reason: "missing_messaging_and_changes",
      });
    }

    for (const event of entryMessages) {
      const normalized = normalizeMessagingEvent({
        event,
        entryId: entry.id,
        entryTime: entry.time,
        source,
        object: payload.object,
      });

      if (!normalized.message) {
        diagnostics.push({
          provider: source,
          eventType: "meta_payload_unsupported",
          externalId: normalized.externalId,
          reason: normalized.reason,
        });
        continue;
      }

      messages.push(normalized.message);
      diagnostics.push({
        provider: source,
        eventType: "meta_message_received",
        externalId: normalized.message.externalId,
      });
    }

    for (const change of entryChanges) {
      const normalized = normalizeChangeEvent({
        change,
        entryId: entry.id,
        entryTime: entry.time,
        source,
        object: payload.object,
      });

      if (!normalized.message) {
        diagnostics.push({
          provider: source,
          eventType: normalized.commentRelated
            ? normalized.eventType ?? "meta_comment_unsupported"
            : "meta_payload_unsupported",
          externalId: normalized.externalId,
          reason: normalized.reason,
        });
        continue;
      }

      messages.push(normalized.message);
      diagnostics.push({
        provider: source,
        eventType: receivedEventTypeFor(normalized.message),
        externalId: normalized.message.externalId,
      });
    }
  }

  return { messages, diagnostics };
}

function normalizeMessagingEvent({
  event,
  entryId,
  entryTime,
  source,
  object,
}: {
  event: Record<string, unknown>;
  entryId?: string;
  entryTime?: number;
  source: Extract<CommunicationSource, "facebook" | "instagram">;
  object: string;
}): NormalizedMetaEvent {
  const sender = asRecord(event.sender);
  const recipient = asRecord(event.recipient);
  const timestamp = typeof event.timestamp === "number" ? event.timestamp : entryTime;
  const message = asRecord(event.message);
  const postback = asRecord(event.postback);
  const reaction = asRecord(event.reaction);

  if (message && message.is_echo === true) {
    return { reason: "message_echo", externalId: hashOptional(message.mid) };
  }

  if (message) {
    const text = sanitizeMetaText(asString(message.text));
    if (!text) {
      return {
        reason: message.is_unsupported ? "unsupported_message" : "missing_text",
        externalId: hashOptional(message.mid),
      };
    }

    return {
      kind: "message",
      message: createMetaMessage({
        source,
        channel: source === "instagram" ? "instagram" : "messenger",
        kind: "message",
        rawExternalId:
          asString(message.mid) ??
          `${entryId ?? "entry"}:${asString(sender?.id) ?? "sender"}:${timestamp ?? Date.now()}`,
        rawConversationId: asString(sender?.id) ?? asString(recipient?.id) ?? entryId,
        rawSenderId: asString(sender?.id),
        rawRecipientId: asString(recipient?.id),
        text,
        timestamp,
        entryId,
        object,
      }),
    };
  }

  if (postback) {
    const payload = sanitizeMetaText(asString(postback.payload), 240);
    const title = sanitizeMetaText(asString(postback.title), 240);
    const text = [title, payload].filter(Boolean).join(": ");
    if (!text) {
      return { reason: "missing_postback_payload" };
    }

    return {
      kind: "postback",
      message: createMetaMessage({
        source,
        channel: source === "instagram" ? "instagram" : "messenger",
        kind: "postback",
        rawExternalId:
          asString(postback.mid) ??
          `${entryId ?? "entry"}:${asString(sender?.id) ?? "sender"}:postback:${timestamp ?? Date.now()}`,
        rawConversationId: asString(sender?.id) ?? asString(recipient?.id) ?? entryId,
        rawSenderId: asString(sender?.id),
        rawRecipientId: asString(recipient?.id),
        text,
        timestamp,
        entryId,
        object,
      }),
    };
  }

  if (reaction) {
    const action = sanitizeMetaText(asString(reaction.action), 80);
    const emoji = sanitizeMetaText(asString(reaction.emoji), 20);
    const text = `Message reaction${action ? ` ${action}` : ""}${emoji ? ` ${emoji}` : ""}`.trim();
    return {
      kind: "reaction",
      message: createMetaMessage({
        source,
        channel: source === "instagram" ? "instagram" : "messenger",
        kind: "reaction",
        rawExternalId:
          asString(reaction.mid) ??
          `${entryId ?? "entry"}:${asString(sender?.id) ?? "sender"}:reaction:${timestamp ?? Date.now()}`,
        rawConversationId: asString(sender?.id) ?? asString(recipient?.id) ?? entryId,
        rawSenderId: asString(sender?.id),
        rawRecipientId: asString(recipient?.id),
        text,
        timestamp,
        entryId,
        object,
      }),
    };
  }

  return { reason: "unsupported_messaging_event" };
}

function normalizeChangeEvent({
  change,
  entryId,
  entryTime,
  source,
  object,
}: {
  change: { field?: string; value?: Record<string, unknown> };
  entryId?: string;
  entryTime?: number;
  source: Extract<CommunicationSource, "facebook" | "instagram">;
  object: string;
}): NormalizedMetaEvent {
  const field = change.field ?? "unknown";
  const value = change.value ?? {};
  const item = asString(value.item);
  const verb = asString(value.verb);
  const kind = detectChangeKind(field, item);
  const commentRelated = isCommentRelatedChange(source, field, item, kind);

  if (!kind) {
    return {
      reason: `unsupported_change:${field}${item ? `:${item}` : ""}`,
      externalId: hashOptional(asString(value.id) ?? asString(value.comment_id)),
      commentRelated,
    };
  }

  if (kind === "comment" && isRemovedChange(verb)) {
    return {
      reason: "comment_removed",
      externalId: hashOptional(asString(value.comment_id) ?? asString(value.id)),
      eventType:
        source === "instagram"
          ? "meta_comment_unsupported"
          : "facebook_comment_removed",
      commentRelated: true,
    };
  }

  const rawExternalId =
    asString(value.comment_id) ??
    asString(value.id) ??
    asString(value.message_id) ??
    `${entryId ?? "entry"}:${field}:${asString(value.created_time) ?? entryTime ?? Date.now()}`;
  const rawConversationId =
    asString(value.post_id) ??
    asString(value.media_id) ??
    asString(value.parent_id) ??
    entryId;
  const rawSenderId =
    asString(value.sender_id) ??
    asString(asRecord(value.from)?.id) ??
    asString(value.user_id);
  const fallbackText =
    kind === "reaction" || kind === "mention"
      ? `${kind === "reaction" ? "Reaction" : "Mention"}${verb ? `: ${verb}` : ""}`
      : undefined;
  const text = sanitizeMetaText(
    asString(value.message) ??
      asString(value.text) ??
      asString(value.caption) ??
      fallbackText,
  );

  if (!text) {
    return {
      reason: "missing_change_text",
      externalId: hashOptional(rawExternalId),
      commentRelated,
      eventType: commentRelated ? "meta_comment_unsupported" : undefined,
    };
  }

  return {
    kind,
    message: createMetaMessage({
      source,
      channel: source === "instagram" ? "instagram_comment" : "facebook_comment",
      kind,
      rawExternalId,
      rawConversationId,
      rawSenderId,
      rawRecipientId: entryId,
      text,
      timestamp: normalizeChangeTimestamp(value, entryTime),
      entryId,
      object,
      field,
      verb,
      item,
    }),
  };
}

function createMetaMessage({
  source,
  channel,
  kind,
  rawExternalId,
  rawConversationId,
  rawSenderId,
  rawRecipientId,
  text,
  timestamp,
  entryId,
  object,
  field,
  verb,
  item,
}: {
  source: Extract<CommunicationSource, "facebook" | "instagram">;
  channel: MetaChannel;
  kind: MetaNormalizedEventKind;
  rawExternalId: string;
  rawConversationId?: string;
  rawSenderId?: string;
  rawRecipientId?: string;
  text: string;
  timestamp?: number | string;
  entryId?: string;
  object: string;
  field?: string;
  verb?: string;
  item?: string;
}): NormalizedCommunicationMessage {
  const externalId = hashMetaIdentifier(rawExternalId);
  const conversationId = rawConversationId
    ? hashMetaIdentifier(rawConversationId)
    : undefined;
  const senderId = rawSenderId ? hashMetaIdentifier(rawSenderId) : undefined;
  const recipientId = rawRecipientId ? hashMetaIdentifier(rawRecipientId) : undefined;

  return {
    id: createIntegrationMessageId(source, externalId),
    externalId,
    source,
    channelId: channel,
    conversationId,
    senderId,
    text,
    timestamp: normalizeTimestamp(timestamp),
    metadata: {
      provider: source,
      channel,
      kind,
      object,
      field,
      verb,
      item,
      recipientId,
      entryId: entryId ? hashMetaIdentifier(entryId) : undefined,
    },
  };
}

function detectChangeKind(
  field: string,
  item: string | undefined,
): MetaNormalizedEventKind | null {
  const normalizedField = field.toLowerCase();
  const normalizedItem = item?.toLowerCase();

  if (
    normalizedField.includes("comments") ||
    normalizedField === "feed" && normalizedItem === "comment"
  ) {
    return "comment";
  }

  if (normalizedField.includes("mention")) {
    return "mention";
  }

  if (normalizedField.includes("reaction") || normalizedItem === "reaction") {
    return "reaction";
  }

  return null;
}

function receivedEventTypeFor(message: NormalizedCommunicationMessage) {
  const channel = message.metadata?.channel;
  const kind = message.metadata?.kind;
  const verb = typeof message.metadata?.verb === "string"
    ? message.metadata.verb.toLowerCase()
    : undefined;

  if (channel === "facebook_comment") {
    return verb === "edited" || verb === "edit"
      ? "facebook_comment_edited"
      : "facebook_comment_received";
  }

  if (channel === "instagram_comment") {
    return kind === "mention"
      ? "instagram_mention_received"
      : "instagram_comment_received";
  }

  return kind === "comment" || kind === "mention"
    ? "meta_comment_received"
    : "meta_message_received";
}

function isCommentRelatedChange(
  source: Extract<CommunicationSource, "facebook" | "instagram">,
  field: string,
  item: string | undefined,
  kind: MetaNormalizedEventKind | null,
) {
  const normalizedField = field.toLowerCase();
  const normalizedItem = item?.toLowerCase();
  return (
    kind === "comment" ||
    kind === "mention" ||
    normalizedField.includes("comment") ||
    normalizedField.includes("mention") ||
    (source === "facebook" &&
      normalizedField === "feed" &&
      normalizedItem === "comment")
  );
}

function isRemovedChange(verb: string | undefined) {
  const normalizedVerb = verb?.toLowerCase();
  return normalizedVerb === "remove" || normalizedVerb === "delete";
}

function normalizeChangeTimestamp(
  value: Record<string, unknown>,
  fallback?: number,
) {
  return (
    asString(value.created_time) ??
    asString(value.timestamp) ??
    (typeof fallback === "number" ? fallback : undefined)
  );
}

function hashMetaIdentifier(value: string) {
  return createHash("sha256").update(`meta:${value}`).digest("hex").slice(0, 32);
}

function hashOptional(value: unknown) {
  return typeof value === "string" ? hashMetaIdentifier(value) : undefined;
}

function sanitizeMetaText(value: string | undefined, maxLength = 1_000) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeTimestamp(value: number | string | undefined) {
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return new Date().toISOString();
}

function detectMetaSource(object: string): Extract<
  CommunicationSource,
  "facebook" | "instagram"
> {
  return object.toLowerCase() === "instagram" ? "instagram" : "facebook";
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

type NormalizedMetaEvent =
  | {
      kind: MetaNormalizedEventKind;
      message: NormalizedCommunicationMessage;
      reason?: never;
      externalId?: never;
      eventType?: never;
      commentRelated?: never;
    }
  | {
      kind?: never;
      message?: never;
      reason: string;
      externalId?: string;
      eventType?: MetaWebhookDiagnostic["eventType"];
      commentRelated?: boolean;
    };
