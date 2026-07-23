# AgenticOps AI

AgenticOps AI is an AI Communication Intelligence Platform. The current working product supports two implemented communication contexts: Web3 Community Security and Business Communication Intelligence. Web3 Community Security audits community messages with deterministic security rules first, then uses an OpenAI-compatible AI layer for classification, explanation and safe reply suggestions. AI output can never reduce the deterministic risk level.

The product roadmap expands the same normalized message pipeline into email intelligence, marketing intelligence, AI audit, business intelligence and AI business operator workflows. Roadmap features are not claimed as live until implemented and verified.

## Current MVP

- Web3 Community Security
- Business Communication Intelligence
- AI-powered message analysis
- Scam and phishing detection
- Explainable deterministic decisions
- AI-generated moderator reply suggestions
- Batch analysis
- Community security reports
- A2A service capability

## Roadmap

Phase 1, Communication Intelligence, is implemented for Web3 Community Security and Business Communication Intelligence. Future contexts include Customer Support, Sales, Internal Teams and HR.

Phase 2, AI Email Workspace, is planned for reading email, categorization, phishing detection, draft replies, reply suggestions, sending, archive, labels, follow-up and inbox prioritization.

Phase 3, AI Marketing Intelligence, is planned for Facebook, Instagram, LinkedIn, X, TikTok and YouTube, with campaign analysis, ad performance, creative suggestions, audience recommendations, campaign reports and human-approved ads.

Phase 4, AI Business Intelligence, is implemented for the internal Business Intelligence Workspace and planned for external systems such as BigQuery, accounting platforms, KPI sources, forecasting feeds and customer-segmentation data.

Phase 5, AI Audit & Compliance, is planned for communication audit, business audit, compliance audit, security audit, end-of-year reports, department reports and executive summaries.

Phase 6, AI Business Operator, is future work for cross-channel workflows, scheduling, automation, approvals, executive summaries, workflow builder and human approval.

Future enterprise features include organizations, workspaces, teams, user accounts, role-based access control, permissions, secure tenant data isolation, durable multi-tenant persistence, audit logs, API keys per organization, billing/subscription management and enterprise administration. These are roadmap items and are not implemented in the current MVP.

Additional future capability groups are tracked as roadmap items only:

- Communication Intelligence: Discord, Telegram, Gmail, Facebook Messenger, Instagram, Website Live Chat, WhatsApp Business, Slack and Microsoft Teams.
- Social and Community Intelligence: X, YouTube comments, LinkedIn company pages and comments, TikTok, Reddit, social listening, sentiment analysis, brand-risk detection, lead identification and complaint identification.
- AI Marketing Intelligence: Meta Ads, X Ads, LinkedIn Ads, TikTok Ads, Google Ads, YouTube campaign intelligence, campaign recommendations, audience suggestions, ad-copy generation, creative briefs, performance monitoring and human approval before campaign launch or budget changes.
- AI Email Workspace: future Gmail permissions such as `gmail.modify` and `gmail.send`, labels, archive, follow-up workflows, human-approved sending, phishing detection and priority detection.
- Business Intelligence: implemented internal workspace for business communication analysis, uploaded document/spreadsheet review, preliminary audits, budget review, saved reports, knowledge profiles and analysis history. Future external integrations include BigQuery, Cloud Platform data sources, customer segmentation, trend detection and anomaly detection.
- AI Business Operator: cross-channel workflows, task routing, approvals, audit history, executive summaries and controlled automation.

## Capability Status

- Live or implemented: Web3 Community Security, Business Communication Intelligence, paste text analysis, TXT upload, PDF extraction, DOCX extraction, CSV parsing, XLSX parsing, Gmail readonly sync and analysis, Telegram message ingestion, Facebook Messenger message ingestion, Discord Gateway ingestion through the Railway worker, deterministic rules, AI-assisted message analysis, single-message review, batch analysis, browser-local Web3 reports, durable business analyses/reports/profiles/actions, public rules/analysis APIs, project knowledge bases, normalized message model foundation, durable integration event/workflow storage and human-approval-required suggested replies.
- Foundation ready: Instagram webhook verification and supported payload normalization. Broader Instagram production event coverage depends on Meta delivery, account linkage, permissions and App Review status.
- Planned: Outlook, WhatsApp Business, Slack, Microsoft Teams, X, YouTube, LinkedIn, TikTok, Reddit, Website Live Chat, Gmail send/modify actions, automated ads, CRM writeback, certified audit, autonomous business actions and multi-tenant enterprise administration.
- Future: enterprise organizations, workspaces, teams, user accounts, RBAC, tenant isolation, durable multi-tenant persistence, billing and administration.

