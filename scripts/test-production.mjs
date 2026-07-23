const baseUrl = process.env.PRODUCTION_BASE_URL || "https://agenticopsai.xyz";
const timeoutMs = 15_000;

const checks = [];

function addCheck(name, fn) {
  checks.push({ name, fn });
}

function withTimeout(promise, label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return promise(controller.signal).finally(() => clearTimeout(timer)).catch((error) => {
    throw new Error(`${label} failed: ${error instanceof Error ? error.message : "request failed"}`);
  });
}

async function fetchWithTimeout(path, init = {}) {
  return withTimeout(
    (signal) => fetch(new URL(path, baseUrl), { ...init, signal }),
    `${init.method || "GET"} ${path}`,
  );
}

async function expectStatus(response, expected, label) {
  if (response.status !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${response.status}`);
  }
}

function expectHeaderIncludes(response, header, expected, label) {
  const value = response.headers.get(header) || "";
  if (!value.includes(expected)) {
    throw new Error(`${label}: expected ${header} to include ${expected}, received ${value || "<empty>"}`);
  }
}

function assertNoLeakage(text, label) {
  const forbidden = [
    "OPENAI_API_KEY",
    "DISCORD_BOT_TOKEN",
    "META_APP_SECRET",
    "GOOGLE_CLIENT_SECRET",
    "OAUTH_TOKEN_ENCRYPTION_KEY",
    "INTERNAL_INTEGRATION_SECRET",
    "stack",
    "at POST",
  ];
  for (const value of forbidden) {
    if (text.includes(value)) {
      throw new Error(`${label}: leaked forbidden diagnostic text ${value}`);
    }
  }
}

async function readJson(response, label) {
  expectHeaderIncludes(response, "content-type", "application/json", label);
  const text = await response.text();
  assertNoLeakage(text, label);
  return JSON.parse(text);
}

addCheck("homepage reachable", async () => {
  const response = await fetchWithTimeout("/");
  await expectStatus(response, 200, "homepage");
  expectHeaderIncludes(response, "content-type", "text/html", "homepage");
});

addCheck("robots reachable", async () => {
  const response = await fetchWithTimeout("/robots.txt");
  await expectStatus(response, 200, "robots");
  expectHeaderIncludes(response, "content-type", "text/plain", "robots");
});

addCheck("sitemap reachable", async () => {
  const response = await fetchWithTimeout("/sitemap.xml");
  await expectStatus(response, 200, "sitemap");
  expectHeaderIncludes(response, "content-type", "application/xml", "sitemap");
});

addCheck("health endpoint returns JSON", async () => {
  const response = await fetchWithTimeout("/api/v1/health");
  await expectStatus(response, 200, "health");
  const body = await readJson(response, "health");
  if (body.status !== "healthy") {
    throw new Error(`health: expected healthy, received ${body.status}`);
  }
});

addCheck("legacy analysis endpoint validates missing fields", async () => {
  const response = await fetchWithTimeout("/api/v1/analyse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  await expectStatus(response, 400, "legacy analysis missing fields");
  const body = await readJson(response, "legacy analysis missing fields");
  if (body.error?.code !== "INVALID_REQUEST") {
    throw new Error("legacy analysis missing fields: expected INVALID_REQUEST");
  }
});

addCheck("legacy analysis endpoint rejects invalid JSON", async () => {
  const response = await fetchWithTimeout("/api/v1/analyse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{bad json",
  });
  await expectStatus(response, 400, "legacy analysis invalid JSON");
  const body = await readJson(response, "legacy analysis invalid JSON");
  if (body.error?.code !== "INVALID_JSON") {
    throw new Error("legacy analysis invalid JSON: expected INVALID_JSON");
  }
});

addCheck("legacy analysis endpoint returns valid JSON", async () => {
  const response = await fetchWithTimeout("/api/v1/analyse", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      projectId: "demo-fictional-atlas-dao",
      message: {
        content: "Fake admin says send your seed phrase for wallet verification.",
        source: "MANUAL",
      },
    }),
  });
  await expectStatus(response, 200, "legacy analysis valid");
  const body = await readJson(response, "legacy analysis valid");
  if (body.finalRisk !== "CRITICAL") {
    throw new Error(`legacy analysis valid: expected CRITICAL, received ${body.finalRisk}`);
  }
});

addCheck("OKX analysis endpoint validates and analyzes", async () => {
  const missing = await fetchWithTimeout("/api/okx/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ source: "manual" }),
  });
  await expectStatus(missing, 400, "OKX analysis missing fields");
  await readJson(missing, "OKX analysis missing fields");

  const oversized = await fetchWithTimeout("/api/okx/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: "x".repeat(2100), source: "manual", context: "general" }),
  });
  await expectStatus(oversized, 400, "OKX analysis oversized content");
  await readJson(oversized, "OKX analysis oversized content");

  const valid = await fetchWithTimeout("/api/okx/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content: "Urgent wallet verification requires your seed phrase.",
      context: "web3-community",
      source: "telegram",
    }),
  });
  await expectStatus(valid, 200, "OKX analysis valid");
  const body = await readJson(valid, "OKX analysis valid");
  if (body.riskLevel !== "critical" || body.requiresHumanReview !== true) {
    throw new Error("OKX analysis valid: expected critical human-review result");
  }
});

addCheck("MCP endpoint initializes, lists tools and calls analysis", async () => {
  const initialize = await fetchWithTimeout("/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" }),
  });
  await expectStatus(initialize, 200, "MCP initialize");
  await readJson(initialize, "MCP initialize");

  const list = await fetchWithTimeout("/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
  });
  await expectStatus(list, 200, "MCP tools/list");
  const tools = await readJson(list, "MCP tools/list");
  if (tools.result?.tools?.[0]?.name !== "analyze_communication_risk") {
    throw new Error("MCP tools/list: expected analyze_communication_risk");
  }

  const call = await fetchWithTimeout("/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "analyze_communication_risk",
        arguments: {
          content: "Fake admin asks for a private key.",
          context: "web3-community",
          source: "discord",
        },
      },
    }),
  });
  await expectStatus(call, 200, "MCP tools/call");
  const body = await readJson(call, "MCP tools/call");
  if (body.result?.structuredContent?.requiresHumanReview !== true) {
    throw new Error("MCP tools/call: expected human review");
  }
});

addCheck("unsupported method is rejected", async () => {
  const response = await fetchWithTimeout("/api/okx/analyze", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: "hello" }),
  });
  if (![404, 405].includes(response.status)) {
    throw new Error(`unsupported method: expected 404 or 405, received ${response.status}`);
  }
});

console.log(`Running production smoke tests against ${baseUrl}`);
for (const check of checks) {
  await check.fn();
  console.log(`ok - ${check.name}`);
}
console.log("Production smoke tests passed.");
