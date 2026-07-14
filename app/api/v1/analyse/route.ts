import { ZodError } from "zod";

import {
  apiErrorResponse,
  zodIssuesToApiIssues,
} from "../../../../lib/api/responses";
import { analyseMessage } from "../../../../lib/analysis/analyse-message";
import { analyseApiRequestSchema } from "../../../../lib/analysis/api-schemas";
import { createDefaultAiAnalysisProvider } from "../../../../lib/ai/default-provider";
import { projectRepository } from "../../../../lib/projects/local-json-project-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedRequest = analyseApiRequestSchema.parse(body);
    const project = await projectRepository.getById(parsedRequest.projectId);

    if (!project) {
      return apiErrorResponse({
        code: "PROJECT_NOT_FOUND",
        message: "Project not found.",
        status: 404,
      });
    }

    const result = await analyseMessage(
      {
        projectName: project.name,
        projectDescription: project.description,
        documentationText: project.documentationText,
        officialLinks: project.officialLinks,
        responseTone: project.responseTone,
        messageContent: parsedRequest.message.content,
        messageSource: parsedRequest.message.source,
      },
      createDefaultAiAnalysisProvider(),
    );

    return Response.json({
      ...result,
      explanations: result.triggeredRules.map((rule) => ({
        ruleId: rule.ruleId,
        explanation: rule.description,
        evidence: rule.matchedEvidence,
        recommendedAction: rule.recommendedAction,
      })),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse({
        code: "INVALID_REQUEST",
        message: "Invalid request.",
        status: 400,
        issues: zodIssuesToApiIssues(error.issues),
      });
    }

    if (error instanceof SyntaxError) {
      return apiErrorResponse({
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
        status: 400,
      });
    }

    return apiErrorResponse({
      code: "ANALYSIS_FAILED",
      message: "Analysis request failed.",
      status: 500,
    });
  }
}
