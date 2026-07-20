import { cookies } from "next/headers";

import { createGoogleAuthorizationUrl } from "../../../../../lib/integrations/oauth/google";
import { createSecureState } from "../../../../../lib/integrations/security";
import { apiErrorResponse } from "../../../../../lib/api/responses";

export async function GET() {
  try {
    const state = createSecureState();
    const cookieStore = await cookies();
    cookieStore.set("agenticops_google_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60,
      path: "/",
    });

    return Response.redirect(createGoogleAuthorizationUrl(state), 302);
  } catch {
    return apiErrorResponse({
      code: "GOOGLE_OAUTH_NOT_CONFIGURED",
      message: "Google OAuth is not configured.",
      status: 503,
    });
  }
}
