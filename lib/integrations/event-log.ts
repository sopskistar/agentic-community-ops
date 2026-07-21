import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

import type { IntegrationProcessingResult } from "./processor";
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

export type IntegrationWorkflowStatus =
  | "received"
  | "analyzed"
  | "suggested"
  | "approved"
  | "execution_unavailable"
  | "executed"
  | "execution_failed";

export type IntegrationWorkflowRecord = {
  id: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  status: IntegrationWorkflowStatus;
  receivedMessage: {
    normalizedMessageId: string;
    externalId?: string;
    source: string;
    channelId?: string;
    conversationId?: string;
    senderId?: string;
    senderName?: string;
    timestamp: string;
    textPreview: string;
    metadata?: Record<string, unknown>;
  };
  analysis?: {
    riskLevel: string;
    intent: string;
    aiClassification: string;
    deterministicRuleIds: string[];
    explainability: string[];
  };
  suggestion?: {
    suggestedAction: string;
    suggestedReply: string;
    requiresHumanApproval: true;
    outboundAvailable: false;
    outboundUnavailableReason: string;
  };
  approval?: {
    status: "pending" | "approved" | "rejected";
    reviewerId?: string;
    reviewedAt?: string;
    notes?: string;
  };
  execution?: {
    status: "not_attempted" | "unavailable" | "succeeded" | "failed";
    providerAction?: string;
    attemptedAt?: string;
    errorSummary?: string;
  };
};

export type CreateIntegrationEventLogEntry = Omit<
  IntegrationEventLogEntry,
  "id" | "timestamp" | "redactedExternalId" | "errorSummary"
> & {
  externalId?: string | number;
  errorSummary?: string;
};

export type IntegrationEventRepository = {
  appendEvent(entry: IntegrationEventLogEntry): Promise<void>;
  listEvents(limit?: number): Promise<IntegrationEventLogEntry[]>;
  saveWorkflow(record: IntegrationWorkflowRecord): Promise<void>;
  getWorkflow(id: string): Promise<IntegrationWorkflowRecord | null>;
  listWorkflows(limit?: number): Promise<IntegrationWorkflowRecord[]>;
  reset?(): Promise<void>;
};

const maxEntries = 100;
const localStorePath = path.join(
  process.cwd(),
  ".agenticops",
  "integration-event-store.json",
);

let repositoryOverride: IntegrationEventRepository | null = null;
let cachedRepository: IntegrationEventRepository | null = null;

export async function addIntegrationEventLogEntry(
  entry: CreateIntegrationEventLogEntry,
) {
  const logEntry = createLogEntry(entry);
  await getIntegrationEventRepository().appendEvent(logEntry);
  return logEntry;
}

export async function recordIntegrationAnalysis(
  result: IntegrationProcessingResult,
) {
  const workflow = createWorkflowRecord(result);
  await getIntegrationEventRepository().saveWorkflow(workflow);
  return workflow;
}

export async function listIntegrationEventLogEntries(limit = maxEntries) {
  return getIntegrationEventRepository().listEvents(limit);
}

export async function listIntegrationWorkflowRecords(limit = 25) {
  return getIntegrationEventRepository().listWorkflows(limit);
}

export function getIntegrationEventRepository() {
  if (repositoryOverride) {
    return repositoryOverride;
  }

  if (!cachedRepository) {
    cachedRepository = createIntegrationEventRepository();
  }

  return cachedRepository;
}

export function setIntegrationEventRepositoryForTests(
  repository: IntegrationEventRepository | null,
) {
  repositoryOverride = repository;
  cachedRepository = null;
}

export async function resetIntegrationEventLogForTests() {
  const repository = getIntegrationEventRepository();
  if (repository.reset) {
    await repository.reset();
  }
}

