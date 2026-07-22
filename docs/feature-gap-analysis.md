# Feature Gap Analysis

Date: 2026-07-20

## Stage Comparison

The website now positions the product as AgenticOps AI, one AI communication engine for multiple communication contexts. The implemented communication contexts are Web3 Community Security and Business Communication Intelligence.

Stage 1 is partially implemented. The deterministic Web3 security engine, AI-assisted suggestions, single/batch APIs, and report UI exist. Discord and Telegram are currently source labels only; there are no reusable adapter interfaces or live channel connectors.

Stage 2 is early but has a working `/business` MVP. Users can paste business text, upload TXT, choose a business profile and purpose, and receive local demonstration analysis with summary, intent, priority, sentiment, risk, requested actions, entities, recommended next step and confidence. Full conversations, PDF/DOCX/CSV/Excel ingestion, CRM sync, email workspace features, support-ticket ingestion, durable BI reporting and automation are not implemented.

Stage 3 foundation is partially implemented. Google OAuth/Gmail readonly, Meta webhook verification/reception, Telegram webhook reception, a Discord worker entry point, provider adapters, webhook deduplication, redacted development event logging and analyze-only normalized processing now exist. Production usage still requires provider console configuration, deployed callback/webhook URLs, durable encrypted token storage, authentication/tenant ownership, and human approval workflows. Website live chat is still not implemented.

Stage 4 is not implemented beyond safe reply suggestions and escalation flags. There is no persisted approval queue, automation rule engine, outbound send layer, external authorization model, or audit log.

## Gap Matrix

