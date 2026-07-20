import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const secretPatterns = [
  /access_token=([^&\s]+)/gi,
  /refresh_token=([^&\s]+)/gi,
  /bot_token=([^&\s]+)/gi,
  /token["']?\s*[:=]\s*["']?([^"',\s]+)/gi,
  /authorization["']?\s*[:=]\s*["']?([^"',\s]+)/gi,
];

export function createSecureState() {
  return randomBytes(24).toString("base64url");
}

export function redactSecret(value: string) {
  return secretPatterns.reduce(
    (redacted, pattern) => redacted.replace(pattern, (match) => {
      const [key] = match.split(/[=:]/);
      return `${key}=<redacted>`;
    }),
    value,
  );
}

export function redactExternalId(value: string | number | undefined) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const text = String(value);
  if (text.length <= 6) {
    return "***";
  }

  return `${text.slice(0, 3)}...${text.slice(-3)}`;
}

export function verifyMetaSignature({
  appSecret,
  rawBody,
  signatureHeader,
}: {
  appSecret?: string;
  rawBody: string;
  signatureHeader: string | null;
}) {
  if (!appSecret) {
    return { checked: false, valid: true };
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    return { checked: true, valid: false };
  }

  const expected = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  return {
    checked: true,
    valid: safeEqualHex(expected, received),
  };
}

export function verifyTelegramSecret({
  configuredSecret,
  receivedSecret,
}: {
  configuredSecret?: string;
  receivedSecret: string | null;
}) {
  if (!configuredSecret) {
    return { checked: false, valid: true };
  }

  if (!receivedSecret) {
    return { checked: true, valid: false };
  }

  return {
    checked: true,
    valid: safeEqual(configuredSecret, receivedSecret),
  };
}

function safeEqualHex(expected: string, received: string) {
  if (!/^[a-f0-9]+$/i.test(received)) {
    return false;
  }

  return safeEqual(expected, received);
}

function safeEqual(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
