# Architecture Audit And Target Design

Date: 2026-07-18

## Product Positioning

AgenticOps AI is positioned as an AI Communication Intelligence Platform. The current working product has two implemented communication contexts: Web3 Community Security and Business Communication Intelligence. Web3 Community Security provides deterministic scam/phishing/impersonation detection, AI-assisted message analysis, moderator reply suggestions, batch analysis, community security reports and A2A service capability. Business Communication Intelligence provides pasted text plus TXT, PDF, DOCX, CSV and XLSX file analysis for normal business messages, preliminary business audit review, budget review, saved reports, knowledge profiles and analysis history.

The roadmap expands into AI Email Workspace, AI Marketing Intelligence, AI Business Intelligence, AI Audit & Compliance and AI Business Operator workflows through document ingestion, channel-aware analysis, approval workflows, safe automation and developer platform APIs. Roadmap features must stay clearly labeled until implemented; the application must not claim live Facebook, Instagram, email sending, live chat, auto-send, enterprise tenancy or database-backed functionality before those features exist. The current UI uses status labels such as Implemented, In Progress, Planned and Future to preserve that distinction.

The official logo asset is served from `public/logo/Agentic-Ops.jpg` and used by application branding and metadata without altering the supplied JPG. Next.js app icon files also use exact copies at `app/icon.jpg` and `app/apple-icon.jpg`; the existing `app/favicon.ico` remains because the favicon convention is `.ico` only.

## Capability Status

- Implemented: Web3 Community Security as the first supported communication context, Business Communication Intelligence as the second supported context, deterministic security rules, AI-assisted message analysis, single-message review, batch analysis, browser-local Web3 reports, public analysis/rules endpoints, local project knowledge bases, polished platform UI/UX, the normalized message model foundation, `/business` analysis for pasted text/TXT/PDF/DOCX/CSV/XLSX, durable business analyses/reports/profiles/actions, Gmail readonly sync and analysis, Telegram ingestion, Facebook Messenger ingestion, Discord Gateway ingestion through Railway, durable integration event/workflow storage and human-approval-required suggestions.
- Foundation Ready: Instagram webhook verification and supported payload normalization, pending broader production delivery verification and Meta configuration.
- Roadmap: HR, compliance, marketing communication, executive operations, Website Live Chat, Outlook, WhatsApp Business, Slack, Microsoft Teams, X, YouTube, LinkedIn, TikTok, Reddit, Gmail send/modify, approval execution workflows, safe automation, persistent tenant audit views, AI audit, AI marketing intelligence, AI business intelligence, AI business operator workflows and developer APIs.
- Future: organizations, workspaces, teams, user accounts, RBAC, permissions, secure tenant data isolation, durable multi-tenant persistence, per-organization API keys, billing/subscription management and enterprise administration.

## Current Architecture

AgenticOps AI is a Next.js 16 App Router application with public pages, dashboard pages, route handlers, and domain logic in `lib/`. The current product includes a Web3 community security MVP and a Business Communication Intelligence MVP.

Current pages:

- `/`: product landing page.
- `/demo`: no-login guided NovaBridge demo using the real hybrid analysis flow with a local mock AI provider.
- `/business`: Business Intelligence Workspace for communication analysis, business file review, preliminary audit findings, budget review, generated reports, profile context and analysis history.
- `/integrations`: Integrations & AI Workspace with provider overview, connected/available/planned catalogs, read-only communication inbox, approval center, event log and health diagnostics.
- `/integrations/messages/[id]`: read-only bounded message detail and analysis view for integration workflows.
- `/integrations/telegram`, `/integrations/discord`, `/integrations/facebook`, `/integrations/instagram`: provider detail workspaces.
- `/integrations/gmail`: Gmail readonly inbox listing and manual analyze-only message review.
- `/privacy`: public privacy policy.
- `/data-deletion`: public data deletion instructions.
- `/security-engine`: public deterministic rule catalog.
- `/docs/asp`: human-readable ASP registration documentation.
- `/docs/architecture`: public platform architecture overview.
- `/dashboard`: local project knowledge-base list.
- `/dashboard/projects/new`: create a project profile.
- `/dashboard/projects/[id]`: edit a project profile.
- `/dashboard/projects/[id]/analyse`: single-message review UI.
- `/dashboard/projects/[id]/batch`: paste-based batch review UI.
- `/dashboard/projects/[id]/report`: browser-local report UI based on the latest stored batch.