## Business Communication Intelligence

The `/business` route provides a Business Intelligence Workspace for normal business communications, uploaded business files, preliminary audit review, budget review, executive reporting, profile context and analysis history. It supports paste text, TXT upload, PDF text extraction, DOCX text extraction, CSV parsing and XLSX worksheet parsing. Supported analysis purposes are Customer Support, Business Email, Sales Conversation, Internal Team, General Communication, Business Audit and Budget Review.

Business analysis returns an executive summary, communication type, intent, priority, sentiment, risk level, key topics, important entities, requested actions, dates, people/departments, recommended next step, suggested reply outline, escalation recommendation, confidence, missing context, human-review requirement and explainability. Spreadsheet and business-record reviews may also include data overview, notable trends, exceptions/anomalies, budget variance indicators, revenue/expense observations, missing or inconsistent entries, preliminary audit observations and recommended follow-up checks.

Business Audit is an AI-assisted preliminary review only. It is not a certified external audit, legal opinion, statutory compliance certification or financial advice. Budget Review is decision-support analysis only and does not invent totals when source data is incomplete.

Business workspace sections:

- Analyze: select a business profile, choose a purpose, paste text or upload a supported file, review extracted metadata, analyze and save the result.
- Audit: review generated audit findings with severity, evidence summary, source reference, recommended corrective action, responsible role and read-only status.
- Budget: review deterministic budget calculations when budget/planned and actual/spent columns are present, plus data-quality warnings and finance review questions.
- Reports: generate reports from saved analyses only. Supported export formats are print-optimized HTML for browser Save as PDF, JSON and CSV for structured findings.
- Knowledge Hub: manage bounded business profile context and knowledge text. This is structured profile context, not vector search.
- Analysis History: view saved analysis records, risk, purpose, profile, status, report availability and summaries.

Business records use the existing repository pattern. Production can store business analyses, reports, profiles and proposed action records in Vercel KV/Upstash REST. Local development can fall back to `.agenticops/business-workspace-store.json`. Original uploaded file bytes are not stored.

Future Financial Intelligence is planned for accounting-system integrations, QuickBooks, Xero, Stripe revenue analysis, bank-feed review, cash-flow forecasting, invoice intelligence, expense classification, financial KPI monitoring, revenue forecasting, cost optimization, tax-document preparation assistance and multi-period comparison. These integrations are not implemented.

Future AI Audit capabilities are planned for scheduled audits, continuous control monitoring, multi-period comparison, cross-department audit, evidence request workflows, auditor collaboration, compliance framework mapping, audit sampling, policy-control mapping, corrective-action tracking, external audit-platform export, approved evidence collection and organization-level audit dashboards.

Supported file extensions:

- `.txt`
- `.pdf`
- `.docx`
- `.csv`
- `.xlsx`

Unsupported file formats and limits:

- Legacy `.doc` is not supported. Export as `.docx`.
- Legacy `.xls` is not supported. Export as `.xlsx`.
- Macro-enabled `.xlsm` is rejected.
- Scanned/image-only PDFs are detected as having no extractable text. OCR is not implemented in the current MVP.
- Attachments embedded inside uploaded documents are not imported.
- Formulas in spreadsheets are not evaluated; only cached/displayed values are used when available.
- Uploaded files are parsed server-side for analysis and are not permanently stored by this MVP.
- Default upload limit is 4 MB. Configure `BUSINESS_UPLOAD_MAX_BYTES` to lower or raise the limit, capped at 10 MB for Vercel-friendly execution.
- CSV/XLSX parsing is bounded to 200 rows, 30 columns and 500 characters per cell before analysis. Analysis input is bounded to 12,000 characters with a 900-character preview.

