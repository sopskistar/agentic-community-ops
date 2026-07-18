# Implementation Plan

Date: 2026-07-18

This plan preserves the existing deployed product. Each task should be handled in a separate Codex prompt with tests and validation before moving on.

## Branding And Positioning

The website now presents Agentic Ops as an AI Communication Intelligence Platform. The current live capability remains the Web3 Community Security MVP; roadmap features for business intelligence, document intelligence, channel integrations, AI customer operations, omnichannel expansion, workflow automation and enterprise administration must remain clearly labeled as future work until implemented.

The official logo asset is `public/logo/Agentic-Ops.jpg`. It should be reused as-is and not regenerated, recolored, cropped, distorted or substituted.

The homepage now uses platform-wide positioning: one AI communication engine, multiple future communication channels, and Web3 Community Security as the first implemented context. It includes roadmap-only sections for Business Communication Intelligence, Communication Contexts, the platform-wide message pipeline and future architecture.

On 2026-07-18, the platform UI received a polish pass without adding features or changing contracts. Homepage status labels, roadmap cards, the communication pipeline, demo framing, rules catalog, dashboard profile cards and empty states were tightened so implemented capabilities and roadmap items are easier to distinguish.

## Stage 1: Universal Web3 Community Security

1. Add a type-only normalized message model. Completed 2026-07-18.
   - Scope: create `lib/messages/types.ts` and Zod schemas without changing API behavior.
   - Delivered: `lib/messages/constants.ts`, `lib/messages/types.ts`, `lib/messages/schemas.ts`, `lib/messages/channel-profiles.ts`, `lib/messages/index.ts`, and `lib/messages/schemas.test.ts`.
   - Tests: schema parsing covers valid/invalid normalized messages, enum validation, channel profile validation, attachment validation, reply state validation and audit event validation.

2. Add message normalization helpers.
   - Scope: map existing `AnalyseApiRequest` into `NormalizedMessage`; keep current API responses unchanged.
   - Tests: current route tests plus new mapper tests.

3. Refactor analysis orchestration to accept normalized messages internally.
   - Scope: preserve `/api/v1/analyse` and `/api/v1/analyse/batch` contracts while routing through normalized input.
   - Tests: prove final risk and output shape do not regress.

4. Improve URL extraction and official-link comparison.
   - Scope: deterministic URL parser, official-domain checks, suspicious URL evidence.
   - Tests: shortened, obfuscated, lookalike, official, and safe educational cases.

5. Add reusable channel adapter contracts for Discord and Telegram.
   - Scope: TypeScript interfaces and fixture-based payload mappers only; no live credentials.
   - Tests: normalize sample webhook/bot payloads into the common model.

6. Add API authentication and tenant-boundary design before public A2A expansion.
   - Scope: document and implement a minimal API-key or auth abstraction only after approval.
   - Tests: unauthorized, authorized, tenant mismatch, and existing demo route behavior.

7. Replace or wrap local JSON storage for production readiness.
   - Scope: first add repository contracts for messages, analyses, reports, audits, and tenants; choose the concrete database only after approval.
   - Tests: repository contract tests.

## Stage 2: Business Intelligence Dashboard

Status: roadmap. Homepage and documentation describe these capabilities as planned only; no uploads, external integrations or BI-specific analysis have been implemented yet.

1. Add BI analysis types and schemas.
   - Scope: intent, sentiment, priority, leads, FAQ candidate, escalation requirement, summary, and actions.
   - Tests: schema and merge-policy tests.

2. Add conversation paste support.
   - Scope: parser that splits pasted conversation text into normalized messages with stable ordering.
   - Tests: common transcript formats and malformed input.

3. Add plain-text and CSV ingestion.
   - Scope: local upload UI/API, size limits, row mapping, errors per row.
   - Tests: fixture uploads and validation failures.

4. Add Excel ingestion.
   - Scope: parser dependency, sheet/column mapping, row limits.
   - Tests: `.xlsx` fixtures with valid and invalid rows.