Current API routes:

- `GET /api/v1/health`: returns service health and deterministic engine availability.
- `GET /api/v1/rules`: returns the public deterministic rules.
- `POST /api/v1/analyse`: validates a project/message request, loads a project from local JSON, runs deterministic-first hybrid analysis, and returns structured results.
- `POST /api/v1/analyse/batch`: validates up to 25 messages, isolates invalid messages, runs analysis with concurrency 3, and returns successful results, failed results, and measured summary metrics.
- `POST /api/business/ingest`: validates and parses supported business uploads without permanently storing original files, then returns sanitized extraction metadata, preview and bounded analysis content.
- `GET/POST /api/business/analyses`: lists and saves bounded business analyses through the business repository.
- `GET /api/business/analyses/[id]`: reads one saved business analysis by validated ID.
- `GET/POST /api/business/reports`: lists and generates reports from saved analyses.
- `GET /api/business/reports/[id]`: reads one generated business report by validated ID.
- `GET /api/business/reports/[id]/export`: exports report data as JSON or CSV findings. PDF is handled through print-optimized HTML and browser Save as PDF.
- `GET/POST /api/business/profiles`: lists seeded plus saved business profiles and persists bounded profile context.
- `GET /api/integrations/google/auth`: starts Google OAuth with Gmail readonly scope and CSRF state cookie.
- `GET /api/integrations/google/callback`: validates OAuth state, exchanges code for tokens and stores encrypted token metadata server-side.
- `GET/POST /api/integrations/gmail/messages`: lists a small recent Gmail inbox window and analyzes selected messages without modifying email.
- `POST /api/integrations/messages`: internal worker endpoint for normalized analyze-only messages.
- `GET /api/integrations/messages/[id]`: reads one sanitized integration workflow detail by validated ID.
- `GET /api/integrations/approvals`: lists approval-required workflow records.
- `PATCH /api/integrations/approvals/[id]`: updates internal approval state only; it does not execute external provider actions.
- `GET /api/integrations/health`: returns sanitized provider health and metrics.
- `GET/POST /api/webhooks/meta`: verifies Meta webhook setup and receives signed Facebook/Instagram messaging events.
- `POST /api/webhooks/telegram`: receives Telegram updates with optional secret-token validation.

Current domain modules:

- `lib/security/`: deterministic Web3 security rules, normalization, risk scoring, escalation, public rule metadata, and tests.
- `lib/analysis/`: hybrid analysis types, Zod schemas, AI merge logic, risk ordering, batch metrics, and tests.
- `lib/ai/`: provider interface, OpenAI-compatible provider, and default provider fallback.
- `lib/messages/`: normalized message foundation, channel/source enums, reusable message/conversation/reply/audit types, Zod schemas, and channel profile metadata for future adapters.
- `lib/business/`: business communication analysis types, profiles, heuristic analyzer, audit finding generation, deterministic budget calculations, report generation, metrics, repository abstraction, request validation and tests.
- `lib/business-ingestion/`: server-side upload validation plus TXT, PDF, DOCX, CSV and XLSX parsers, bounded extraction summaries, preview helpers and tests.
- `lib/integrations/`: provider-neutral normalized integration messages, adapters, OAuth helpers, token storage, Gmail service, webhook security, dedupe, durable event/workflow repository, workspace status derivation, internal approval state and analyze-only processing.
- `lib/projects/`: project knowledge-base types, Zod validation, repository interface, local JSON repository, and tests.
- `lib/app-config.ts`: centralized app name, version and base URL helpers for metadata and footer consistency.
- `lib/api/`: structured API error responses.

Current persistence:

