# Agentic Community Ops ASP Registration

## Service Description

Agentic Community Ops audits Web3 community messages using a deterministic security engine and AI-assisted support layer. It detects scams, phishing, fake administrators, wallet threats and transaction issues, then produces explainable risk verdicts, safe reply suggestions and escalation actions.

## Service Offering

- Name: Community Message Security Audit
- Input: A project description, official documentation and up to 25 community messages.
- Deliverable: Structured risk levels, triggered rules, suggested replies, escalations and a community risk report.
- Suggested demonstration price: 1 USDC per audit.

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
curl https://YOUR_DEPLOYMENT_URL/api/v1/health
```

Rules:

```bash
curl https://YOUR_DEPLOYMENT_URL/api/v1/rules
```

Single analysis:

```bash
curl -X POST https://YOUR_DEPLOYMENT_URL/api/v1/analyse \
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
curl -X POST https://YOUR_DEPLOYMENT_URL/api/v1/analyse/batch \
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

Replace `YOUR_DEPLOYMENT_URL` after deployment:

- Service manifest: `https://YOUR_DEPLOYMENT_URL/service-manifest.json`
- Single input schema: `https://YOUR_DEPLOYMENT_URL/schemas/single-analysis-input.json`
- Single output schema: `https://YOUR_DEPLOYMENT_URL/schemas/single-analysis-output.json`
- Batch input schema: `https://YOUR_DEPLOYMENT_URL/schemas/batch-analysis-input.json`
- Batch output schema: `https://YOUR_DEPLOYMENT_URL/schemas/batch-analysis-output.json`
- ASP documentation: `https://YOUR_DEPLOYMENT_URL/docs/asp`
- Demo route: `https://YOUR_DEPLOYMENT_URL/demo`
- Health endpoint: `https://YOUR_DEPLOYMENT_URL/api/v1/health`

## Deployment Checklist

- Deploy the Next.js application over HTTPS.
- Set `OPENAI_API_KEY`.
- Optionally set `OPENAI_MODEL`.
- Verify `/api/v1/health`.
- Verify `/api/v1/rules`.
- Verify `/demo`.
- Verify `/docs/asp`.
- Verify manifest and schema URLs under `public/`.
- Confirm no real API keys or secrets are committed.

## Registration Checklist

- Confirm ASP service name.
- Confirm service description.
- Confirm service offering, input and deliverable.
- Confirm suggested demonstration price: 1 USDC per audit.
- Submit manifest and schema URLs.
- Submit health endpoint.
- Submit demo route.
- Disclose known limitations.
- Do not claim OKX payment support until payment integration is implemented.

## Payment Integration Policy

Do not implement payment integration until the core product is deployed and working. The current price is a demonstration suggestion only.
