# OKX.AI ASP Submission Readiness

Date: 2026-07-23

## Recommended ASP Listing

- ASP name: AgenticOps AI
- Service name: AgenticOps Communication Risk & Intelligence Analysis
- One-sentence value proposition: Analyze communication messages for scams, phishing, intent, sentiment, priority, recommended actions and human-review requirements.
- Service category: Communication Intelligence / Security Analysis
- Recommended listing mode: A2MCP
- Rationale: The service is a standardized callable analysis API with bounded request/response schemas. It does not require negotiation, delayed delivery or custom scoping, so A2MCP is a better fit than A2A.
- Public endpoint: `https://agenticopsai.xyz/api/okx/analyze`
- MCP endpoint: `https://agenticopsai.xyz/api/mcp`
- x402 endpoint: Not implemented in this release.
- Price: Recommended free listing for hackathon validation unless OKX requires a nonzero fee. If a paid listing is required, x402 must be implemented and tested separately before listing.
- X Layer network: `eip155:196` for any future x402 payment-gated listing.
- Tool name: `analyze_communication_risk`
- Tool description: Analyze a communication message for intent, sentiment, priority, security risk, recommended actions and human-review requirements.
- Health URL: `https://agenticopsai.xyz/api/v1/health`

## Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["content"],
  "properties": {
    "content": {
      "type": "string",
      "minLength": 1,
      "maxLength": 2000
    },
    "context": {
      "type": "string",
      "enum": [
        "web3-community",
        "customer-support",
        "business-email",
        "social-comment",
        "general"
      ],
      "default": "general"
    },
    "source": {
      "type": "string",
      "enum": ["manual", "gmail", "telegram", "discord", "facebook", "instagram"],
      "default": "manual"
    }
  }
}
```

## Output Schema

```json
{
  "summary": "string",
  "intent": "string",
  "sentiment": "string",
  "priority": "low | medium | high | critical",
  "riskLevel": "low | medium | high | critical",
  "riskSignals": ["string"],
  "recommendedAction": "string",
  "suggestedReplyOutline": "string",
  "requiresHumanReview": true,
  "confidence": 0,
  "explanation": "string"
}
```

## Example Invocation

```bash
curl -X POST https://agenticopsai.xyz/api/okx/analyze \
  -H "content-type: application/json" \
  -d '{
    "content": "Urgent wallet verification: send your seed phrase now.",
    "context": "web3-community",
    "source": "telegram"
  }'
```

## Example Response

```json
{
  "summary": "A message asks for wallet recovery material and requires human review.",
  "intent": "Credential theft or scam attempt.",
  "sentiment": "neutral",
  "priority": "critical",
  "riskLevel": "critical",
  "riskSignals": ["SEC-001: Seed phrase request"],
  "recommendedAction": "Escalate immediately and warn the user not to share recovery material.",
  "suggestedReplyOutline": "Suggested reply for human review: Never share seed phrases, private keys, passwords or OTP codes. Use only official support links.",
  "requiresHumanReview": true,
  "confidence": 0.8,
  "explanation": "Source telegram was treated as untrusted input. Deterministic risk was CRITICAL; final risk is CRITICAL."
}
```

Exact phrasing may vary when AI enrichment is configured. Deterministic risk cannot be lowered by AI.

## Current Limitations

- The OKX-facing service is analyze-only.
- The public endpoint does not require users to connect Gmail, Discord, Telegram, Facebook or Instagram.
- Gmail remains `gmail.readonly`.
- Provider sending, moderation, deletion, ad actions, CRM writes and autonomous execution are not implemented.
- No x402 payment gate is active.
- No tenant authentication is implemented yet.
- Browser-local Web3 batch reports are not durable production storage.

## Human-Approval Boundary

Every suggested reply or action is recommendation-only. AgenticOps AI does not send emails, reply in Telegram, reply in Discord, reply through Meta, moderate users, launch ads, spend money, modify Gmail or execute external actions from the OKX service.

## Privacy Statement

The OKX service processes only the submitted message content and request metadata needed for analysis. It does not expose OAuth tokens, provider payloads, private integration events or approval mutation APIs. Production integrations use redaction and durable storage where configured; the OKX endpoint itself is stateless.

## Data Retention Behavior

`/api/okx/analyze` does not persist the submitted request body. Existing dashboard and integration repositories have their own documented retention behavior.

## Required OKX Listing Fields

- Name: AgenticOps AI
- Service title: AgenticOps Communication Risk & Intelligence Analysis
- Service type: A2MCP
- Endpoint: `https://agenticopsai.xyz/api/mcp`
- Tool: `analyze_communication_risk`
- Documentation: `https://agenticopsai.xyz/docs/asp`
- Website: `https://agenticopsai.xyz`
- Health: `https://agenticopsai.xyz/api/v1/health`
- Fee: free for hackathon validation unless OKX requires a paid fee.

## Manual Owner Actions

1. Confirm whether OKX.AI accepts a free A2MCP service listing for this hackathon.
2. If OKX requires payment, approve a separate x402 implementation prompt before listing as paid.
3. Confirm the final support contact placeholder.
4. Run the post-registration callable-agent test against the listed MCP endpoint.
5. Do not submit duplicate ASP listings.

## Pre-Submission Checklist

- [ ] `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit --incremental false` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:production` passes against `https://agenticopsai.xyz`.
- [ ] `npm audit --omit=dev` reports no production vulnerabilities or documented acceptable residual risk.
- [ ] No secrets or `.env` files are staged.
- [ ] Health URL returns healthy JSON.
- [ ] MCP initialize, tool discovery and tool invocation work.
- [ ] x402 is either implemented and live-tested, or explicitly not used.

## Post-Registration Callable-Agent Test

Invoke `analyze_communication_risk` through the OKX.AI listing with:

```json
{
  "content": "Fake admin says send your private key for support.",
  "context": "web3-community",
  "source": "discord"
}
```

Expected outcome: high or critical risk, deterministic risk signal, human review required and no external action executed.

## Latch402 Checklist

- Current status: not enabled.
- If enabled later, advertise X Layer mainnet `eip155:196`.
- Use official OKX payment SDK or documented middleware only.
- Keep health and metadata endpoints free.
- Add tests for unpaid 402, malformed payment, failed verification and successful mocked verification.
- Never claim x402 works until a real live paid request is verified.