- Project profiles are stored in `data/projects.json` through `ProjectRepository`.
- Batch and report UI state is stored in browser `localStorage`.
- There is no tenant, user, organization, webhook, message, analysis, approval, or audit-log persistence.
- `/business` persists bounded analysis records, reports, profile records and proposed internal action records through `BusinessRepository`. Production uses KV/Upstash when configured; tests use memory; local development can fall back to `.agenticops/business-workspace-store.json`.
- Google OAuth token storage uses encrypted Vercel KV/Upstash REST storage in production when KV/Upstash REST variables are configured. Local filesystem token storage under `.agenticops/` is development-only and is refused in production.
- Integration event/workflow records use a provider-independent repository. Vercel KV/Upstash REST is used for durable storage when configured; tests use memory; local development without KV falls back to `.agenticops/integration-event-store.json`.

## Communication Integrations Foundation

Implemented:

- Google OAuth uses only `https://www.googleapis.com/auth/gmail.readonly`.
- Gmail inbox reading lists a conservative recent message window and supports manual analysis only.
- Meta webhook verification uses `META_VERIFY_TOKEN`; signed POST payloads are validated with `META_APP_SECRET` when configured.
- Telegram webhook validates `TELEGRAM_WEBHOOK_SECRET` when configured.
- Discord Gateway support is a separate worker entry point, not a serverless request handler.
- All provider payloads are normalized before processing and then sent through the analyze-only AgenticOps AI processing service.
- `/integrations` derives status from real OAuth records, webhook verification events, provider events and worker heartbeats. Environment variables alone produce `Configured` or `Awaiting First Event`, not `Connected`.
- The Communication Inbox lists bounded workflow previews only. The Event Log lists operational lifecycle records only and does not display full message content.
- The Approval Center can update internal review state and audit history. Internal approval never sends a provider reply or executes an external action.

Development Only:

- Encrypted OAuth token storage with KV/Upstash in production and local filesystem fallback only outside production.
- In-memory event repository for tests and explicit local fallback.
- Local file event repository for development without KV.
- Webhook dedupe cache remains process-local and is not a production idempotency store.
- Discord worker process when run outside the Next.js serverless deployment.

Planned/Future:

- Tenant-aware production token ownership and account mapping.
- Tenant-aware integration ownership and auth.
- Production audit repository with retention policies, search and tenant isolation.
- Provider write actions only after explicit authorization, provider permissions, idempotency, audit logging and confirmation.

Meta webhook delivery still depends on external Meta dashboard setup: the callback URL must be configured as `https://agenticopsai.xyz/api/webhooks/meta`, the verify token must match `META_VERIFY_TOKEN`, Facebook Page webhook fields must be subscribed, the Page must be subscribed to the app, the Instagram professional account must be linked to the correct Page, Instagram messaging fields must be subscribed, and development-mode apps only deliver events for permitted roles/test assets until review/permissions allow broader traffic.

## Business Intelligence Workspace

The `/business` page is the second working communication context after Web3 Community Security. It does not modify the Web3 deterministic security engine or existing analysis APIs.

Implemented now:

- Paste normal business communication text.
- Upload TXT, PDF, DOCX, CSV and XLSX files.
- Validate allowed extensions, MIME types, file size and empty files before parsing.
- Extract text from normal text-based PDFs with page count and no-text/OCR messaging.
- Extract DOCX paragraph/table text without executing active content.
- Parse CSV headers, quoted values and bounded UTF-8 rows/columns.
- Parse XLSX worksheets with bounded rows/columns/cells and cached/displayed formula values only.
- Show filename, type, size, PDF page count, worksheet, row/column counts, extracted character count, truncation state and a sanitized preview before analysis.
- Select a business profile: Default, Acme Corp, Support Center, SaaS Company, E-commerce Business, Professional Services, Nonprofit Organization, Small Business or a saved bounded profile.
- Select one analysis purpose: Customer Support, Business Email, Sales Conversation, Internal Team, General Communication, Business Audit or Budget Review.
- Generate structured local analysis: executive summary, communication type, summary, intent, priority, sentiment, risk level, requested actions, important entities, dates, people/departments, recommended next step, confidence, key topics, suggested actions, recommended reply outline, missing context, human-review requirement, audit observations and budget observations where applicable.
- Show explainability notes describing why recommendations were produced.
- Persist saved analyses, audit findings, proposed internal action records and generated report metadata through the business repository.
- Calculate Budget Review totals, variance, variance percentage, largest deviations and data-quality warnings deterministically when the input contains budget/planned and actual/spent columns.
- Generate reports from saved analyses only: Communication Analysis Report, Business Audit Report, Budget Review Report, Executive Summary, Risk Report, Department Report, Year-End Business Review and Findings and Recommendations Report.
- Export generated reports as JSON and CSV findings, and use the browser print flow for PDF output.