5. Add PDF and Word ingestion.
   - Scope: text extraction only; no OCR unless separately approved.
   - Tests: parser success, parser failure, file size/type rejection.

6. Add BI report metrics.
   - Scope: measured dashboard panels for intent, sentiment, priority, complaints, leads, FAQs, and escalations.
   - Tests: deterministic summary calculations.

## Stage 3: Communication Integrations

1. Add integration registry and channel adapter test harness.
   - Scope: provider-neutral configuration types, enabled/disabled states, and fixture tests.
   - Tests: disabled integrations cannot ingest or send.

2. Implement website live chat as the first local-first channel.
   - Scope: no external account required; normalized messages enter the same pipeline.
   - Tests: session creation, message ingestion, analysis, approval-safe reply suggestion.

3. Implement email sandbox adapter.
   - Scope: provider abstraction and inbound fixture/sandbox support.
   - Tests: MIME/text normalization, attachments as metadata, no auto-send by default.

4. Implement Discord sandbox adapter.
   - Scope: webhook/bot payload normalization and signature/token validation where applicable.
   - Tests: fixture payloads, duplicate handling, disabled send.

5. Implement Telegram sandbox adapter.
   - Scope: bot webhook normalization and outbound send abstraction behind configuration.
   - Tests: fixture payloads, duplicate handling, disabled send.

6. Implement Facebook Pages and Instagram Business development-mode adapters.
   - Scope: webhook verification, payload normalization, no production claims.
   - Tests: Meta fixture events and credential-missing failures.

## Stage 4: AI Auto-Reply And Human Approval

1. Add reply suggestion records.
   - Scope: persist generated reply, model/provider metadata, prompt version, source analysis, and status.
   - Tests: suggestion creation and no external send.

2. Add human approval workflow.
   - Scope: queue, approve/reject states, reviewer identity, comments, timestamps.
   - Tests: state transitions and tenant boundaries.

3. Add automation rules.
   - Scope: tenant-configurable conditions for low-risk cases, default disabled.
   - Tests: rule evaluation, high-risk blocking, missing-config blocking.

4. Add outbound send service.
   - Scope: provider-neutral send interface; require explicit channel authorization and audit event.
   - Tests: no send without configuration, mock sends, failure handling.

5. Add audit log.
   - Scope: immutable events for analysis, AI suggestions, approvals, automated decisions, external sends, and failures.
   - Tests: audit entries for all state transitions.

6. Add operator controls.
   - Scope: kill switch, per-channel auto-reply enablement, escalation thresholds.
   - Tests: automation cannot bypass disabled or high-risk settings.

## External Integration Approval Matrix

| Integration | Developer account | OAuth | Webhooks | API credentials | Paid service | Platform review |
|---|---|---|---|---|---|---|
| Discord | Yes | Bot install flow likely | Yes | Bot token/signing secret | Usually no | Server/community authorization |
| Telegram | Yes | No OAuth for bot | Yes | Bot token | Usually no | Bot ownership/setup |
| Email | Yes | Provider-dependent | Provider-dependent | API key/SMTP creds | Often yes | Domain/DNS verification |
| Website live chat | No for local demo | No | Internal only | No for local demo | No for local demo | No |
| Facebook Pages | Yes | Yes | Yes | App secret/page token | Usually no | Meta app review for production |
| Instagram Business | Yes | Yes | Yes | App secret/page or IG tokens | Usually no | Meta app review for production |
| OpenAI-compatible AI | Yes | No | No | API key/base URL/model | Yes or quota-based | Provider terms |
| OKX ASP/payment | Yes | Platform-specific | Possible | Platform credentials | Possible | OKX approval/registration |

## Recommended Next Codex Prompt

Implement Stage 1 Task 2 only: add message normalization helpers that map the existing `/api/v1/analyse` and `/api/v1/analyse/batch` request message shape into `NormalizedMessage` internally. Preserve current API request/response contracts, UI behavior, storage, environment variables and integrations. Add mapper tests for manual/API, Discord and Telegram source labels.
