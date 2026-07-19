# Architecture Audit And Target Design

Date: 2026-07-18

## Product Positioning

Agentic Ops is positioned as an AI Communication Intelligence Platform. The current working MVP is Web3 Community Security: deterministic scam/phishing/impersonation detection, AI-assisted message analysis, moderator reply suggestions, batch analysis, community security reports and A2A service capability.

The roadmap expands into broader business communication intelligence through document ingestion, channel-aware analysis, approval workflows, safe AI customer operations and developer platform APIs. Roadmap features must stay clearly labeled until implemented; the application must not claim live Facebook, Instagram, email, live chat, OAuth, auto-send, enterprise tenancy or database-backed functionality before those features exist. The current UI uses status labels such as Implemented, Current MVP, In Progress, Planned and Future to preserve that distinction.

The official logo asset is served from `public/logo/Agentic-Ops.jpg` and used by application branding and metadata without altering the supplied JPG. Next.js app icon files also use exact copies at `app/icon.jpg` and `app/apple-icon.jpg`; the existing `app/favicon.ico` remains because the favicon convention is `.ico` only.

## Capability Status

- Implemented: Web3 Community Security as the first supported communication context, deterministic security rules, AI-assisted message analysis, single-message review, batch analysis, browser-local reports, public analysis/rules endpoints, local project knowledge bases, polished platform UI/UX, the normalized message model foundation and the `/business` Business Intelligence Dashboard MVP for pasted/TXT business communications.
- In progress: platform positioning, message foundation hardening and internal normalization work.
- Roadmap: business communication intelligence, document intelligence, channel adapters, Facebook Pages, Instagram Business, Email, Website Live Chat, approval workflows, safe automation, persistent audit history and developer APIs.
- Future: organizations, workspaces, teams, user accounts, RBAC, permissions, secure tenant data isolation, durable multi-tenant persistence, per-organization API keys, billing/subscription management and enterprise administration.

## Current Architecture

Agentic Ops is a Next.js 16 App Router application with public pages, dashboard pages, route handlers, and domain logic in `lib/`. The current product is a Web3 community security and support MVP.

Current pages:

- `/`: product landing page.
- `/demo`: no-login guided NovaBridge demo using the real hybrid analysis flow with a local mock AI provider.
- `/business`: local Business Intelligence Dashboard MVP using demonstration logic for normal business communications.
- `/security-engine`: public deterministic rule catalog.
- `/docs/asp`: human-readable ASP registration documentation.
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

Current domain modules:

- `lib/security/`: deterministic Web3 security rules, normalization, risk scoring, escalation, public rule metadata, and tests.
- `lib/analysis/`: hybrid analysis types, Zod schemas, AI merge logic, risk ordering, batch metrics, and tests.
- `lib/ai/`: provider interface, OpenAI-compatible provider, and default provider fallback.
- `lib/messages/`: normalized message foundation, channel/source enums, reusable message/conversation/reply/audit types, Zod schemas, and channel profile metadata for future adapters.
- `lib/business/`: local demonstration business communication analysis types, profiles, heuristic analyzer and tests.
- `lib/projects/`: project knowledge-base types, Zod validation, repository interface, local JSON repository, and tests.
- `lib/api/`: structured API error responses.

Current persistence:

- Project profiles are stored in `data/projects.json` through `ProjectRepository`.
- Batch and report UI state is stored in browser `localStorage`.
- There is no tenant, user, organization, webhook, message, analysis, approval, or audit-log persistence.
- `/business` keeps analysis state in the browser only and does not persist business messages or profile changes.

## Business Intelligence Dashboard MVP

The `/business` page is the second working communication context after Web3 Community Security. It does not modify the Web3 deterministic security engine or existing analysis APIs.

Implemented now:

- Paste normal business communication text.
- Upload TXT files in the browser.
- Select a demonstration business profile: Default, Acme Corp, Demo SaaS or Support Center.
- Select one analysis purpose: Customer Support, Business Email, Sales Conversation, Internal Team or General Communication.
- Generate structured local demonstration analysis: summary, intent, priority, sentiment, risk level, requested actions, important entities, recommended next step, confidence, key topics, suggested actions and recommended reply outline.
- Show explainability notes describing why recommendations were produced.

Not implemented:

- PDF extraction, DOCX parsing, CSV ingestion and Excel ingestion.
- External AI calls for the business page.
- CRM sync, email sending, Slack, Microsoft Teams, Google Workspace, Salesforce, HubSpot or ticket creation.
- Durable persistence, tenant-specific business profiles or audit-log storage.

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
  -> Identify Context
  -> Deterministic Rules
  -> AI Analysis
  -> Risk & Intent Classification
  -> Suggested Action
  -> Human Review / Automation
```

Implemented today: incoming manual/API messages, the normalized message model foundation, deterministic Web3 security rules, AI-assisted analysis, partial risk/intent classification, suggested replies and browser-local reporting.

Roadmap: context identification across business domains, non-Web3 deterministic rule suites, document/channel ingestion, approval queues, configurable automation and durable audit history.

## Communication Contexts

The same normalized message model should support multiple communication contexts while allowing context-specific priorities:

- Web3 Communities: current MVP context for scams, phishing, impersonation and unsafe support workflows.
- Customer Support: planned support intent, urgency, complaint and recommended-action detection.
- Sales Conversations: planned purchase intent, objections, product questions and follow-up detection.
- Lead Qualification: planned routing for high-intent prospects.
- Business Email: planned formal thread, attachment, action-item and summary support.
- Social Media: planned campaign, DM, comment, engagement and brand-risk analysis.
- Internal Team Communication: future decision, blocker, request and ownership summaries.

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
- CSV/Excel/PDF/Word/plain-text parsing using local fixtures after parser dependencies are added.
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

Phase 1 should continue strengthening Universal Web3 Community Security while expanding the reusable API and Discord/Telegram architecture without live external connections.

Phase 2 should add business intelligence and document ingestion through the normalized message model, including conversations, CSV, Excel, PDF, Word and plain-text inputs.

Phase 3 should add channel intelligence for Facebook Pages, Instagram Business, email and website live chat. Each adapter should map provider payloads into `NormalizedMessage` and use channel profile metadata for source-aware analysis priorities.

Phase 4 should add AI customer operations with reply suggestions, human approval, configurable automation rules, escalation controls, confidence/risk thresholds and audit history. External auto-send must stay disabled unless a tenant explicitly configures and authorizes it.

Phase 5 should extend omnichannel coverage to Discord, Telegram, X, TikTok, WhatsApp Business, Slack and additional channels based on demand.

Phase 6 should add developer platform and workflow automation capabilities including REST API, A2A, MCP, SDKs, webhooks, configurable if/then workflows and external application integration.

Future enterprise features require explicit design approval before implementation: organizations, workspaces, teams, user accounts, RBAC, permissions, secure tenant data isolation, durable multi-tenant persistence, audit logs, per-organization API keys, billing/subscription management and enterprise administration.