CRM sync, Slack, Microsoft Teams, Google Workspace write actions, ticket creation, Salesforce, HubSpot and autonomous workflows remain planned and are not connected.

## Brand Assets

The official application logo is served from:

```text
/logo/Agentic-Ops.jpg
```

Next.js app icon files also use the supplied logo unchanged at `app/icon.jpg` and `app/apple-icon.jpg`. The existing `app/favicon.ico` remains in place because the favicon file convention requires `.ico`.

## Project Memory

This repository uses two root-level memory files for continuity between build sessions:

- `log.md` records append-only session notes with the newest entry at the top, including what changed, problems found, fixes, decisions, checks and rules learned.
- `handoff.md` records the current project status, blockers, next actions, architecture decisions, standing rules, demo requirements and known limitations.

Read both files before meaningful changes and update them after each meaningful build session.

## Local Development

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Deployment

Use a serverless-compatible Next.js platform that supports Next.js App Router route handlers and Node.js 22.

Install command:

```bash
npm ci
```

Build command:

```bash
npm run build
```

Runtime command for a Node server deployment:

```bash
npm start
```

Most serverless platforms run the built Next.js app automatically after `npm run build`; do not claim deployment has succeeded until the manually deployed URL has been tested.

## Environment Variables

Set these in the deployment platform environment. Do not commit `.env.local`.

