import { apiErrorResponse, zodIssuesToApiIssues } from "../../../../lib/api/responses";
import { getBusinessRepository } from "../../../../lib/business/repository";
import { createBusinessReport } from "../../../../lib/business/reports";
import { createBusinessReportSchema } from "../../../../lib/business/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 50);
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50;

  try {
    const reports = await getBusinessRepository().listReports(safeLimit);
    return Response.json({ reports });
  } catch {
    return apiErrorResponse({
      code: "BUSINESS_REPORT_LIST_FAILED",
      message: "Business reports could not be loaded.",
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const parsed = createBusinessReportSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiErrorResponse({
        code: "BUSINESS_REPORT_INVALID",
        message: "Business report request is invalid.",
        status: 400,
        issues: zodIssuesToApiIssues(parsed.error.issues),
      });
    }

    const repository = getBusinessRepository();
    const analysis = await repository.getAnalysis(parsed.data.analysisId);
    if (!analysis) {
      return apiErrorResponse({
        code: "BUSINESS_REPORT_ANALYSIS_NOT_FOUND",
        message: "Generate a report from a saved analysis.",
        status: 404,
      });
    }

    const report = createBusinessReport({
      analysis,
      reportType: parsed.data.reportType,
    });
    await repository.saveReport(report);
    await repository.saveAnalysis({
      ...analysis,
      reportIds: [...new Set([report.id, ...analysis.reportIds])],
      updatedAt: new Date().toISOString(),
    });

    return Response.json({ report });
  } catch {
    return apiErrorResponse({
      code: "BUSINESS_REPORT_SAVE_FAILED",
      message: "Business report could not be generated.",
      status: 500,
    });
  }
}
