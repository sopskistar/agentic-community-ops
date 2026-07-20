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
    records[tokens.accountId] = tokens;
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
