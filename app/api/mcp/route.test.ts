import { describe, expect, it } from "vitest";

import { GET, POST } from "./route";

function rpc(body: unknown) {
  return new Request("https://agenticopsai.xyz/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/mcp", () => {
  it("returns MCP server metadata", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.endpoint).toBe("https://agenticopsai.xyz/api/mcp");
    expect(body.exposedTools).toEqual(["analyze_communication_risk"]);
  });

  it("initializes a JSON-RPC MCP session", async () => {
    const response = await POST(
      rpc({ jsonrpc: "2.0", id: 1, method: "initialize" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.serverInfo.name).toBe("AgenticOps AI");
    expect(body.result.capabilities.tools.listChanged).toBe(false);
  });

  it("lists only the analysis tool", async () => {
    const response = await POST(
      rpc({ jsonrpc: "2.0", id: "tools", method: "tools/list" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.tools).toHaveLength(1);
    expect(body.result.tools[0].name).toBe("analyze_communication_risk");
    expect(body.result.tools[0].inputSchema.properties.content.maxLength).toBe(2000);
  });

  it("invokes analyze_communication_risk", async () => {
    const response = await POST(
      rpc({
        jsonrpc: "2.0",
        id: "call",
        method: "tools/call",
        params: {
          name: "analyze_communication_risk",
          arguments: {
            content: "Fake admin says DM me your private key for support.",
            context: "web3-community",
            source: "discord",
          },
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.structuredContent.requiresHumanReview).toBe(true);
    expect(body.result.structuredContent.riskSignals.join(" ")).toContain("SEC-002");
    expect(body.result.content[0].type).toBe("text");
  });

  it("rejects unknown tools without exposing internals", async () => {
    const response = await POST(
      rpc({
        jsonrpc: "2.0",
        id: "bad-tool",
        method: "tools/call",
        params: { name: "gmail_sync", arguments: {} },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toBe("Unknown tool.");
    expect(JSON.stringify(body)).not.toContain("token");
  });

  it("rejects malformed JSON and oversized requests", async () => {
    const malformed = await POST(rpc("{bad json"));
    const malformedBody = await malformed.json();
    const oversized = await POST(
      rpc({
        jsonrpc: "2.0",
        id: "big",
        method: "tools/call",
        params: {
          name: "analyze_communication_risk",
          arguments: { content: "x".repeat(12_100) },
        },
      }),
    );
    const oversizedBody = await oversized.json();

    expect(malformed.status).toBe(400);
    expect(malformedBody.error.code).toBe(-32700);
    expect(oversized.status).toBe(413);
    expect(oversizedBody.error.message).toBe("Request payload is too large.");
  });
});
