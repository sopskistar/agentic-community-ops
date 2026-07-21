import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

export type GoogleTokenRecord = {
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
  tokenType: string;
  createdAt: string;
  connectedAt: string;
  updatedAt: string;
};

export type OAuthTokenStore = {
  saveGoogleTokens(tokens: GoogleTokenRecord): Promise<void>;
  getGoogleTokens(accountId: string): Promise<GoogleTokenRecord | null>;
  updateGoogleTokens(
    accountId: string,
    tokens: Partial<GoogleTokenRecord>,
  ): Promise<void>;
  deleteGoogleTokens(accountId: string): Promise<void>;
};

const developmentTokenPath = path.join(
  process.cwd(),
  ".agenticops",
  "development-oauth-tokens.json.enc",
);

export class DevelopmentEncryptedOAuthTokenStore implements OAuthTokenStore {
  async saveGoogleTokens(tokens: GoogleTokenRecord) {
    const records = await this.readRecords();
    const existing = records[tokens.accountId];
    records[tokens.accountId] = {
      ...tokens,
      refreshToken: tokens.refreshToken ?? existing?.refreshToken,
      createdAt: existing?.createdAt ?? tokens.createdAt,
      connectedAt: existing?.connectedAt ?? tokens.connectedAt,
    };
    await this.writeRecords(records);
  }

  async getGoogleTokens(accountId: string) {
    const records = await this.readRecords();
    return records[accountId] ?? null;
  }

  async updateGoogleTokens(
    accountId: string,
    tokens: Partial<GoogleTokenRecord>,
  ) {
    const records = await this.readRecords();
    const existing = records[accountId];

    if (!existing) {
      throw new Error("Google token record was not found.");
    }

    records[accountId] = {
      ...existing,
      ...tokens,
      updatedAt: new Date().toISOString(),
    };
    await this.writeRecords(records);
  }

  async deleteGoogleTokens(accountId: string) {
    const records = await this.readRecords();
    delete records[accountId];
    await this.writeRecords(records);
  }

  private async readRecords() {
    try {
      const encrypted = await readFile(developmentTokenPath, "utf8");
      return JSON.parse(decrypt(encrypted)) as Record<string, GoogleTokenRecord>;
    } catch {
      return {};
    }
  }

  private async writeRecords(records: Record<string, GoogleTokenRecord>) {
    await mkdir(path.dirname(developmentTokenPath), { recursive: true });
    await writeFile(developmentTokenPath, encrypt(JSON.stringify(records)), {
      mode: 0o600,
    });
  }
}

export function createOAuthTokenStore(): OAuthTokenStore {
  const kvUrl =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const kvToken =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (kvUrl && kvToken) {
    return new UpstashOAuthTokenStore({ baseUrl: kvUrl, token: kvToken });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Durable OAuth token storage is not configured.");
  }

  return new DevelopmentEncryptedOAuthTokenStore();
}

export async function clearDevelopmentOAuthTokenStoreForTests() {
  await rm(developmentTokenPath, { force: true });
}

function getEncryptionKey() {
  const secret = process.env.OAUTH_TOKEN_ENCRYPTION_KEY?.trim();

  if (!secret) {
    throw new Error("OAUTH_TOKEN_ENCRYPTION_KEY is required for token storage.");
  }

  return createHash("sha256").update(secret).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

function decrypt(value: string) {
  const payload = Buffer.from(value, "base64url");
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

export class UpstashOAuthTokenStore implements OAuthTokenStore {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor({ baseUrl, token }: { baseUrl: string; token: string }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
  }

  async saveGoogleTokens(tokens: GoogleTokenRecord) {
    const existing = await this.getGoogleTokens(tokens.accountId);
    const now = new Date().toISOString();
    const record: GoogleTokenRecord = {
      ...tokens,
      refreshToken: tokens.refreshToken ?? existing?.refreshToken,
      createdAt: existing?.createdAt ?? tokens.createdAt ?? now,
      connectedAt: existing?.connectedAt ?? tokens.connectedAt ?? now,
      updatedAt: tokens.updatedAt ?? now,
    };

    await this.command([
      "SET",
      this.googleTokenKey(tokens.accountId),
      encrypt(JSON.stringify(record)),
    ]);
  }

  async getGoogleTokens(accountId: string) {
    const result = await this.command(["GET", this.googleTokenKey(accountId)]);
    return typeof result === "string"
      ? (JSON.parse(decrypt(result)) as GoogleTokenRecord)
      : null;
  }

  async updateGoogleTokens(
    accountId: string,
    tokens: Partial<GoogleTokenRecord>,
  ) {
    const existing = await this.getGoogleTokens(accountId);

    if (!existing) {
      throw new Error("Google token record was not found.");
    }

    await this.saveGoogleTokens({
      ...existing,
      ...tokens,
      refreshToken: tokens.refreshToken ?? existing.refreshToken,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteGoogleTokens(accountId: string) {
    await this.command(["DEL", this.googleTokenKey(accountId)]);
  }

  private googleTokenKey(accountId: string) {
    const hashedConnectionId = createHash("sha256")
      .update(`google:${accountId}`)
      .digest("hex")
      .slice(0, 32);
    return `agenticops:oauth:google:${hashedConnectionId}`;
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
      throw new Error(`OAuth token store returned ${response.status}`);
    }

    const payload = (await response.json()) as { result?: unknown; error?: string };
    if (payload.error) {
      throw new Error("OAuth token store command failed.");
    }

    return payload.result;
  }
}
