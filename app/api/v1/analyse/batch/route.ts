import { ZodError, z } from "zod";

import {
  apiErrorResponse,
  zodIssuesToApiIssues,
} from "../../../../../lib/api/responses";
import { analyseMessage } from "../../../../../lib/analysis/analyse-message";
import { messageSources } from "../../../../../lib/analysis/api-schemas";
import { createBatchSummary } from "../../../../../lib/analysis/batch";
import type {
  BatchAnalysedMessage,
  BatchFailedMessage,
} from "../../../../../lib/analysis/batch";
import { createDefaultAiAnalysisProvider } from "../../../../../lib/ai/default-provider";
import { projectRepository } from "../../../../../lib/projects/local-json-project-repository";

const maxBatchSize = 25;
const aiConcurrency = 3;

const batchRequestSchema = z.object({
  projectId: z.string().trim().min(1).max(120),
  messages: z.array(z.unknown()).min(1),
});

const batchMessageSchema = z.object({
  content: z.string().trim().min(1).max(2_000),
  source: z.enum(messageSources),
  authorName: z.string().trim().min(1).max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBatch = batchRequestSchema.parse(body);

    if (parsedBatch.messages.length > maxBatchSize) {
      return apiErrorResponse({
        code: "BATCH_TOO_LARGE",
        message: "Batch size must be 25 messages or fewer.",
        status: 400,
      });
    }

    const project = await projectRepository.getById(parsedBatch.projectId);

    if (!project) {
      return apiErrorResponse({
        code: "PROJECT_NOT_FOUND",
        message: "Project not found.",
        status: 404,
      });
    }

    const failedResults: BatchFailedMessage[] = [];
    const validMessages = parsedBatch.messages.flatMap((message, index) => {
      const parsedMessage = batchMessageSchema.safeParse(message);

      if (!parsedMessage.success) {
        failedResults.push({
          index,
          error: "Invalid message.",
        });
        return [];
      }

      return [{ index, message: parsedMessage.data }];
    });

    const aiProvider = createDefaultAiAnalysisProvider();
    const successfulResults = await mapWithConcurrency(
      validMessages,
      aiConcurrency,
      async ({ index, message }) => {
        try {
          const result = await analyseMessage(
            {
              projectName: project.name,
              projectDescription: project.description,
              documentationText: project.documentationText,
              officialLinks: project.officialLinks,
              responseTone: project.responseTone,
              messageContent: message.content,
              messageSource: message.source,
            },
            aiProvider,
          );

          return {
            ok: true as const,
            value: {
              index,
              content: message.content,
              source: message.source,
              authorName: message.authorName,
              result,
            },
          };
        } catch {
          return {
            ok: false as const,
            value: {
              index,
              content: message.content,
              error: "Analysis failed.",
            },
          };
        }
      },
    );

    const analysedMessages: BatchAnalysedMessage[] = [];
    for (const item of successfulResults) {
      if (item.ok) {
        analysedMessages.push(item.value);
      } else {
        failedResults.push(item.value);
      }
    }

    return Response.json({
      summary: createBatchSummary(analysedMessages, failedResults),
      successfulResults: analysedMessages,
      failedResults: failedResults.sort((first, second) => first.index - second.index),
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
      code: "BATCH_ANALYSIS_FAILED",
      message: "Batch analysis request failed.",
      status: 500,
    });
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}
