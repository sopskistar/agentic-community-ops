import { apiErrorResponse } from "../../../../../lib/api/responses";
import { getBusinessRepository } from "../../../../../lib/business/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,200}$/.test(id)) {
    return apiErrorResponse({
      code: "BUSINESS_REPORT_INVALID_ID",
      message: "Business report ID is invalid.",
      status: 400,
    });
  }

  try {
    const report = await getBusinessRepository().getReport(id);
    if (!report) {
      return apiErrorResponse({
        code: "BUSINESS_REPORT_NOT_FOUND",
        message: "Business report was not found.",
        status: 404,
      });
    }
    return Response.json({ report });
  } catch {
    return apiErrorResponse({
      code: "BUSINESS_REPORT_LOAD_FAILED",
      message: "Business report could not be loaded.",
      status: 500,
    });
  }
}
