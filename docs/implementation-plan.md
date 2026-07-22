# Implementation Plan

Date: 2026-07-18

This plan preserves the existing deployed product. Each task should be handled in a separate Codex prompt with tests and validation before moving on.

## Branding And Positioning

The website now presents AgenticOps AI as an AI Communication Intelligence Platform. The current live capabilities are Web3 Community Security and the `/business` Business Communication Intelligence MVP; roadmap features for email intelligence, marketing intelligence, AI audit, deeper business intelligence, channel integrations, AI business operator workflows and enterprise administration must remain clearly labeled as future work until implemented.

The official logo asset is `public/logo/Agentic-Ops.jpg`. It should be reused as-is and not regenerated, recolored, cropped, distorted or substituted.

The homepage now uses platform-wide positioning: one AI communication engine, multiple communication contexts, and Web3 Community Security plus Business Communication Intelligence as the implemented contexts. It includes roadmap-only sections for future contexts, the platform-wide message pipeline and future architecture.

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

Status: MVP expanded 2026-07-22. The `/business` route now provides the second working communication context after Web3 Community Security. It supports pasted text, TXT/PDF/DOCX/CSV/XLSX upload, business profile selection, analysis purpose selection, local demonstration analysis, extraction previews, Business Audit, Budget Review and explainable structured results. It does not connect CRM systems, send email, persist business analyses, support OCR, parse legacy DOC/XLS safely, or execute autonomous actions.

1. Add BI analysis types and local demonstration analyzer. Completed 2026-07-19.
   - Scope: summary, intent, sentiment, priority, risk, requested actions, entities, recommendations, reply outline and explanations.
   - Delivered: `lib/business/types.ts`, `lib/business/profiles.ts`, `lib/business/analyse-business-communication.ts`, `lib/business/analyse-business-communication.test.ts`, `app/business/page.tsx` and `app/business/business-client.tsx`.
   - Tests: analyzer tests cover sales intent, sensitive/high-risk language and safe default behavior.

2. Add conversation paste support.
   - Scope: parser that splits pasted conversation text into normalized messages with stable ordering.
   - Tests: common transcript formats and malformed input.

3. Add plain-text and CSV ingestion. Completed 2026-07-22.
   - Scope: local upload UI/API, size limits, row mapping, errors per row.
   - Delivered: server-side validation, TXT parser, CSV parser, bounded table summaries and extraction preview UI.
   - Tests: fixture uploads, validation failures, quoted CSV values, row/column limits and truncation.

4. Add Excel ingestion. Completed for XLSX 2026-07-22.
   - Scope: parser dependency, sheet/column mapping, row limits.
   - Delivered: XLSX worksheet detection, worksheet selection, bounded row/column/cell summaries and formula non-execution. Legacy XLS and XLSM remain unsupported.
   - Tests: `.xlsx` fixtures, worksheet selection, limits, cached formula results and unsupported XLS/XLSM rejection.

5. Add PDF and Word ingestion. Completed for text PDFs and DOCX 2026-07-22.
   - Scope: text extraction only; no OCR unless separately approved.
   - Delivered: page-aware PDF text extraction, no-text PDF detection, DOCX text extraction and safe parse failures. Legacy DOC and OCR remain unsupported.
   - Tests: parser success, no-text PDFs, encrypted/corrupted PDFs, DOCX paragraph/table text, invalid DOCX and file size/type rejection.

6. Add BI report metrics.
   - Scope: measured dashboard panels for intent, sentiment, priority, complaints, leads, FAQs, and escalations.
   - Tests: deterministic summary calculations.

## Stage 3: Communication Integrations

Status: foundation started 2026-07-20. Google/Gmail, Meta, Telegram and Discord now have analyze-only integration infrastructure. Integration event/workflow records are provider-independent and durable through Vercel KV/Upstash REST when configured. Production use still requires deployment URL configuration, provider console setup, durable encrypted OAuth token storage, authentication/tenant ownership and human-approval workflows.

1. Add integration registry and channel adapter test harness. Completed 2026-07-20 as foundation.
   - Scope: provider-neutral normalized message model, adapters, webhook validation, dedupe, durable event/workflow repository and analyze-only processing.
   - Delivered: `lib/integrations/`, Google OAuth routes, Gmail readonly routes, Meta webhook route, Telegram webhook route, internal worker endpoint and Discord worker entry point.
   - Tests: OAuth helper, token refresh, Meta verification/signature rejection, Telegram normalization, Discord normalization, dedupe, secret redaction and normalized-message validation.

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

## Future Roadmap Groups

These groups are roadmap only unless explicitly marked implemented above.

- Implemented Communication Intelligence sources: Gmail readonly, Telegram, Facebook Messenger and Discord Gateway through Railway.
- Foundation Ready: Instagram webhook verification and supported payload normalization.
- Planned Communication Intelligence: Website Live Chat, WhatsApp Business, Slack, Microsoft Teams, Outlook and broader provider coverage.
- Future Social and Community Intelligence: X, YouTube comments, LinkedIn company pages and comments, TikTok, Reddit, social listening, sentiment analysis, brand-risk detection, lead identification and complaint identification.
- Future AI Marketing Intelligence: Meta Ads, X Ads, LinkedIn Ads, TikTok Ads, Google Ads, YouTube campaign intelligence, campaign recommendations, audience suggestions, ad-copy generation, creative briefs, performance monitoring and human approval before campaign launch or budget changes.
- Future AI Email Workspace: `gmail.modify`, `gmail.send`, labels, archive, follow-up workflows, human-approved sending, phishing detection and priority detection.
- Future Business Intelligence: BigQuery, Cloud Platform integrations, KPI analysis, customer segmentation, business reporting, trend detection and anomaly detection.
- Future AI Business Operator: cross-channel workflows, task routing, approvals, audit history, executive summaries and controlled automation.

The current integration foundation uses Gmail readonly only and does not request Gmail modify/send permissions, ad-management permissions, Cloud Platform scopes or production automation privileges.

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
