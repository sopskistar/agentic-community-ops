import {
  listIntegrationEventLogEntries,
  type IntegrationEventLogEntry,
} from "../event-log";

export type MetaProviderStatus = {
  status:
    | "not_configured"
    | "configuration_detected"
    | "webhook_verified"
    | "receiving_events"
    | "no_event_received_yet"
    | "error";
  appCredentialsDetected: boolean;
  verifyTokenDetected: boolean;
  pageAccessTokenDetected: boolean;
  webhookRouteReachable: true;
  latestVerificationTime?: string;
  latestMetaEventReceived?: string;
  latestProviderEventReceived?: string;
  messageCount: number;
  commentCount: number;
  repositoryAvailable: boolean;
  outboundExecutionAvailable: false;
};

export async function getMetaProviderStatus(
  provider: "facebook" | "instagram",
): Promise<MetaProviderStatus> {
  const appCredentialsDetected = Boolean(
    process.env.META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim(),
  );
  const verifyTokenDetected = Boolean(process.env.META_VERIFY_TOKEN?.trim());
  const pageAccessTokenDetected = Boolean(
    process.env.META_PAGE_ACCESS_TOKEN?.trim(),
  );

  let events: IntegrationEventLogEntry[];
  try {
    events = await listIntegrationEventLogEntries(100);
  } catch {
    return {
      status: "error",
      appCredentialsDetected,
      verifyTokenDetected,
      pageAccessTokenDetected,
      webhookRouteReachable: true,
      messageCount: 0,
      commentCount: 0,
      repositoryAvailable: false,
      outboundExecutionAvailable: false,
    };
  }

  const latestVerification = events.find(
    (event) => event.eventType === "meta_verification_success",
  );
  const latestMetaEvent = events.find((event) =>
    event.eventType.startsWith("meta_"),
  );
  const latestProviderEvent = events.find(
    (event) =>
      event.provider === provider &&
      (event.eventType === "meta_message_received" ||
        event.eventType === "meta_comment_received"),
  );
  const latestRelevantProviderEvent = events.find(
    (event) =>
      event.provider === provider ||
      event.eventType === "meta_verification_success" ||
      event.eventType === "meta_verification_failed" ||
      event.eventType === "meta_signature_failed" ||
      event.eventType === "meta_normalization_failed",
  );

  if (!appCredentialsDetected && !verifyTokenDetected && !pageAccessTokenDetected) {
    return baseStatus("not_configured");
  }

  if (latestRelevantProviderEvent?.processingStatus === "error") {
    return baseStatus("error");
  }

  if (latestProviderEvent) {
    return baseStatus("receiving_events");
  }

  if (latestVerification) {
    return baseStatus("webhook_verified");
  }

  if (verifyTokenDetected) {
    return baseStatus("no_event_received_yet");
  }

  return baseStatus("configuration_detected");

  function baseStatus(status: MetaProviderStatus["status"]): MetaProviderStatus {
    return {
      status,
      appCredentialsDetected,
      verifyTokenDetected,
      pageAccessTokenDetected,
      webhookRouteReachable: true,
      latestVerificationTime: latestVerification?.timestamp,
      latestMetaEventReceived: latestMetaEvent?.timestamp,
      latestProviderEventReceived: latestProviderEvent?.timestamp,
      messageCount: events.filter(
        (event) =>
          event.provider === provider &&
          event.eventType === "meta_message_received",
      ).length,
      commentCount: events.filter(
        (event) =>
          event.provider === provider &&
          event.eventType === "meta_comment_received",
      ).length,
      repositoryAvailable: true,
      outboundExecutionAvailable: false,
    };
  }
}