Not implemented:

- External AI calls for the business page.
- OCR for scanned/image-only PDFs.
- Legacy `.doc`, legacy `.xls` and macro-enabled `.xlsm` parsing.
- CRM sync, email sending, Slack, Microsoft Teams, Google Workspace, Salesforce, HubSpot or ticket creation.
- Certified accounting audits, statutory audit assurance, tax compliance, legal conclusions or financial advice.
- Autonomous action execution, external sends, payment execution, bank connections, CRM writeback or accounting synchronization.
- Tenant-specific auth boundaries, organization-level RBAC or secure tenant isolation.

Current deployment assumptions:

- Next.js App Router route handlers on a Node.js 22-compatible serverless or Node hosting platform.
- `npm ci`, `npm run build`, and platform runtime execution.
- `OPENAI_API_KEY` is required for live AI calls; `OPENAI_MODEL` and `OPENAI_BASE_URL` are optional.
- The no-login `/demo` route works without secrets, database writes, or external services.
- Local JSON writes are not durable or concurrency-safe in serverless production.

## Current Security And AI Flow

1. UI or API supplies project context and a message.
2. `analyseMessage` validates the input with Zod.
3. `analyseSecurity` normalizes the raw message and applies 15 deterministic rules.
4. The AI provider receives project context, the untrusted message, and deterministic rule context.
5. AI output is parsed and validated with Zod.
6. If AI fails or returns invalid output, deterministic results are preserved and the case escalates.
7. Knowledge-grounding checks can force escalation if the AI claims unsupported project knowledge is grounded.
8. Final risk is the higher of deterministic risk and AI-suggested risk.

The key invariant to preserve: AI can add classification, explanation, and reply language, but it must never lower deterministic risk.

## Existing Deterministic Rules

Rules `SEC-001` through `SEC-015` cover seed phrase requests, private-key requests, wallet verification payments, private admin contact, urgent wallet verification, guaranteed returns, token-claim links, impersonation, missing funds, failed transactions, remote access, password/OTP requests, prompt injection, suspicious URLs, and spam/repeated promotions.

The deterministic engine already provides explainable matched evidence, severity, risk score, escalation flags, and `safeToAutoReply`.

## Target Modular Architecture

The next architecture should preserve existing modules and split expansion work into narrow packages:

```text
app/
  api/v1/analyse/
  api/v1/analyse/batch/
  api/v1/ingest/                 future normalized message ingestion
  api/v1/integrations/*          future webhook endpoints
  dashboard/*                    existing UI, later tenant-aware

lib/
  security/                      deterministic Web3 security rules
  intelligence/                  general business conversation intelligence
  analysis/                      orchestration and merge policy
  ai/                            AI provider interface and prompt contracts
  normalization/                 source-specific to normalized message mapping
  ingestion/                     paste, upload, and channel ingestion services
  files/                         CSV, Excel, PDF, Word, text extraction
  channels/                      Discord, Telegram, email, live chat, Meta adapters
  replies/                       reply generation, automation rules, approval gating
  approvals/                     human review queue and decision model
  reports/                       security and BI reports
  audit/                         immutable action and recommendation logs
  tenants/                       organization, user, role, and boundary helpers
  storage/                       repository contracts and concrete persistence
```

Recommended boundaries:

