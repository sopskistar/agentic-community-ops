import { mkdir, readFile, rm, writeFile } from "fs/promises";
import crypto from "crypto";
import path from "path";

import type {
  BusinessActionRecord,
  BusinessAnalysisRecord,
  BusinessProfile,
  BusinessReportRecord,
} from "./types";

export type BusinessRepository = {
  saveAnalysis(record: BusinessAnalysisRecord): Promise<void>;
  getAnalysis(id: string): Promise<BusinessAnalysisRecord | null>;
  listAnalyses(limit?: number): Promise<BusinessAnalysisRecord[]>;
  saveReport(record: BusinessReportRecord): Promise<void>;
  getReport(id: string): Promise<BusinessReportRecord | null>;
  listReports(limit?: number): Promise<BusinessReportRecord[]>;
  saveProfile(profile: BusinessProfile): Promise<void>;
  listProfiles(limit?: number): Promise<BusinessProfile[]>;
  saveAction(record: BusinessActionRecord): Promise<void>;
  listActions(limit?: number): Promise<BusinessActionRecord[]>;
  reset?(): Promise<void>;
};

const maxRecords = 200;
const localStorePath = path.join(
  process.cwd(),
  ".agenticops",
  "business-workspace-store.json",
);

let repositoryOverride: BusinessRepository | null = null;
let cachedRepository: BusinessRepository | null = null;

export function getBusinessRepository() {
  if (repositoryOverride) {
    return repositoryOverride;
  }
  if (!cachedRepository) {
    cachedRepository = createBusinessRepository();
  }
  return cachedRepository;
}

export function setBusinessRepositoryForTests(repository: BusinessRepository | null) {
  repositoryOverride = repository;
  cachedRepository = null;
}

export class MemoryBusinessRepository implements BusinessRepository {
  private readonly analyses = new Map<string, BusinessAnalysisRecord>();
  private readonly reports = new Map<string, BusinessReportRecord>();
  private readonly profiles = new Map<string, BusinessProfile>();
  private readonly actions = new Map<string, BusinessActionRecord>();

  async saveAnalysis(record: BusinessAnalysisRecord) {
    this.analyses.set(record.id, record);
  }

  async getAnalysis(id: string) {
    return this.analyses.get(id) ?? null;
  }

  async listAnalyses(limit = maxRecords) {
    return newest([...this.analyses.values()], limit);
  }

  async saveReport(record: BusinessReportRecord) {
    this.reports.set(record.id, record);
  }

  async getReport(id: string) {
    return this.reports.get(id) ?? null;
  }

  async listReports(limit = maxRecords) {
    return newest([...this.reports.values()], limit, "generatedAt");
  }

  async saveProfile(profile: BusinessProfile) {
    this.profiles.set(profile.id, profile);
  }

  async listProfiles(limit = maxRecords) {
    return [...this.profiles.values()].slice(0, limit);
  }

  async saveAction(record: BusinessActionRecord) {
    this.actions.set(record.id, record);
  }

  async listActions(limit = maxRecords) {
    return newest([...this.actions.values()], limit);
  }

  async reset() {
    this.analyses.clear();
    this.reports.clear();
    this.profiles.clear();
    this.actions.clear();
  }
}

class LocalFileBusinessRepository implements BusinessRepository {
  async saveAnalysis(record: BusinessAnalysisRecord) {
    const store = await this.readStore();
    store.analyses[record.id] = record;
    store.analysisIndex = indexRecord(record.id, store.analysisIndex);
    await this.writeStore(store);
  }

  async getAnalysis(id: string) {
    const store = await this.readStore();
    return store.analyses[id] ?? null;
  }

  async listAnalyses(limit = maxRecords) {
    const store = await this.readStore();
    return store.analysisIndex
      .map((id) => store.analyses[id])
      .filter((record): record is BusinessAnalysisRecord => Boolean(record))
      .slice(0, limit);
  }

  async saveReport(record: BusinessReportRecord) {
    const store = await this.readStore();
    store.reports[record.id] = record;
    store.reportIndex = indexRecord(record.id, store.reportIndex);
    await this.writeStore(store);
  }

  async getReport(id: string) {
    const store = await this.readStore();
    return store.reports[id] ?? null;
  }

