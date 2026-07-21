import {
  listIntegrationEventLogEntries,
  type IntegrationEventLogEntry,
} from "../event-log";

export type DiscordWorkerStatus = {
  status:
    | "not_configured"
    | "configuration_detected"
    | "worker_never_seen"
    | "worker_recently_active"
    | "worker_stale"
    | "error";
  botTokenDetected: boolean;
  applicationIdDetected: boolean;
  internalSecretDetected: boolean;
  latestHeartbeat?: string;
  latestMessageReceived?: string;
  latestProcessingSuccess?: string;
  messageCount: number;
  repositoryAvailable: boolean;
  outboundExecutionAvailable: false;
};

const staleAfterMs = 3 * 60 * 1000;

export async function getDiscordWorkerStatus(
  now = new Date(),
): Promise<DiscordWorkerStatus> {
  const botTokenDetected = Boolean(process.env.DISCORD_BOT_TOKEN?.trim());
  const applicationIdDetected = Boolean(
    process.env.DISCORD_APPLICATION_ID?.trim(),
  );
  const internalSecretDetected = Boolean(
    process.env.INTERNAL_INTEGRATION_SECRET?.trim(),
  );

  let events: IntegrationEventLogEntry[];
  try {
    events = await listIntegrationEventLogEntries(100);
  } catch {
    return baseStatus("error", []);
  }

  if (!botTokenDetected && !applicationIdDetected && !internalSecretDetected) {
    return baseStatus("not_configured", events);
  }

  const latestDiscordEvent = events.find((event) => event.provider === "discord");
  const latestHeartbeat = findEvent(events, "discord_worker_heartbeat");
  const latestError = events.find(
    (event) => event.provider === "discord" && event.processingStatus === "error",
  );

  if (latestError && !latestHeartbeat) {
    return baseStatus("error", events);
  }

  if (!latestDiscordEvent) {
    return baseStatus("worker_never_seen", events);
  }

  if (latestHeartbeat && now.getTime() - Date.parse(latestHeartbeat.timestamp) <= staleAfterMs) {
    return baseStatus("worker_recently_active", events);
  }

  if (latestHeartbeat) {
    return baseStatus("worker_stale", events);
  }

  return baseStatus("configuration_detected", events);

  function baseStatus(
    status: DiscordWorkerStatus["status"],
    sourceEvents: IntegrationEventLogEntry[],
  ): DiscordWorkerStatus {
    const latestHeartbeatEvent = findEvent(sourceEvents, "discord_worker_heartbeat");
    return {
      status,
      botTokenDetected,
      applicationIdDetected,
      internalSecretDetected,
      latestHeartbeat: latestHeartbeatEvent?.timestamp,
      latestMessageReceived: findEvent(sourceEvents, "discord_message_received")
        ?.timestamp,
      latestProcessingSuccess: findEvent(sourceEvents, "discord_analysis_completed")
        ?.timestamp,
      messageCount: sourceEvents.filter(
        (event) =>
          event.provider === "discord" &&
          event.eventType === "discord_message_received",
      ).length,
      repositoryAvailable: status !== "error" || sourceEvents.length > 0,
      outboundExecutionAvailable: false,
    };
  }
}

function findEvent(events: IntegrationEventLogEntry[], eventType: string) {
  return events.find(
    (event) => event.provider === "discord" && event.eventType === eventType,
  );
}
