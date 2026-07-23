# OKX.AI Hackathon Demo Script

Target length: 90 seconds or less.

## Script

AgenticOps AI is an AI Communication Intelligence Platform for teams that need to understand risky or high-priority messages before replying.

The current working product has two implemented contexts: Web3 Community Security and Business Communication Intelligence. For this hackathon, the OKX-callable service focuses on communication risk and intent analysis.

Here is a suspicious Web3 community message: “Urgent wallet verification. Send your seed phrase now or your funds will be locked.”

AgenticOps AI normalizes the message, runs deterministic security rules first, then adds AI-assisted classification. The result is critical risk because the message triggers the seed-phrase rule. The response includes the risk level, intent, risk signals, recommended action, confidence and a safe reply outline.

The key point is explainability: the model is not just saying “dangerous.” It shows which deterministic rule fired and why a human moderator should review before any action.

The platform already supports broader communication architecture, including Gmail readonly analysis, Telegram, Discord Gateway, Facebook Messenger and Instagram webhook foundations, plus document intelligence for TXT, PDF, DOCX, CSV and XLSX.

For OKX.AI, the public A2MCP endpoint exposes only one safe tool: `analyze_communication_risk`. It does not expose provider credentials, private inboxes, approval mutation or autonomous sending.

Future work expands this into business, email, marketing and audit intelligence, but the current listing remains honest: analyze messages, explain risk and keep humans in control.
