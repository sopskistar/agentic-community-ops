import { redactExternalId, redactSecret } from "./security";

export type IntegrationEventLogEntry = {
  id: string;
  provider: string;
  timestamp: string;
  eventType: string;
  processingStatus: "received" | "processed" | "ignored" | "error";
  analysisStatus: "not_started" | "completed" | "failed";
  errorSummary?: string;
  redactedExternalId?: string;
};

const maxEntries = 100;
const eventLog: IntegrationEventLogEntry[] = [];

export function addIntegrationEventLogEntry(
  entry: Omit<IntegrationEventLogEntry, "id" | "timestamp"> & {
    externalId?: string | number;
  },
) {
  const logEntry: IntegrationEventLogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    provider: entry.provider,
    eventType: entry.eventType,
    processingStatus: entry.processingStatus,
    analysisStatus: entry.analysisStatus,
    errorSummary: entry.errorSummary
      ? redactSecret(entry.errorSummary).slice(0, 500)
      : undefined,
    redactedExternalId: redactExternalId(entry.externalId),
  };

  eventLog.unshift(logEntry);
  eventLog.splice(maxEntries);
  return logEntry;
}

export function listIntegrationEventLogEntries() {
  return [...eventLog];
}

export function resetIntegrationEventLogForTests() {
  eventLog.length = 0;
}
