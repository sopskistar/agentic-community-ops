# AgenticOps AI API Testing Guide

Use placeholder values only. Do not paste real OAuth codes, provider tokens,
webhook signatures, user messages or provider IDs into shared examples.

## Public Health

```bash
curl https://agenticopsai.xyz/api/v1/health
```

Expected status: `200`.

## OKX-Callable Analysis Service

Recommended OKX service endpoint:

```bash
curl -X POST https://agenticopsai.xyz/api/okx/analyze \
  -H "content-type: application/json" \
  -d '{
    "content": "Urgent wallet verification. Send your seed phrase now.",
    "context": "web3-community",
    "source": "telegram"
  }'
```

Expected status: `200`. Expected response includes `summary`, `intent`,
`sentiment`, `priority`, `riskLevel`, `riskSignals`, `recommendedAction`,
`suggestedReplyOutline`, `requiresHumanReview`, `confidence` and `explanation`.

Missing-field check:

```bash
curl -X POST https://agenticopsai.xyz/api/okx/analyze \
  -H "content-type: application/json" \
  -d '{}'
```

Expected status: `400` with a sanitized `INVALID_REQUEST` error.

## MCP Tool Endpoint

Initialize:

```bash
curl -X POST https://agenticopsai.xyz/api/mcp \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'
```

List tools:

```bash
curl -X POST https://agenticopsai.xyz/api/mcp \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

Call the only exposed tool:

```bash
curl -X POST https://agenticopsai.xyz/api/mcp \
  -H "content-type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "analyze_communication_risk",
      "arguments": {
        "content": "Fake admin asks for a private key.",
        "context": "web3-community",
        "source": "discord"
      }
    }
  }'
```

The MCP endpoint exposes analysis only. It does not expose Gmail sync, OAuth,
provider secrets, private integration events or approval mutation.

## Analyze One Web3 Community Message

```bash
curl -X POST https://agenticopsai.xyz/api/v1/analyse \
  -H "content-type: application/json" \
  -d '{
    "projectId": "demo-fictional-atlas-dao",
    "message": {
      "content": "Support asks for my seed phrase.",
      "source": "DISCORD"
    }
  }'
```

## Batch Analysis

```bash
curl -X POST https://agenticopsai.xyz/api/v1/analyse/batch \
  -H "content-type: application/json" \
  -d '{
    "projectId": "demo-fictional-atlas-dao",
    "messages": [
      { "content": "Where are the docs?", "source": "MANUAL" },
      { "content": "DM me your private key.", "source": "TELEGRAM" }
    ]
  }'
```

Batch input is bounded to 25 messages.

## Internal Integration Processing Contract

`POST /api/integrations/messages` is for trusted workers only.

Required header:

```text
x-agenticops-integration-secret: INTERNAL_SECRET_PLACEHOLDER
```

Discord heartbeat payload:

```json
{
  "type": "heartbeat",
  "provider": "discord"
}
```

Normalized message payload:

```json
{
  "id": "discord:HASHED_MESSAGE_ID",
  "externalId": "HASHED_OR_REDACTED_EXTERNAL_ID",
  "source": "discord",
  "channelId": "HASHED_CHANNEL_ID",
  "conversationId": "HASHED_CONVERSATION_ID",
  "senderId": "HASHED_SENDER_ID",
  "senderName": "safe-display-name",
  "text": "Bounded placeholder message for testing.",
  "timestamp": "2026-07-23T12:00:00.000Z",
  "metadata": {
    "channel": "discord"
  }
}
```

Do not disable internal-secret validation for testing.

## Meta Webhook Verification

Meta calls:

```text
GET /api/webhooks/meta?hub.mode=subscribe&hub.verify_token=VERIFY_TOKEN_PLACEHOLDER&hub.challenge=CHALLENGE
```

The route returns the challenge only when the verify token matches
`META_VERIFY_TOKEN`.

`POST /api/webhooks/meta` requires a valid Meta signature when
`META_APP_SECRET` is configured. Do not disable signature validation.

## Telegram Webhook

`POST /api/webhooks/telegram` accepts Telegram updates and validates
`x-telegram-bot-api-secret-token` when `TELEGRAM_WEBHOOK_SECRET` is configured.

Unsupported update types are ignored safely.

## Integration Workspace APIs

Read-only health summary:

```bash
curl https://agenticopsai.xyz/api/integrations/health
```

Read one sanitized workflow detail:

```bash
curl https://agenticopsai.xyz/api/integrations/messages/WORKFLOW_ID_PLACEHOLDER
```

Internal approval update:

```bash
curl -X PATCH https://agenticopsai.xyz/api/integrations/approvals/WORKFLOW_ID_PLACEHOLDER \
  -H "content-type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Reviewed internally.",
    "actorLabel": "Internal reviewer"
  }'
```

Approval updates are internal only. They do not send Gmail, Telegram, Discord,
Facebook or Instagram replies and do not execute provider actions.

## Safe Limits

- `/api/okx/analyze`: maximum JSON body length is 12 KB and message content is
  bounded to 2,000 characters.
- `/api/mcp`: maximum JSON-RPC body length is 12 KB.
- `/api/v1/analyse`: maximum JSON body length is 12 KB and message content is
  bounded to 2,000 characters.
- `/api/v1/analyse/batch`: maximum JSON body length is 75 KB and maximum batch
  size is 25 messages.
- `/api/integrations/messages`: maximum request body length is 100 KB.
- Meta and Telegram webhooks reject oversized payloads.
- Gmail sync caps import size and uses `gmail.readonly` only.