  async listReports(limit = maxRecords) {
    const store = await this.readStore();
    return store.reportIndex
      .map((id) => store.reports[id])
      .filter((record): record is BusinessReportRecord => Boolean(record))
      .slice(0, limit);
  }

  async saveProfile(profile: BusinessProfile) {
    const store = await this.readStore();
    store.profiles[profile.id] = profile;
    store.profileIndex = indexRecord(profile.id, store.profileIndex);
    await this.writeStore(store);
  }

  async listProfiles(limit = maxRecords) {
    const store = await this.readStore();
    return store.profileIndex
      .map((id) => store.profiles[id])
      .filter((record): record is BusinessProfile => Boolean(record))
      .slice(0, limit);
  }

  async saveAction(record: BusinessActionRecord) {
    const store = await this.readStore();
    store.actions[record.id] = record;
    store.actionIndex = indexRecord(record.id, store.actionIndex);
    await this.writeStore(store);
  }

  async listActions(limit = maxRecords) {
    const store = await this.readStore();
    return store.actionIndex
      .map((id) => store.actions[id])
      .filter((record): record is BusinessActionRecord => Boolean(record))
      .slice(0, limit);
  }

  async reset() {
    await rm(localStorePath, { force: true });
  }

  private async readStore(): Promise<BusinessStore> {
    try {
      return JSON.parse(await readFile(localStorePath, "utf8")) as BusinessStore;
    } catch {
      return emptyStore();
    }
  }

  private async writeStore(store: BusinessStore) {
    await mkdir(path.dirname(localStorePath), { recursive: true });
    await writeFile(localStorePath, JSON.stringify(store, null, 2), {
      mode: 0o600,
    });
  }
}

class KvBusinessRepository implements BusinessRepository {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly analysisIndexKey = "agenticops:business:analysis:index";
  private readonly reportIndexKey = "agenticops:business:report:index";
  private readonly profileIndexKey = "agenticops:business:profile:index";
  private readonly actionIndexKey = "agenticops:business:action:index";
  private readonly ttlSeconds: number | null;

  constructor({
    baseUrl,
    token,
    ttlSeconds,
  }: {
    baseUrl: string;
    token: string;
    ttlSeconds: number | null;
  }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
    this.ttlSeconds = ttlSeconds;
  }

  async saveAnalysis(record: BusinessAnalysisRecord) {
    await this.setRecord(this.analysisKey(record.id), record);
    await this.command(["LPUSH", this.analysisIndexKey, record.id]);
    await this.command(["LTRIM", this.analysisIndexKey, "0", String(maxRecords - 1)]);
  }

  async getAnalysis(id: string) {
    return this.getRecord<BusinessAnalysisRecord>(this.analysisKey(id));
  }

  async listAnalyses(limit = maxRecords) {
    return this.listByIndex<BusinessAnalysisRecord>(this.analysisIndexKey, limit, (id) =>
      this.analysisKey(id),
    );
  }

  async saveReport(record: BusinessReportRecord) {
    await this.setRecord(this.reportKey(record.id), record);
    await this.command(["LPUSH", this.reportIndexKey, record.id]);
    await this.command(["LTRIM", this.reportIndexKey, "0", String(maxRecords - 1)]);
  }

  async getReport(id: string) {
    return this.getRecord<BusinessReportRecord>(this.reportKey(id));
  }

  async listReports(limit = maxRecords) {
    return this.listByIndex<BusinessReportRecord>(this.reportIndexKey, limit, (id) =>
      this.reportKey(id),
    );
  }

  async saveProfile(profile: BusinessProfile) {
    await this.setRecord(this.profileKey(profile.id), profile);
    await this.command(["LPUSH", this.profileIndexKey, profile.id]);
    await this.command(["LTRIM", this.profileIndexKey, "0", String(maxRecords - 1)]);
  }

  async listProfiles(limit = maxRecords) {
    return this.listByIndex<BusinessProfile>(this.profileIndexKey, limit, (id) =>
      this.profileKey(id),
    );
  }

  async saveAction(record: BusinessActionRecord) {
    await this.setRecord(this.actionKey(record.id), record);
    await this.command(["LPUSH", this.actionIndexKey, record.id]);
    await this.command(["LTRIM", this.actionIndexKey, "0", String(maxRecords - 1)]);
  }