- `OPENAI_API_KEY`: required for live AI analysis.
- `OPENAI_MODEL`: optional; defaults to the provider configured in code when unset.
- `OPENAI_BASE_URL`: optional; set this for OpenAI-compatible providers such as OpenRouter.
- `BUSINESS_UPLOAD_MAX_BYTES`: optional business file upload limit in bytes. Defaults to 4 MB and is capped at 10 MB.
- `BUSINESS_REPOSITORY`: optional; set to `memory` only for tests or explicit local fallback. Leave unset in production so KV/Upstash is selected when configured.
- `BUSINESS_RECORD_RETENTION_DAYS`: optional TTL for business analysis, report, profile and action records when supported by the selected repository. If unset, records do not receive an automatic expiration from the app.
- `NEXT_PUBLIC_APP_URL`: public deployed app URL used for callback display, for example `https://YOUR_DEPLOYMENT_URL`.
- `APP_BASE_URL`: server-side base URL used by workers, for example `https://YOUR_DEPLOYMENT_URL`.
- `INTERNAL_INTEGRATION_SECRET`: shared secret for the Discord worker to call server-side processing.
- `OAUTH_TOKEN_ENCRYPTION_KEY`: required for encrypted Google OAuth token storage in both production KV and local development fallback.
- `INTEGRATION_EVENT_REPOSITORY`: optional; set to `memory` only for tests or explicit local fallback.
- `INTEGRATION_MESSAGE_RETENTION_DAYS`: documented future retention control for bounded integration message/workflow records. Current durable workflow retention follows the selected repository behavior unless explicitly extended.
- `KV_REST_API_URL`, `KV_REST_API_TOKEN`: recommended durable Vercel KV/Upstash REST storage for integration events and workflow records.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: supported aliases for the same durable integration event repository.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: Google OAuth configuration.
- `META_APP_ID`, `META_APP_SECRET`, `META_VERIFY_TOKEN`, `META_PAGE_ACCESS_TOKEN`: Meta app/webhook configuration. Page access is reserved for future approved outbound features and is not used for auto-replies.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`: Telegram bot and webhook validation configuration.
- `DISCORD_APPLICATION_ID`, `DISCORD_PUBLIC_KEY`, `DISCORD_BOT_TOKEN`: Discord app and worker configuration.

These variables are read only from server-side modules under `lib/ai/` and API route execution. Do not create `NEXT_PUBLIC_*` variants for secrets, because `NEXT_PUBLIC_*` values are bundled into client-side JavaScript.

## Communication Integrations

Implemented foundation:

- Google OAuth start and callback routes at `/api/integrations/google/auth` and `/api/integrations/google/callback`.
- Gmail readonly inbox listing and manual analyze-only processing at `/integrations/gmail`.
- Gmail manual sync at `/api/integrations/gmail/sync` imports a bounded recent inbox window for analysis.
- Meta webhook verification and signed webhook receiver at `/api/webhooks/meta`.
- Meta event ingestion supports Facebook Messenger DMs, Instagram Direct Messages, Facebook Page comment add/edit/remove events, Instagram comments, Instagram mentions, message reactions, postbacks and mention-style webhook changes when Meta delivers supported payloads.
- Telegram webhook receiver at `/api/webhooks/telegram`.
- Discord Gateway worker entry point at `workers/discord-bot.mjs`.
- Integrations & AI Workspace at `/integrations` with Overview, Connected, Available, Planned, Communication Inbox, Approval Center, Event Log and Health & Diagnostics sections.
- Read-only integration message details at `/integrations/messages/[id]`.
- Provider detail pages for Gmail, Telegram, Discord, Facebook and Instagram.
- Internal-only approval updates at `/api/integrations/approvals/[id]`; approvals do not execute external actions.
- Sanitized health summary at `/api/integrations/health`.
- Privacy Policy at `/privacy` and Data Deletion Instructions at `/data-deletion`.
- Provider-independent integration event/workflow repository for received messages, analysis records, suggested responses, pending approval state and execution status.

Development-only limitations:

- Google OAuth tokens are encrypted before storage. Production uses Vercel KV/Upstash REST when `KV_REST_API_URL` plus `KV_REST_API_TOKEN` or the equivalent Upstash variables are configured. Filesystem OAuth token storage under `.agenticops/` is local-development only and is refused in production.
- Integration events and workflow records use Vercel KV/Upstash REST when configured. Tests use an in-memory repository, and local development without KV falls back to `.agenticops/integration-event-store.json`. The local file fallback is not suitable for Vercel production durability.
- Discord requires a persistent worker runtime such as Railway, Render, Fly.io or a VM. Do not run the Gateway worker inside a Vercel request lifecycle.
- All external channels are analyze-only. No automatic replies, moderation, email mutation, post publishing, ad management or user actions are implemented.
- Suggested replies and actions are stored as pending human-approval workflow records. Reviewers can approve internally, reject, request more information or mark resolved internally. These state changes do not send messages or execute provider actions.
- Execution remains unavailable until provider permissions, tenant ownership, idempotency, audit logging and explicit human-approved execution workflows are implemented.

Integration status meanings:

- `Connected`: a durable OAuth or connection record exists and can be read successfully.
- `Active`: the provider has delivered or synchronized a successful event recently.
- `Webhook Verified`: webhook verification succeeded, but supported message delivery is not proven.
- `Worker Online`: a persistent worker recently reported healthy operation.
- `Configured`: environment values appear present, but success is not proven.
- `Awaiting First Event`: configuration or verification exists, but no supported event has been received.
- `Provider Review Required` or `Permission Required`: provider setup, Page linkage, App Review or scopes are still needed.
- `Degraded` or `Error`: a recent sanitized processing failure exists.
- `Planned`: no production implementation currently exists.

Callback and webhook URLs:

- Google OAuth localhost redirect URI: `http://localhost:3000/api/integrations/google/callback`
- Google OAuth production redirect URI: `https://YOUR_DEPLOYMENT_URL/api/integrations/google/callback`
- Meta production webhook callback URL: `https://YOUR_DEPLOYMENT_URL/api/webhooks/meta`
- Telegram production webhook URL: `https://YOUR_DEPLOYMENT_URL/api/webhooks/telegram`

Telegram webhook setup:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR_DEPLOYMENT_URL/api/webhooks/telegram" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

Discord worker setup:

```bash
npm run discord:worker
```

The worker requires `DISCORD_BOT_TOKEN`, `APP_BASE_URL` and `INTERNAL_INTEGRATION_SECRET`. `APP_BASE_URL` must point at the Vercel web/API deployment, for example `https://agenticopsai.xyz`. The bot uses only the Guilds, Guild Messages and Message Content Gateway intents. Enable the Message Content privileged intent in the Discord Developer Portal for the bot application. Do not enable Presence intent; Guild Members is not required by the current worker.

Railway Discord worker deployment:

- Platform: Railway.
- Source: this GitHub repository.
- Repository: this GitHub repository.
- Branch: `main`.
- Build command: `npm ci`.
- Start command: `npm run discord:worker`.
- Required Railway environment variables:
  - `DISCORD_BOT_TOKEN`
  - `DISCORD_APPLICATION_ID`
  - `INTERNAL_INTEGRATION_SECRET`
  - `APP_BASE_URL=https://agenticopsai.xyz`
  - `NODE_ENV=production`
- No Google, Meta, Telegram, OpenRouter, KV or Upstash credentials are required in Railway when the worker only posts authenticated normalized messages and heartbeats to Vercel.
- Vercel remains the website and API host. Upstash/Vercel KV remains the durable event and workflow store.
- No Railway public domain, database or persistent volume is required.
- Automatic GitHub deployments may be enabled for the Railway service after the start command and environment variables are set.
- View runtime logs in the Railway service Logs tab. Expected sanitized events include `discord_worker_starting`, `discord_gateway_ready`, `discord_message_received`, `discord_internal_api_success`, `discord_gateway_reconnecting` and `discord_worker_shutdown`.
- Test locally without connecting to Discord by running `npm run discord:worker -- --validate` with the required environment variables present.
- Test production flow by starting the Railway worker, sending a normal text message in the installed Discord test server, then checking `/integrations` for a recent Discord worker heartbeat, message count, processing success and approval-required workflow record.

Gmail readonly sync:

- The Google OAuth flow requests only `https://www.googleapis.com/auth/gmail.readonly`.
- OAuth tokens are encrypted before KV/Upstash persistence and are never returned to the browser.
- Manual sync defaults to `newer_than:7d` and caps `maxResults` at 10 messages.
- Sync retrieves Gmail metadata plus the safe Gmail snippet only; it does not store raw MIME, full HTML bodies, attachments or authorization headers.
- Gmail message IDs and thread IDs are hashed before persistence.
- Sender, recipient, subject and preview values are sanitized and previews are length-limited.
- Persisted Gmail workflows keep suggested responses approval-required and mark outbound execution unavailable.
- Duplicate syncs skip messages that already have a persisted workflow record.
- Future `gmail.send`, `gmail.modify`, drafts, labels, archive and delete capabilities remain planned only and are not requested or implemented.

Email Intelligence current scope:

- Current Gmail scope is `gmail.readonly` only.
- Implemented: connection status, manual sync, recent imported message records, categorization through analysis, priority/risk indicators, phishing-risk signals where detected, suggested reply outlines and human-review entries.
- Not implemented: send, reply, archive, label, delete, modify inbox, automatic follow-up, shared inbox assignment or automatic inbox organization.

Meta dashboard setup that code cannot perform automatically:

- Configure callback URL: `https://agenticopsai.xyz/api/webhooks/meta`.
- Enter the exact deployed `META_VERIFY_TOKEN`.
- Subscribe the app to the required Facebook Page Messenger webhook fields.
- Subscribe the Facebook Page webhook to the `feed` field so Page comment add/edit/remove changes are delivered.
- Ensure the Facebook Page is subscribed to the app.
- Ensure the Instagram professional account is linked to the correct Facebook Page.
- Subscribe the necessary Instagram messaging webhook fields.
- Subscribe Instagram to `comments` and `mentions` fields where supported for the app/account type.
- In development mode, only app roles, test users and connected test assets may generate events.
- Public users usually require the correct Meta permissions and App Review before events are delivered.

`Configuration detected` means environment variables exist. It does not prove webhook verification, Page subscription, Instagram linkage or live event delivery.

Meta ingestion privacy and diagnostics:

- Meta sender, recipient, message, comment, post and media identifiers are hashed before persistence.
- Supported Meta events are normalized into provider `facebook` or `instagram` with channel metadata such as `messenger`, `instagram`, `facebook_comment` or `instagram_comment`.
- Durable diagnostics use redacted categories such as `meta_message_received`, `facebook_comment_received`, `facebook_comment_edited`, `facebook_comment_removed`, `instagram_comment_received`, `instagram_mention_received`, `meta_analysis_started`, `meta_analysis_completed`, `meta_suggested`, `meta_failed`, `meta_comment_unsupported` and `meta_payload_unsupported`.
- Facebook and Instagram suggested replies remain approval-required. AgenticOps AI does not send replies, hide comments, delete comments, moderate users, publish content, manage ads or spend money.

