import { apiErrorResponse } from "../../../../../../lib/api/responses";
import { getBusinessRepository } from "../../../../../../lib/business/repository";
import { findingsToCsv, reportToJson } from "../../../../../../lib/business/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") ?? "json";
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

    if (format === "csv") {
      return new Response(findingsToCsv(report), {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${report.id}-findings.csv"`,
        },
      });
    }

    if (format !== "json") {
      return apiErrorResponse({
        code: "BUSINESS_REPORT_EXPORT_UNSUPPORTED",
        message: "Supported export formats are JSON and CSV.",
        status: 400,
      });
    }

    return new Response(reportToJson(report), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="${report.id}.json"`,
      },
    });
  } catch {
    return apiErrorResponse({
      code: "BUSINESS_REPORT_EXPORT_FAILED",
      message: "Business report export could not be prepared.",
      status: 500,
    });
  }
}