| Feature | Current status | Existing implementation location | Missing work | Technical dependencies | Risk | Phase |
|---|---|---|---|---|---|---|
| Scam detection | Implemented for core Web3 patterns | `lib/security/rules.ts`, `lib/security/analyse-security.ts` | Broader abuse feeds and ongoing rule tuning | Rule tests, curated fixtures | Medium | Stage 1 |
| Phishing detection | Partially implemented | `SEC-007`, `SEC-014` | Domain reputation, allowlists, URL parsing, attachment links | URL parser, threat intel optional | High | Stage 1 |
| Fake administrator detection | Implemented for common text claims | `SEC-004`, `SEC-008` | Channel identity verification from Discord/Telegram roles | Channel adapters, identity metadata | Medium | Stage 1 |
| Seed/private-key detection | Implemented | `SEC-001`, `SEC-002` | Multilingual variants and adversarial phrasing fixtures | Expanded test corpus | Medium | Stage 1 |
| Malicious-link detection | Partial | `SEC-007`, `SEC-014` | Real URL extraction, canonicalization, official domain comparison | Normalization layer | High | Stage 1 |
| Spam and abuse | Basic spam only | `SEC-015`, AI category `SPAM` | Abuse/harassment/toxicity heuristics, rate context | BI rule suite, persisted sender history | Medium | Stage 1/2 |
| Explainable deterministic decisions | Implemented | `SecurityAnalysisResult`, API explanations | Stable public docs for future rules | Rule metadata discipline | Low | Stage 1 |
| AI-generated moderator replies | Implemented as suggestions | `lib/analysis/analyse-message.ts`, `lib/ai/openai-provider.ts` | Prompt/version logging, richer templates, approval persistence | Audit/reply modules | Medium | Stage 1/4 |
| Batch message analysis | Implemented up to 25 messages | `POST /api/v1/analyse/batch`, batch UI | Durable batch jobs, larger async batches, import mapping | Persistence, job queue | Medium | Stage 1/2 |
| Community security reports | Browser-local | `report-client.tsx`, `createBatchSummary` | Server-side persisted reports and trend history | Persistence | Medium | Stage 1/2 |
| Public A2A API | Basic HTTP API exists | `/api/v1/analyse`, `/api/v1/analyse/batch`, public schemas | Authentication, rate limits, tenant scoping, versioning, OKX payment if approved | Auth, persistence, deployment URL | High | Stage 1 |
| OKX ASP materials | Prepared docs/artifacts | `ASP_REGISTRATION.md`, `/docs/asp`, `public/service-manifest.json` | Deployment URL replacement and external submission | Production deployment, user approval | High | Stage 1 |
| Discord support | Development worker foundation | `workers/discord-bot.mjs`, `lib/integrations/adapters/discord.ts` | Persistent worker deployment, install flow, tenant mapping, durable logs | Discord bot token, Gateway intents, worker runtime | High | Stage 1/3 |
| Telegram support | Webhook foundation | `/api/webhooks/telegram`, `lib/integrations/adapters/telegram.ts` | Production webhook registration, tenant mapping, durable logs | Telegram bot token, webhook secret | High | Stage 1/3 |
| Paste individual messages | Implemented | Analyse dashboard and API | Tenant/user context | Auth/persistence later | Low | Stage 2 |
| Paste conversations | Not implemented | None | Conversation parser and multi-message grouping | Normalized message model | Medium | Stage 2 |
| CSV upload | Not implemented | None | Upload UI/API, parser, mapping, tests | Parser dependency, storage limits | Medium | Stage 2 |
| Excel upload | Not implemented | None | XLS/XLSX parser and mapping | Parser dependency | Medium | Stage 2 |
| PDF upload | Not implemented | None | Text extraction, size limits, parser failure handling | PDF parser, optional OCR | High | Stage 2 |
| Word upload | Not implemented | None | DOCX text extraction | DOCX parser | Medium | Stage 2 |
| Plain-text upload | Implemented for TXT in `/business` | `app/business`, `lib/business` | Server-side persistence, larger files, file-to-message splitting | File ingestion module | Low | Stage 2 |
| Customer intent | Partially implemented | AI category and `detectedIntent` | Dedicated BI schema and deterministic fallback labels | `lib/intelligence` | Medium | Stage 2 |
| Sales/purchase intent | Partial | `SALES_LEAD` category | Lead scoring fields and report metrics | BI schema | Medium | Stage 2 |
| Support requests | Partial | `CUSTOMER_SUPPORT`, `TRANSACTION_ISSUE` | Priority and routing rules | BI schema, persistence | Medium | Stage 2 |
| Complaints | Partial | `COMPLAINT` category | Sentiment, SLA priority, escalation policies | BI schema | Medium | Stage 2 |
| FAQs | Not implemented | None | Clustering/counting repeated questions | Persisted analysis history | Medium | Stage 2 |
| Sentiment | Implemented in local business MVP | `lib/business/analyse-business-communication.ts` | AI-backed sentiment, persisted reporting | BI schema/prompt | Low | Stage 2 |
| Priority level | Implemented in local business MVP | `lib/business/analyse-business-communication.ts` | Priority policy configuration and persisted routing | BI schema | Medium | Stage 2 |
| Leads | Partial category only | `SALES_LEAD` | Lead fields, routing, export | BI schema/persistence | Medium | Stage 2 |
| Conversation summaries | Not implemented | None | Conversation grouping and summarizer | Normalized conversations, AI provider | Medium | Stage 2 |
| Recommended actions | Implemented at message level | AI output and rules | BI-specific action taxonomy | BI schema | Medium | Stage 2 |
| Instagram Business | Webhook foundation only | `/api/webhooks/meta`, `lib/integrations/adapters/meta.ts` | Meta app review, OAuth/page subscriptions, tenant mapping, durable logs | Meta app, app secret, review | High | Stage 3 |
| Facebook Pages | Webhook foundation only | `/api/webhooks/meta`, `lib/integrations/adapters/meta.ts` | Meta app review, OAuth/page subscriptions, tenant mapping, durable logs | Meta app, app secret, page token | High | Stage 3 |
| Email | Gmail readonly foundation | `/api/integrations/google/*`, `/integrations/gmail`, `lib/integrations/google/gmail-service.ts` | Production token store, account ownership, pagination UX, MIME parsing, non-Gmail providers | Google OAuth app, Gmail readonly scope | High | Stage 3 |
| Website live chat | Not implemented | None | Widget/API, session IDs, webhook-like ingest | Frontend widget, persistence | Medium | Stage 3 |
| AI auto-reply | Not implemented | Suggestions only | Automation rule engine and send guard | Reply workflow, channel adapters | High | Stage 4 |
| Human approval | Not implemented | Escalation flags only | Approval queue, state transitions, reviewer identity | Auth, persistence | High | Stage 4 |
| Automation rules | Not implemented | `safeToAutoReply` only | Tenant-configurable conditions and kill switch | Auth, persistence, audit | High | Stage 4 |
| Audit logs | Not implemented | None | Immutable event model and repository | Durable storage | High | Stage 4 |
| Auth and tenants | Not implemented | None | Organizations, users, roles, project boundaries | Auth provider/database | High | Stage 1 before integrations |

## Technical Debt And Blockers

- Local JSON project storage is not safe for production writes, concurrency, or multi-tenant use.
- Browser `localStorage` reports cannot support audit trails, approvals, trend reports, or shared team workflows.
- Current message source is a small enum, not a normalized message abstraction.
- API routes have no authentication, tenant scoping, idempotency keys, rate limits, or request provenance.
- Webhook signature verification exists for Meta when `META_APP_SECRET` is configured and Telegram validates the webhook secret when configured, but there is no production-grade rate limiting, tenant attribution or durable webhook/audit storage yet.
- File ingestion is absent, and uploaded documents will need strict size/type validation.
- AI prompts and outputs are not versioned in an audit log.
- No background job or retry abstraction exists for large batches, webhooks, or outbound sends.
- The public landing page mentions multiple channels. Gmail, Meta, Telegram and Discord now have analyze-only foundations, but they are not autonomous customer-operation integrations and require configuration before real provider events can be processed.

## Important Non-Gaps

- The deterministic-first risk invariant is already implemented and tested.
- Structured API error responses already exist.
- AI-provider failure already fails closed.
- Public schemas and ASP documentation already disclose current limitations.
- The demo is self-contained and does not require secrets or external APIs.