Future roadmaps shown in the Integrations & AI Workspace:

- Email Workspace: draft complete replies, human-approved sending, `gmail.send`, `gmail.modify`, labels, archive, follow-up reminders, SLA tracking, shared inbox, assignment, thread summarization, attachment intelligence and email campaign analysis.
- Marketing Intelligence: social comment intelligence, mentions, campaign engagement analysis, brand-risk detection, lead identification, complaint detection, content-performance analysis, creative briefs and campaign reports.
- Advertising Intelligence: Meta Ads, Google Ads, YouTube campaigns, X Ads, LinkedIn Ads and TikTok Ads. AgenticOps AI must never spend money, launch campaigns, pause ads, change budgets, change targeting or publish creative without provider permissions, explicit human approval, audit logging and confirmation.
- CRM Intelligence: HubSpot, Salesforce, Zendesk, Intercom and Freshdesk for contact-context enrichment, lead classification, ticket prioritization, CRM note preparation and human-approved CRM updates.
- Business Data Intelligence: BigQuery, Google Cloud Platform, Google Workspace, Microsoft 365, data warehouses and BI tools for KPI dashboards, trend analysis, segmentation, anomaly detection and scheduled reporting. No Cloud Platform or BigQuery scopes are requested in this release.

## Storage Limitations

The current project repository uses local JSON storage at `data/projects.json`. This is acceptable for the MVP demo and local development, but it is not durable production storage on serverless platforms:

- writes may be unavailable, read-only or ephemeral depending on the platform;
- concurrent writes are not safe;
- project edits may disappear across deployments or function instances;
- Web3 batch results and Web3 project reports are stored in browser `localStorage`, not server-side persistence.
- Business Intelligence Workspace analyses, reports, profiles and proposed actions use the business repository abstraction.
- integration event/workflow records require `KV_REST_API_URL` and `KV_REST_API_TOKEN` or equivalent Upstash variables for durable serverless persistence.

For production, replace the local JSON repository with a managed database or durable storage service before relying on project creation/editing, persistent reports or multi-user workflows.

The no-login `/demo` route is self-contained and does not require local JSON writes, authentication, a database or an AI API key.

## Security And Error Handling

- API routes validate input with Zod.
- API errors use structured, sanitized JSON envelopes and do not expose stack traces.
- Dashboard runtime errors show a generic browser-safe message.
- AI provider failures return deterministic fallback results with safe suggested replies.
- Community-message links are never treated as official links unless they are stored in the project profile.

## API Examples

Health check:

```bash
curl https://YOUR_DEPLOYMENT_URL/api/v1/health
```

Expected response:

```json
{
  "service": "AgenticOps AI",
  "status": "healthy",
  "version": "1.0.0",
  "deterministicEngine": true
}
```

List public deterministic security rules:

```bash
curl https://YOUR_DEPLOYMENT_URL/api/v1/rules
```

Analyse a community message:

```bash
curl -X POST https://YOUR_DEPLOYMENT_URL/api/v1/analyse \
  -H "content-type: application/json" \
  -d '{
    "projectId": "demo-fictional-atlas-dao",
    "message": {
      "content": "Support needs you to send your seed phrase to verify the wallet.",
      "source": "DISCORD",
      "authorName": "Fake Admin"
    }
  }'
```

## Post-Deployment Route Checks

Test these public routes after manual deployment:

- `/`
- `/demo`
- `/business`
- `/integrations`
- `/integrations/gmail`
- `/privacy`
- `/data-deletion`
- `/docs/asp`
- `/dashboard`
- `/dashboard/projects/new`
- `/dashboard/projects/demo-fictional-atlas-dao`
- `/dashboard/projects/demo-fictional-atlas-dao/analyse`
- `/dashboard/projects/demo-fictional-atlas-dao/batch`
- `/dashboard/projects/demo-fictional-atlas-dao/report`
- `/api/v1/health`
- `/api/v1/rules`

Also test `POST /api/v1/analyse` and `POST /api/v1/analyse/batch` with an API client.

## Verification Commands

Run before deployment:

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run build
git status --short
```
