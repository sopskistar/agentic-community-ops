import crypto from "crypto";

import { apiErrorResponse, zodIssuesToApiIssues } from "../../../../lib/api/responses";
import { businessProfiles } from "../../../../lib/business/profiles";
import { getBusinessRepository } from "../../../../lib/business/repository";
import { saveBusinessProfileSchema } from "../../../../lib/business/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const savedProfiles = await getBusinessRepository().listProfiles(100);
    const merged = [
      ...businessProfiles,
      ...savedProfiles.filter(
        (saved) => !businessProfiles.some((profile) => profile.id === saved.id),
      ),
    ];
    return Response.json({ profiles: merged });
  } catch {
    return apiErrorResponse({
      code: "BUSINESS_PROFILE_LIST_FAILED",
      message: "Business profiles could not be loaded.",
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const parsed = saveBusinessProfileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiErrorResponse({
        code: "BUSINESS_PROFILE_INVALID",
        message: "Business profile request is invalid.",
        status: 400,
        issues: zodIssuesToApiIssues(parsed.error.issues),
      });
    }

    const profile = {
      ...parsed.data,
      id: parsed.data.id ?? createProfileId(parsed.data.name),
    };
    await getBusinessRepository().saveProfile(profile);
    return Response.json({ profile });
  } catch {
    return apiErrorResponse({
      code: "BUSINESS_PROFILE_SAVE_FAILED",
      message: "Business profile could not be saved.",
      status: 500,
    });
  }
}

function createProfileId(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const hash = crypto.createHash("sha256").update(`${name}:${Date.now()}`).digest("hex").slice(0, 8);
  return `${slug || "profile"}-${hash}`;
}
