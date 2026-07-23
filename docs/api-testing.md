# AgenticOps AI API Testing Guide

Use placeholder values only. Do not paste real OAuth codes, provider tokens,
webhook signatures, user messages or provider IDs into shared examples.

## Public Health

```bash
curl https://YOUR_DEPLOYMENT_URL/api/v1/health
```

Expected status: `200`.

## Analyze One Web3 Community Message

```bash
curl -X POST https://YOUR_DEPLOYMENT_URL/api/v1/analyse \
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
curl -X POST https://YOUR_DEPLOYMENT_URL/api/v1/analyse/batch \
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
curl https://YOUR_DEPLOYMENT_URL/api/integrations/health
```

Read one sanitized workflow detail:

```bash
curl https://YOUR_DEPLOYMENT_URL/api/integrations/messages/WORKFLOW_ID_PLACEHOLDER
```

Internal approval update:

```bash
curl -X PATCH https://YOUR_DEPLOYMENT_URL/api/integrations/approvals/WORKFLOW_ID_PLACEHOLDER \
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

- `/api/v1/analyse`: bounded by route validation.
- `/api/v1/analyse/batch`: maximum 25 messages.
- `/api/integrations/messages`: maximum request body length is 100 KB.
- Meta and Telegram webhooks reject oversized payloads.
- Gmail sync caps import size and uses `gmail.readonly` only.
