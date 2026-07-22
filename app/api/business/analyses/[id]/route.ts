import { apiErrorResponse } from "../../../../../lib/api/responses";
import { getBusinessRepository } from "../../../../../lib/business/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(id)) {
    return apiErrorResponse({
      code: "BUSINESS_ANALYSIS_INVALID_ID",
      message: "Business analysis ID is invalid.",
      status: 400,
    });
  }

  try {
    const analysis = await getBusinessRepository().getAnalysis(id);
    if (!analysis) {
      return apiErrorResponse({
        code: "BUSINESS_ANALYSIS_NOT_FOUND",
        message: "Business analysis was not found.",
        status: 404,
      });
    }
    return Response.json({ analysis });
  } catch {
    return apiErrorResponse({
      code: "BUSINESS_ANALYSIS_LOAD_FAILED",
      message: "Business analysis could not be loaded.",
      status: 500,
    });
  }
}