  async listActions(limit = maxRecords) {
    return this.listByIndex<BusinessActionRecord>(this.actionIndexKey, limit, (id) =>
      this.actionKey(id),
    );
  }

  private async setRecord(key: string, value: unknown) {
    if (this.ttlSeconds) {
      await this.command(["SET", key, JSON.stringify(value), "EX", String(this.ttlSeconds)]);
      return;
    }
    await this.command(["SET", key, JSON.stringify(value)]);
  }

  private async getRecord<T>(key: string) {
    const result = await this.command(["GET", key]);
    return typeof result === "string" ? (JSON.parse(result) as T) : null;
  }

  private async listByIndex<T>(
    indexKey: string,
    limit: number,
    keyFactory: (id: string) => string,
  ) {
    const ids = await this.command(["LRANGE", indexKey, "0", String(Math.max(0, limit - 1))]);
    if (!Array.isArray(ids)) {
      return [];
    }
    const uniqueIds = [...new Set(ids.filter((id): id is string => typeof id === "string"))];
    const records = await Promise.all(uniqueIds.map((id) => this.getRecord<T>(keyFactory(id))));
    return records.filter((record): record is NonNullable<typeof record> =>
      Boolean(record),
    );
  }

  private analysisKey(id: string) {
    return `agenticops:business:analysis:${hashId(id)}`;
  }

  private reportKey(id: string) {
    return `agenticops:business:report:${hashId(id)}`;
  }

  private profileKey(id: string) {
    return `agenticops:business:profile:${hashId(id)}`;
  }

  private actionKey(id: string) {
    return `agenticops:business:action:${hashId(id)}`;
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
      throw new Error(`Business repository returned ${response.status}`);
    }

    const payload = (await response.json()) as { result?: unknown; error?: string };
    if (payload.error) {
      throw new Error("Business repository command failed.");
    }
    return payload.result;
  }
}

type BusinessStore = {
  analyses: Record<string, BusinessAnalysisRecord>;
  reports: Record<string, BusinessReportRecord>;
  profiles: Record<string, BusinessProfile>;
  actions: Record<string, BusinessActionRecord>;
  analysisIndex: string[];
  reportIndex: string[];
  profileIndex: string[];
  actionIndex: string[];
};

function createBusinessRepository(): BusinessRepository {
  const forcedRepository = process.env.BUSINESS_REPOSITORY?.trim();
  if (forcedRepository === "memory") {
    return new MemoryBusinessRepository();
  }

  const kvUrl =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const kvToken =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (kvUrl && kvToken) {
    return new KvBusinessRepository({
      baseUrl: kvUrl,
      token: kvToken,
      ttlSeconds: getRetentionTtlSeconds(),
    });
  }

  if (process.env.NODE_ENV === "test") {
    return new MemoryBusinessRepository();
  }

  return new LocalFileBusinessRepository();
}

function getRetentionTtlSeconds() {
  const days = Number(process.env.BUSINESS_RECORD_RETENTION_DAYS);
  if (!Number.isFinite(days) || days <= 0) {
    return null;
  }
  return Math.floor(days * 24 * 60 * 60);
}

function emptyStore(): BusinessStore {
  return {
    analyses: {},
    reports: {},
    profiles: {},
    actions: {},
    analysisIndex: [],
    reportIndex: [],
    profileIndex: [],
    actionIndex: [],
  };
}

function indexRecord(id: string, index: string[]) {
  return [id, ...index.filter((item) => item !== id)].slice(0, maxRecords);
}

function newest<T extends { updatedAt?: string; createdAt?: string; generatedAt?: string }>(
  records: T[],
  limit: number,
  dateField: keyof T = "updatedAt",
) {
  return [...records]
    .sort((a, b) =>
      String(b[dateField] ?? b.updatedAt ?? b.generatedAt ?? b.createdAt).localeCompare(
        String(a[dateField] ?? a.updatedAt ?? a.generatedAt ?? a.createdAt),
      ),
    )
    .slice(0, limit);
}

function hashId(id: string) {
  return crypto.createHash("sha256").update(id).digest("hex").slice(0, 32);
}
