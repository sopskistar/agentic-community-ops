# OKX.AI Listing Copy

## Agent Name

AgenticOps AI

## Short Description

AI communication intelligence for scam, phishing, intent, priority and human-review analysis.

## Full Description

AgenticOps AI analyzes communication messages using deterministic security rules, AI-assisted classification, structured reasoning and human-review boundaries. The current implemented contexts are Web3 Community Security and Business Communication Intelligence. The OKX-callable service accepts a single bounded message and returns risk level, intent, sentiment, priority, risk signals, recommended action, suggested reply outline, confidence and explanation.

AgenticOps AI is analyze-only. It does not send replies, modify Gmail, moderate communities, launch ads, spend money or execute external provider actions.

## Clear Use Case

A Web3 project, community manager or support operator can submit a suspicious message and receive an explainable risk classification plus a safe moderator reply outline for human review.

## Supported Inputs

```json
{
  "content": "string",
  "context": "web3-community | customer-support | business-email | social-comment | general",
  "source": "manual | gmail | telegram | discord | facebook | instagram"
}
```

## Returned Outputs

- Summary
- Intent
- Sentiment
- Priority
- Risk level
- Risk signals
- Recommended action
- Suggested reply outline
- Human-review requirement
- Confidence
- Explanation

## Pricing Explanation

Recommended hackathon listing: free A2MCP service. x402 payment is not enabled in this release. If OKX requires a paid listing, payment-gating must be implemented and live-tested separately before submission.

## Safety And Human Review

All replies and actions are suggestions only. Human approval is required before any external response or action. The service never asks for seed phrases, private keys, passwords, OTP codes or wallet verification payments.

## Example Prompt

Analyze this Telegram message: “Urgent wallet verification. Send your seed phrase now or your funds will be locked.”

## Example Result

```json
{
  "riskLevel": "critical",
  "priority": "critical",
  "riskSignals": ["SEC-001: Seed phrase request"],
  "requiresHumanReview": true,
  "recommendedAction": "Escalate immediately and warn the user not to share recovery material.",
  "suggestedReplyOutline": "Suggested reply for human review: Never share seed phrases, private keys, passwords or OTP codes. Use only official support links."
}
```

## Website

https://agenticopsai.xyz

## Documentation URL

https://agenticopsai.xyz/docs/asp

## Support Contact Placeholder

Replace before submission: `support@example.com`

## Category Recommendation

Communication Intelligence / Web3 Security / AI Safety
