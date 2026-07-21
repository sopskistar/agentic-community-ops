import { cookies } from "next/headers";

import { exchangeGoogleCodeForTokens } from "../../../../../lib/integrations/oauth/google";
import {
  createOAuthTokenStore,
  type GoogleTokenRecord,
} from "../../../../../lib/integrations/oauth/token-store";
import { googleAccountId } from "../../../../../lib/integrations/google/gmail-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("agenticops_google_oauth_state")?.value;
  cookieStore.delete("agenticops_google_oauth_state");

  if (error) {
    return redirectToStatus("google_error");
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectToStatus("google_state_error");
  }

  try {
    const tokens = await exchangeGoogleCodeForTokens(code);
    const now = new Date().toISOString();
    const tokenRecord: GoogleTokenRecord = {
      accountId: googleAccountId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
      tokenType: tokens.tokenType,
      createdAt: now,
      connectedAt: now,
      updatedAt: now,
    };

    await createOAuthTokenStore().saveGoogleTokens(tokenRecord);
    return redirectToStatus("google_connected");
  } catch {
    return redirectToStatus("google_token_error");
  }
}

function redirectToStatus(status: string) {
  return Response.redirect(
    new URL(`/integrations?status=${status}`, getBaseUrl()),
    302,
  );
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_BASE_URL?.trim() ||
    "http://localhost:3000"
  );
}