export class MemoryIntegrationEventRepository
  implements IntegrationEventRepository
{
  private readonly events: IntegrationEventLogEntry[] = [];
  private readonly workflows = new Map<string, IntegrationWorkflowRecord>();

  async appendEvent(entry: IntegrationEventLogEntry) {
    this.events.unshift(entry);
    this.events.splice(maxEntries);
  }

  async listEvents(limit = maxEntries) {
    return this.events.slice(0, limit);
  }

  async saveWorkflow(record: IntegrationWorkflowRecord) {
    this.workflows.set(record.id, record);
  }

  async getWorkflow(id: string) {
    return this.workflows.get(id) ?? null;
  }

  async listWorkflows(limit = 25) {
    return [...this.workflows.values()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
  }

  async reset() {
    this.events.length = 0;
    this.workflows.clear();
  }
}

class LocalFileIntegrationEventRepository
  implements IntegrationEventRepository
{
  async appendEvent(entry: IntegrationEventLogEntry) {
    const store = await this.readStore();
    store.events.unshift(entry);
    store.events.splice(maxEntries);
    await this.writeStore(store);
  }

  async listEvents(limit = maxEntries) {
    const store = await this.readStore();
    return store.events.slice(0, limit);
  }

  async saveWorkflow(record: IntegrationWorkflowRecord) {
    const store = await this.readStore();
    store.workflows[record.id] = record;
    store.workflowIndex = [
      record.id,
      ...store.workflowIndex.filter((id) => id !== record.id),
    ].slice(0, maxEntries);
    await this.writeStore(store);
  }

  async getWorkflow(id: string) {
    const store = await this.readStore();
    return store.workflows[id] ?? null;
  }

  async listWorkflows(limit = 25) {
    const store = await this.readStore();
    return store.workflowIndex
      .map((id) => store.workflows[id])
      .filter((record): record is IntegrationWorkflowRecord => Boolean(record))
      .slice(0, limit);
  }

  async reset() {
    await rm(localStorePath, { force: true });
  }

  private async readStore() {
    try {
      return JSON.parse(await readFile(localStorePath, "utf8")) as LocalStore;
    } catch {
      return { events: [], workflows: {}, workflowIndex: [] };
    }
  }

  private async writeStore(store: LocalStore) {
    await mkdir(path.dirname(localStorePath), { recursive: true });
    await writeFile(localStorePath, JSON.stringify(store, null, 2), {
      mode: 0o600,
    });
  }
}

class VercelKvIntegrationEventRepository
  implements IntegrationEventRepository
{
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly eventsKey = "agenticops:integration-events";
  private readonly workflowIndexKey = "agenticops:integration-workflow-index";

  constructor({ baseUrl, token }: { baseUrl: string; token: string }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
  }

  async appendEvent(entry: IntegrationEventLogEntry) {
    await this.command(["LPUSH", this.eventsKey, JSON.stringify(entry)]);
    await this.command(["LTRIM", this.eventsKey, "0", String(maxEntries - 1)]);
  }

  async listEvents(limit = maxEntries) {
    const result = await this.command([
      "LRANGE",
      this.eventsKey,
      "0",
      String(Math.max(0, limit - 1)),
    ]);
    return parseKvJsonList<IntegrationEventLogEntry>(result);
  }

  async saveWorkflow(record: IntegrationWorkflowRecord) {
    const workflowKey = this.workflowKey(record.id);
    await this.command(["SET", workflowKey, JSON.stringify(record)]);
    await this.command(["LPUSH", this.workflowIndexKey, record.id]);
    await this.command([
      "LTRIM",
      this.workflowIndexKey,
      "0",
      String(maxEntries - 1),
    ]);
  }

  async getWorkflow(id: string) {
    const result = await this.command(["GET", this.workflowKey(id)]);
    return typeof result === "string"
      ? (JSON.parse(result) as IntegrationWorkflowRecord)
      : null;
  }

  async listWorkflows(limit = 25) {
    const ids = await this.command([
      "LRANGE",
      this.workflowIndexKey,
      "0",
      String(Math.max(0, limit - 1)),
    ]);
    if (!Array.isArray(ids)) {
      return [];
    }

    const uniqueIds = [...new Set(ids.filter((id): id is string => typeof id === "string"))];
    const records = await Promise.all(uniqueIds.map((id) => this.getWorkflow(id)));
    return records.filter(
      (record): record is IntegrationWorkflowRecord => Boolean(record),
    );
  }

  private workflowKey(id: string) {
    return `agenticops:integration-workflow:${id}`;
  }

  private async command(args: string[]) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Integration event repository returned ${response.status}`);
    }

    const payload = (await response.json()) as { result?: unknown; error?: string };
    if (payload.error) {
      throw new Error("Integration event repository command failed.");
    }

    return payload.result;
  }
}

type LocalStore = {
  events: IntegrationEventLogEntry[];
  workflows: Record<string, IntegrationWorkflowRecord>;
  workflowIndex: string[];
};

function createIntegrationEventRepository(): IntegrationEventRepository {
  const forcedRepository = process.env.INTEGRATION_EVENT_REPOSITORY?.trim();
  if (forcedRepository === "memory") {
    return new MemoryIntegrationEventRepository();
  }

  const kvUrl =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const kvToken =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (kvUrl && kvToken) {
    return new VercelKvIntegrationEventRepository({
      baseUrl: kvUrl,
      token: kvToken,
    });
  }

  if (process.env.NODE_ENV === "test") {
    return new MemoryIntegrationEventRepository();
  }

  return new LocalFileIntegrationEventRepository();
}

function createLogEntry(entry: CreateIntegrationEventLogEntry) {
  return {
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
  } satisfies IntegrationEventLogEntry;
}

function createWorkflowRecord(
  result: IntegrationProcessingResult,
): IntegrationWorkflowRecord {
  const now = new Date().toISOString();
  const textPreview = redactSecret(result.message.text).slice(0, 240);

  return {
    id: result.message.id,
    provider: result.message.source,
    createdAt: now,
    updatedAt: now,
    status: "suggested",
    receivedMessage: {
      normalizedMessageId: result.message.id,
      externalId: result.message.externalId
        ? redactExternalId(result.message.externalId)
        : undefined,
      source: result.message.source,
      channelId: result.message.channelId,
      conversationId: result.message.conversationId,
      senderId: result.message.senderId
        ? redactExternalId(result.message.senderId)
        : undefined,
      senderName: result.message.senderName,
      timestamp: result.message.timestamp,
      textPreview,
      metadata: result.message.metadata,
    },
    analysis: {
      riskLevel: result.riskLevel,
      intent: result.intent,
      aiClassification: result.aiClassification,
      deterministicRuleIds: result.deterministicRuleResults.map(
        (rule) => rule.ruleId,
      ),
      explainability: result.explainability,
    },
    suggestion: {
      suggestedAction: result.suggestedAction,
      suggestedReply: result.suggestedReply,
      requiresHumanApproval: true,
      outboundAvailable: false,
      outboundUnavailableReason:
        "Outbound execution is disabled until provider permissions, tenant ownership and explicit human approval workflows are configured.",
    },
    approval: { status: "pending" },
    execution: { status: "not_attempted" },
  };
}

function parseKvJsonList<T>(result: unknown) {
  if (!Array.isArray(result)) {
    return [];
  }

  return result
    .filter((value): value is string => typeof value === "string")
    .map((value) => JSON.parse(value) as T);
}
