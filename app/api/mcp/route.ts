import { ZodError, z } from "zod";

import {
  analyzeCommunicationRisk,
  okxAnalysisInputJsonSchema,
} from "../../../lib/okx/analysis-service";

export const runtime = "nodejs";

const maxRequestBodyLength = 12_000;

const jsonRpcRequestSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string().trim().min(1),
  params: z.unknown().optional(),
});

export async function GET() {
  return Response.json({
    name: "AgenticOps AI MCP",
    endpoint: "https://agenticopsai.xyz/api/mcp",
    protocol: "JSON-RPC 2.0",
    exposedTools: ["analyze_communication_risk"],
    safety:
      "Analyze-only. This endpoint does not expose integrations, OAuth, approval mutation or provider secrets.",
  });
}

export async function POST(request: Request) {
  let id: string | number | null = null;

  try {
    const rawBody = await request.text();
    if (rawBody.length > maxRequestBodyLength) {
      return jsonRpcError(id, -32000, "Request payload is too large.", 413);
    }

    const parsed = jsonRpcRequestSchema.parse(JSON.parse(rawBody));
    id = parsed.id ?? null;

    if (parsed.method === "initialize") {
      return jsonRpcResult(id, {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
        serverInfo: {
          name: "AgenticOps AI",
          version: "1.0.0",
        },
      });
    }

    if (parsed.method === "tools/list") {
      return jsonRpcResult(id, {
        tools: [
          {
            name: "analyze_communication_risk",
            description:
              "Analyze a communication message for intent, sentiment, priority, security risk, recommended actions and human-review requirements.",
            inputSchema: okxAnalysisInputJsonSchema,
          },
        ],
      });
    }

    if (parsed.method === "tools/call") {
      const params = toolCallParamsSchema.parse(parsed.params);
      if (params.name !== "analyze_communication_risk") {
        return jsonRpcError(id, -32602, "Unknown tool.");
      }

      const result = await analyzeCommunicationRisk(params.arguments);
      return jsonRpcResult(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
        structuredContent: result,
        isError: false,
      });
    }

    return jsonRpcError(id, -32601, "Method not found.");
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonRpcError(id, -32700, "Parse error.");
    }

    if (error instanceof ZodError) {
      return jsonRpcError(id, -32602, "Invalid request parameters.");
    }

    return jsonRpcError(id, -32000, "MCP request failed.", 500);
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

const toolCallParamsSchema = z.object({
  name: z.string().trim().min(1),
  arguments: z.unknown().optional(),
});

function jsonRpcResult(id: string | number | null, result: unknown) {
  return Response.json({
    jsonrpc: "2.0",
    id,
    result,
  });
}

function jsonRpcError(
  id: string | number | null,
  code: number,
  message: string,
  status = 400,
) {
  return Response.json(
    {
      jsonrpc: "2.0",
      id,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}
