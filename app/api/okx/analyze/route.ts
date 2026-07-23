import { ZodError } from "zod";

import {
  apiErrorResponse,
  zodIssuesToApiIssues,
} from "../../../../lib/api/responses";
import {
  analyzeCommunicationRisk,
  okxAnalysisInputJsonSchema,
  okxAnalysisOutputJsonSchema,
} from "../../../../lib/okx/analysis-service";

export const runtime = "nodejs";

const maxRequestBodyLength = 12_000;

export async function GET() {
  return Response.json({
    service: "AgenticOps Communication Risk & Intelligence Analysis",
    mode: "free-a2mcp-readiness",
    endpoint: "https://agenticopsai.xyz/api/okx/analyze",
    mcpEndpoint: "https://agenticopsai.xyz/api/mcp",
    toolName: "analyze_communication_risk",
    inputSchema: okxAnalysisInputJsonSchema,
    outputSchema: okxAnalysisOutputJsonSchema,
    safety:
      "Analyze-only. Suggested replies and actions require human review. No external provider action is executed.",
  });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (rawBody.length > maxRequestBodyLength) {
      return apiErrorResponse({
        code: "PAYLOAD_TOO_LARGE",
        message: "Analysis request payload is too large.",
        status: 413,
      });
    }

    const payload = JSON.parse(rawBody) as unknown;
    const result = await analyzeCommunicationRisk(payload);
    return Response.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiErrorResponse({
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
        status: 400,
      });
    }

    if (error instanceof ZodError) {
      return apiErrorResponse({
        code: "INVALID_REQUEST",
        message: "Invalid analysis request.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }

    return apiErrorResponse({
      code: "ANALYSIS_FAILED",
      message: "Communication analysis failed.",
      status: 500,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: "GET, POST, OPTIONS",
    },
  });
}
