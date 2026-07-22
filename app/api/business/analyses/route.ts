import { z } from "zod";

import { apiErrorResponse, zodIssuesToApiIssues } from "../../../../lib/api/responses";
import { getBusinessRepository } from "../../../../lib/business/repository";
import { createAnalysisSummary, createBusinessAnalysisRecord } from "../../../../lib/business/records";
import { saveBusinessAnalysisSchema } from "../../../../lib/business/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 50);
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50;

  try {
    const repository = getBusinessRepository();
    const analyses = await repository.listAnalyses(safeLimit);
    return Response.json({
      analyses,
      summaries: analyses.map(createAnalysisSummary),
    });
  } catch {
    return apiErrorResponse({
      code: "BUSINESS_ANALYSIS_LIST_FAILED",
      message: "Business analysis history could not be loaded.",
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 80_000) {
    return apiErrorResponse({
      code: "BUSINESS_ANALYSIS_TOO_LARGE",
      message: "Analysis request is too large.",
      status: 413,
    });
  }

  try {
    const parsed = saveBusinessAnalysisSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiErrorResponse({
        code: "BUSINESS_ANALYSIS_INVALID",
        message: "Business analysis request is invalid.",
        status: 400,
        issues: zodIssuesToApiIssues(parsed.error.issues),
      });
    }

    const record = createBusinessAnalysisRecord({ request: parsed.data });
    const repository = getBusinessRepository();
    await repository.saveAnalysis(record);
    await Promise.all(record.actions.map((action) => repository.saveAction(action)));

    return Response.json({ analysis: record, summary: createAnalysisSummary(record) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiErrorResponse({
        code: "BUSINESS_ANALYSIS_INVALID",
        message: "Business analysis request is invalid.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }
    return apiErrorResponse({
      code: "BUSINESS_ANALYSIS_SAVE_FAILED",
      message: "Business analysis could not be saved.",
      status: 500,
    });
  }
}
