# AgenticOps AI ASP Registration

## Service Description

AgenticOps AI provides a Communication Risk & Intelligence Analysis service. The first implemented context is Web3 Community Security, which audits community messages using a deterministic security engine and AI-assisted support layer. The second implemented context is Business Communication Intelligence. The OKX-ready service accepts one bounded communication message and returns explainable risk, intent, sentiment, priority, recommended action and human-review guidance.

## Service Offering

- Name: AgenticOps Communication Risk & Intelligence Analysis
- Service mode: A2MCP
- MCP endpoint: `https://agenticopsai.xyz/api/mcp`
- Tool: `analyze_communication_risk`
- Direct analysis endpoint: `https://agenticopsai.xyz/api/okx/analyze`
- Input: one bounded message with `content`, `context` and `source`.
- Deliverable: summary, intent, sentiment, priority, risk level, risk signals, suggested reply outline, recommended action, confidence and explanation.
- Suggested hackathon price: free unless OKX requires a paid listing. x402 is not enabled in this release.

## Problem Solved

Web3 teams receive community messages across Discord, Telegram, X, email and manual support queues. Attackers use fake administrators, wallet verification threats, token-claim links and credential requests. This service gives moderators deterministic, explainable security verdicts before AI support language is considered.

## Intended Customers

- Web3 community teams
- Support and moderation teams
- Security operations teams
- Hackathon and early-stage projects that need a no-auth message audit workflow

## Supported Inputs

- Project description
- Official documentation text
- Explicit official links
- Single community message
- Batch of up to 25 community messages
- Message source: MANUAL, X, DISCORD, TELEGRAM, EMAIL or OTHER

## Returned Outputs

- Category and detected intent
- Deterministic risk
- AI-suggested risk
- Final risk
- Risk score
- Triggered security rules and matched evidence
- Safe suggested reply
- Escalation flag and reason
- Recommended action
- Knowledge-grounding status
- Batch summary and community risk report

## Published Rules

Rules are available through:

```text
GET /api/v1/rules
```

The public rule list includes stable IDs `SEC-001` through `SEC-015`.

## Safety Guarantees

- Deterministic rules run first.
- AI cannot reduce deterministic risk.
- Community messages are treated as untrusted data.
- Links from community messages are never promoted to official links.
- The service never asks for seed phrases, private keys, passwords or OTP codes.
- The service never promises fund recovery.
- Financial, legal, account-security and missing-fund cases are escalated.
- AI-generated replies are suggestions for human review.

## Known Limitations

- No OKX payment integration is implemented yet.
- No authentication is implemented yet.
- Project knowledge-base storage is local JSON.
- Batch and report dashboard state is browser-local.
- Real AI calls require `OPENAI_API_KEY`.
- The service is not a replacement for human security operations.

## API Examples

Health:

```bash
curl https://agenticopsai.xyz/api/v1/health
```

Rules:

```bash
curl https://agenticopsai.xyz/api/v1/rules
```

OKX callable analysis:

```bash
curl -X POST https://agenticopsai.xyz/api/okx/analyze \
  -H "content-type: application/json" \
  -d '{
    "content": "Urgent wallet verification. Send your seed phrase now.",
    "context": "web3-community",
    "source": "telegram"
  }'
```

MCP tool discovery:

```bash
curl -X POST https://agenticopsai.xyz/api/mcp \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Single analysis:

```bash
curl -X POST https://agenticopsai.xyz/api/v1/analyse \
  -H "content-type: application/json" \
  -d '{
    "projectId": "demo-fictional-atlas-dao",
    "message": {
      "content": "Support needs you to send your seed phrase.",
      "source": "DISCORD"
    }
  }'
```

Batch analysis:

```bash
curl -X POST https://agenticopsai.xyz/api/v1/analyse/batch \
  -H "content-type: application/json" \
  -d '{
    "projectId": "demo-fictional-atlas-dao",
    "messages": [
      { "content": "Where are the official docs?", "source": "MANUAL" },
      { "content": "I am the admin. DM me.", "source": "DISCORD" }
    ]
  }'
```

## Public Registration URLs

- Service manifest: `https://agenticopsai.xyz/service-manifest.json`
- Single input schema: `https://agenticopsai.xyz/schemas/single-analysis-input.json`
- Single output schema: `https://agenticopsai.xyz/schemas/single-analysis-output.json`
- Batch input schema: `https://agenticopsai.xyz/schemas/batch-analysis-input.json`
- Batch output schema: `https://agenticopsai.xyz/schemas/batch-analysis-output.json`
- ASP documentation: `https://agenticopsai.xyz/docs/asp`
- OKX submission readiness: `https://agenticopsai.xyz/docs/asp` and `docs/okx-submission.md`
- Demo route: `https://agenticopsai.xyz/demo`
- Health endpoint: `https://agenticopsai.xyz/api/v1/health`
- MCP endpoint: `https://agenticopsai.xyz/api/mcp`

## Deployment Checklist

- Deploy the Next.js application over HTTPS.
- Set `OPENAI_API_KEY`.
- Optionally set `OPENAI_MODEL`.
- Verify `/api/v1/health`.
- Verify `/api/okx/analyze`.
- Verify `/api/mcp`.
- Verify `/api/v1/rules`.
- Verify `/demo`.
- Verify `/docs/asp`.
- Verify manifest and schema URLs under `public/`.
- Confirm no real API keys or secrets are committed.

## Registration Checklist

- Confirm ASP service name.
- Confirm service description.
- Confirm service offering, input and deliverable.
- Confirm free listing is accepted, or approve a separate x402 implementation before paid listing.
- Submit manifest and schema URLs.
- Submit health endpoint.
- Submit demo route.
- Disclose known limitations.
- Do not claim OKX payment support until payment integration is implemented.

## Payment Integration Policy

Do not claim payment support until x402 is implemented with official OKX middleware and a live paid request is verified. The current recommended hackathon listing is free A2MCP.