- Core security analysis: keep `lib/security` deterministic, tested, and independent of AI or channels.
- General conversation intelligence: add `lib/intelligence` for intent, sentiment, priority, leads, FAQs, complaints, summaries, and recommended actions.
- AI enrichment: keep provider interface in `lib/ai`; add prompt/version contracts and typed schemas per analysis task.
- Deterministic rules: keep security rules separate from BI heuristics. Add rule suites instead of mixing domains.
- Message normalization: add a normalized envelope before analysis so web forms, files, Discord, Telegram, email, chat, Facebook, and Instagram share one pipeline.
- File ingestion: extract text and metadata into normalized messages; never let uploaded document parsers bypass validation or size limits.
- Channel adapters: each adapter should map provider payloads to normalized messages and expose send capabilities only when explicitly configured.
- Reply workflows: generate suggestions by default; auto-send only after tenant-configured rules pass.
- Human approval: persist approval state separately from generated replies.
- Reporting: compute measured metrics from persisted analysis results; AI-written summaries must cite measured inputs.
- Persistence: introduce repository interfaces first, then a managed database implementation after approval.
- Authentication and tenant boundaries: require organization IDs on persisted resources before live integrations.
- Audit logging: record recommendations, approval decisions, automation actions, external sends, and failures.

## Platform-Wide Message Pipeline

The public homepage now illustrates the intended platform-wide flow:

```text
Incoming Message
  -> Normalize
  -> Identify Communication Context
  -> Deterministic Rules
  -> AI Analysis
  -> Recommendations
  -> Human Approval (when required)
  -> Reports
  -> Audit Trail
```

Implemented today: incoming manual/API messages, `/business` paste/TXT/PDF/DOCX/CSV/XLSX input paths, the normalized message model foundation, deterministic Web3 security rules, AI-assisted analysis, partial risk/intent classification, suggested replies, browser-local Web3 reporting, durable business reports and integration event records.

Roadmap: broader context identification, non-Web3 deterministic rule suites, document/channel ingestion, approval queues, configurable automation and durable multi-tenant audit history.

## Communication Contexts

The same normalized message model should support multiple communication contexts while allowing context-specific priorities:

- Web3 Communities: implemented context for scams, phishing, impersonation and unsafe support workflows.
- Business Communication: implemented context for pasted text, TXT/PDF/DOCX/CSV/XLSX business inputs, summary, intent, priority, sentiment, risk, preliminary audit review, budget review, recommended next steps and generated reports.
- Customer Support: implemented analysis purpose inside the Business Communication MVP for support intent, urgency, complaints and recommended actions.
- Sales Conversations: implemented analysis purpose inside the Business Communication MVP for purchase intent, objections, product questions and follow-up detection.
- Business Email: implemented analysis purpose inside the Business Communication MVP for formal communication review; full mailbox workspace actions remain planned.
- Internal Teams: implemented analysis purpose inside the Business Communication MVP for decision, blocker, request and ownership summaries.
- HR: planned policy question, employee issue and sensitive request triage.
- Social Media: planned campaign, DM, comment, engagement and brand-risk analysis.
- Compliance: planned communication review, evidence trails and reports.
- General Communication: implemented analysis purpose inside the Business Communication MVP for intent, sentiment, risk, urgency and recommended action classification.

## Messaging Foundation

The Stage 1 messaging foundation is implemented under `lib/messages/`. It is type and validation infrastructure only: it does not persist messages, change existing API contracts, connect integrations, or alter the production UI.

Every future adapter should convert incoming payloads into `NormalizedMessage` before analysis. The current model supports manual/API input, Discord, Telegram, Facebook Pages, Instagram Business, email, website live chat, uploaded documents, CSV, Excel, PDF, Word and plain-text imports.

Implemented files:

- `lib/messages/constants.ts`: reusable source, risk, intent, reply-state, audit-event, sender-role, recipient-type, sentiment and priority constants.
- `lib/messages/types.ts`: `NormalizedMessage`, `Attachment`, `Sender`, `Recipient`, `Conversation`, `AnalysisResult`, `ReplyRecommendation` and `AuditEvent`.
- `lib/messages/schemas.ts`: Zod schemas for the same models.
- `lib/messages/channel-profiles.ts`: structured channel metadata for Discord, Telegram, Facebook Pages, Instagram Business, email, website live chat and uploaded documents.
- `lib/messages/index.ts`: public exports for future internal use.

