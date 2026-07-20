const gmailReadonlyScope = "https://www.googleapis.com/auth/gmail.readonly";

export function getGoogleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI?.trim() || "";
}

export function createGoogleAuthorizationUrl(state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const redirectUri = getGoogleRedirectUri();

  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth is not configured.");
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", gmailReadonlyScope);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  url.searchParams.set("include_granted_scopes", "true");

  return url.toString();
}

export async function exchangeGoogleCodeForTokens(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = getGoogleRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Google token exchange failed.");
  }

  return parseGoogleTokenResponse(await response.json());
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Google token refresh failed.");
  }

  return parseGoogleTokenResponse(await response.json());
}

function parseGoogleTokenResponse(body: unknown) {
  if (typeof body !== "object" || body === null) {
    throw new Error("Google token response was invalid.");
  }

  const record = body as Record<string, unknown>;
  const accessToken = record.access_token;
  const refreshToken = record.refresh_token;
  const expiresIn = record.expires_in;
  const scope = record.scope;
  const tokenType = record.token_type;

  if (
    typeof accessToken !== "string" ||
    typeof expiresIn !== "number" ||
    typeof tokenType !== "string"
  ) {
    throw new Error("Google token response was incomplete.");
  }

  return {
    accessToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
    expiresAt: Date.now() + expiresIn * 1000,
    scope: typeof scope === "string" ? scope : gmailReadonlyScope,
    tokenType,
  };
}