The implemented shape is:

```ts
export type NormalizedMessage = {
  messageId: string;
  conversationId: string;
  organizationId?: string;
  projectId?: string;
  source: MessageSource;
  externalMessageId?: string;
  externalConversationId?: string;
  sender: Sender;
  recipient: Recipient[];
  timestamp: string;
  receivedAt?: string;
  subject?: string;
  content: string;
  normalizedContent: string;
  attachments: Attachment[];
  metadata: Record<string, unknown>;
  language?: string;
  analysis?: AnalysisResult;
  replyState: ReplyState;
  replyRecommendation?: ReplyRecommendation;
  audit: {
    createdAt: string;
    updatedAt: string;
    events: AuditEvent[];
  };
};
```

Channel profiles are metadata, not AI prompts. They describe typical message style, conversation characteristics, business context, security priorities and default analysis priorities so future analysis and adapter work can share a consistent source vocabulary without connecting external APIs.

## Integration Requirements

Fully demonstrable locally:

- Manual single-message paste.
- Manual conversation paste.
- TXT, CSV, XLSX, PDF and DOCX parsing using local fixtures.
- Normalized message mapping with fake channel payload fixtures.
- AI reply suggestions with mocked providers.
- Human approval queues with local or test storage.
- Security and BI reports generated from local persisted analysis results.

Require sandbox credentials:

- Discord bot/webhook ingestion and send tests.
- Telegram bot webhook ingestion and send tests.
- Email provider inbound parsing and outbound test sends.
- Website live chat hosted widget and webhook test events.
- Meta Instagram Business and Facebook Page webhook development-mode events.
- OpenAI-compatible live AI calls.

Require production approval or review:

- Facebook Pages production webhooks and messaging.
- Instagram Business production messaging/webhooks.
- WhatsApp Business, TikTok, X, and some future social integrations.
- Any external auto-reply sending in customer channels.
- OKX ASP registration changes, payment integration, or deployed identity updates.

Potential paid services:

- Managed database/storage.
- File extraction/OCR for scanned PDFs.
- Email provider.
- Live chat infrastructure.
- OpenAI-compatible model provider.
- Hosted queues/background jobs for webhook retries and report generation.

## Roadmap Architecture Notes

Phase 1, Communication Intelligence, is implemented for Web3 Community Security and Business Communication Intelligence. Future work in this phase adds Customer Support, Sales, Internal Teams and HR contexts.

Phase 2, AI Email Workspace, should add read email, categorization, phishing detection, draft replies, reply suggestions, send email, archive, labels, follow-up and inbox prioritization. Send/modify permissions remain planned only.

Phase 3, AI Marketing Intelligence, should add Facebook, Instagram, LinkedIn, X, TikTok and YouTube analysis with campaign analysis, ad performance, creative suggestions, audience recommendations, campaign reports and human-approved ads.

Phase 4, AI Business Intelligence, now has an implemented internal workspace for saved business analyses, preliminary audit review, budget review, report generation and executive metrics. Future work should add BigQuery, accounting systems, KPIs, revenue feeds, expenses, forecasting, customer segmentation and external business dashboards.

Phase 5, AI Audit & Compliance, now has preliminary business audit findings and year-end report templates inside `/business`. Future work should add scheduled audits, continuous controls, compliance framework mapping, evidence workflows, auditor collaboration and organization-level audit dashboards.

Phase 6, AI Business Operator, should add cross-channel workflows, scheduling, automation, approvals, executive summaries, workflow builder and human approval.

Future enterprise features require explicit design approval before implementation: organizations, workspaces, teams, user accounts, RBAC, permissions, secure tenant data isolation, durable multi-tenant persistence, audit logs, per-organization API keys, billing/subscription management and enterprise administration.
