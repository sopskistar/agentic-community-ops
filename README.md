# Agentic Ops

Agentic Ops is an AI Communication Intelligence Platform. The current working MVP focuses on Web3 Community Security: it audits community messages with deterministic security rules first, then uses an OpenAI-compatible AI layer for classification, explanation and safe moderator reply suggestions. AI output can never reduce the deterministic risk level.

The product roadmap expands the same normalized message pipeline into broader business communication intelligence, document intelligence, channel-aware analysis and AI customer operations. Roadmap features are not claimed as live until implemented and verified.

## Current MVP

- Web3 Community Security
- AI-powered message analysis
- Scam and phishing detection
- Explainable deterministic decisions
- AI-generated moderator reply suggestions
- Batch analysis
- Community security reports
- A2A service capability

## Roadmap

Phase 1 strengthens Universal Web3 Community Security, expands reusable A2A capability beyond the OKX ecosystem, improves documentation, and prepares Discord and Telegram channel architecture.

Phase 2 adds a Business Intelligence Dashboard for pasted messages, full conversations, CSV, Excel, PDF, Word and plain-text uploads, conversation summaries, customer intent, complaints, leads, FAQs, priority detection and recommended actions.

Phase 3 adds Channel Intelligence and Communication Integrations for Facebook Pages, Instagram Business, Email and Website Live Chat. Every channel should enter the same normalized message pipeline while applying channel-aware analysis.

Phase 4 adds AI Customer Operations: reply suggestions, human approval, configurable auto-reply rules, escalation rules, confidence/risk controls, audit history and a safe default that never sends external replies without explicit authorization.

Phase 5 expands omnichannel coverage to Discord, Telegram, X, TikTok, WhatsApp Business, Slack and additional channels based on demand.

Phase 6 adds workflow automation and developer platform capabilities: REST API, A2A, MCP, SDKs, webhooks, configurable if/then workflows and external application integration.

Future enterprise features include organizations, workspaces, teams, user accounts, role-based access control, permissions, secure tenant data isolation, durable multi-tenant persistence, audit logs, API keys per organization, billing/subscription management and enterprise administration. These are roadmap items and are not implemented in the current MVP.

Additional future capability groups are tracked as roadmap items only:

- Communication Intelligence: Discord, Telegram, Gmail, Facebook Messenger, Instagram, Website Live Chat, WhatsApp Business, Slack and Microsoft Teams.
- Social and Community Intelligence: X, YouTube comments, LinkedIn company pages and comments, TikTok, Reddit, social listening, sentiment analysis, brand-risk detection, lead identification and complaint identification.
- AI Marketing Intelligence: Meta Ads, X Ads, LinkedIn Ads, TikTok Ads, Google Ads, YouTube campaign intelligence, campaign recommendations, audience suggestions, ad-copy generation, creative briefs, performance monitoring and human approval before campaign launch or budget changes.
- AI Email Workspace: future Gmail permissions such as `gmail.modify` and `gmail.send`, labels, archive, follow-up workflows, human-approved sending, phishing detection and priority detection.
- Business Intelligence: BigQuery, Cloud Platform integrations, KPI analysis, customer segmentation, business reporting, trend detection and anomaly detection.
- AI Business Operator: cross-channel workflows, task routing, approvals, audit history, executive summaries and controlled automation.

## Capability Status

- Implemented: Web3 Community Security, deterministic rules, AI-assisted message analysis, single-message review, batch analysis, browser-local reports, public rules/analysis APIs, project knowledge bases, polished platform positioning UI, normalized message model foundation and the `/business` Business Intelligence Dashboard MVP.
- In progress: Typed foundations for a broader communication intelligence platform.
- Roadmap: advanced business communication intelligence, PDF/DOCX/CSV/Excel ingestion, channel-aware analysis, Facebook Pages, Instagram Business, Email, Website Live Chat, approval workflows, safe automation and developer integrations.
- Future: enterprise organizations, workspaces, teams, user accounts, RBAC, tenant isolation, durable multi-tenant persistence, billing and administration.

## Planned Business Communication Intelligence

The `/business` route now provides a local Business Intelligence Dashboard MVP for normal business communications. It supports paste text, TXT upload, business profile selection, communication purpose selection and explainable local demonstration analysis for summary, intent, priority, sentiment, risk, requested actions, important entities, recommended next step, confidence, key topics, suggested actions and reply outline.

PDF extraction, Word/DOCX parsing, CSV ingestion, Excel ingestion, CRM sync, email integrations, Slack, Microsoft Teams, Google Workspace, ticket creation, Salesforce and HubSpot are still roadmap items and are not connected.

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
- `NEXT_PUBLIC_APP_URL`: public deployed app URL used for callback display, for example `https://YOUR_DEPLOYMENT_URL`.
- `APP_BASE_URL`: server-side base URL used by workers, for example `https://YOUR_DEPLOYMENT_URL`.
- `INTERNAL_INTEGRATION_SECRET`: shared secret for the Discord worker to call server-side processing.
- `OAUTH_TOKEN_ENCRYPTION_KEY`: required for encrypted Google OAuth token storage in both production KV and local development fallback.
- `INTEGRATION_EVENT_REPOSITORY`: optional; set to `memory` only for tests or explicit local fallback.
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
- Meta event ingestion supports Facebook Messenger DMs, Instagram Direct Messages, Facebook Page comments, Instagram comments, message reactions, postbacks and mention-style webhook changes when Meta delivers supported payloads.
- Telegram webhook receiver at `/api/webhooks/telegram`.
- Discord Gateway worker entry point at `workers/discord-bot.mjs`.
- Integration status page at `/integrations`.
- Privacy Policy at `/privacy` and Data Deletion Instructions at `/data-deletion`.
- Provider-independent integration event/workflow repository for received messages, analysis records, suggested responses, pending approval state and execution status.

Development-only limitations:

- Google OAuth tokens are encrypted before storage. Production uses Vercel KV/Upstash REST when `KV_REST_API_URL` plus `KV_REST_API_TOKEN` or the equivalent Upstash variables are configured. Filesystem OAuth token storage under `.agenticops/` is local-development only and is refused in production.
- Integration events and workflow records use Vercel KV/Upstash REST when configured. Tests use an in-memory repository, and local development without KV falls back to `.agenticops/integration-event-store.json`. The local file fallback is not suitable for Vercel production durability.
- Discord requires a persistent worker runtime such as Render, Railway, Fly.io or a VM. Do not run the Gateway worker inside a Vercel request lifecycle.
- All external channels are analyze-only. No automatic replies, moderation, email mutation, post publishing, ad management or user actions are implemented.
- Suggested replies and actions are stored as pending human-approval workflow records. Execution remains unavailable until provider permissions, tenant ownership and explicit approval workflows are implemented.

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
npm run worker:discord
```

The worker requires `DISCORD_BOT_TOKEN`, `APP_BASE_URL` and `INTERNAL_INTEGRATION_SECRET`. The bot needs Guilds, Guild Messages and Message Content intent access where permitted.

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

Meta dashboard setup that code cannot perform automatically:

- Configure callback URL: `https://agenticopsai.xyz/api/webhooks/meta`.
- Enter the exact deployed `META_VERIFY_TOKEN`.
- Subscribe the app to the required Facebook Page Messenger webhook fields.
- Ensure the Facebook Page is subscribed to the app.
- Ensure the Instagram professional account is linked to the correct Facebook Page.
- Subscribe the necessary Instagram messaging webhook fields.
- In development mode, only app roles, test users and connected test assets may generate events.
- Public users usually require the correct Meta permissions and App Review before events are delivered.

`Configuration detected` means environment variables exist. It does not prove webhook verification, Page subscription, Instagram linkage or live event delivery.

Meta ingestion privacy and diagnostics:

- Meta sender, recipient, message, comment, post and media identifiers are hashed before persistence.
- Supported Meta events are normalized into provider `facebook` or `instagram` with channel metadata such as `messenger`, `instagram`, `facebook_comment` or `instagram_comment`.
- Durable diagnostics use redacted categories such as `meta_message_received`, `meta_comment_received`, `meta_analysis_started`, `meta_analysis_completed`, `meta_suggested`, `meta_failed` and `meta_payload_unsupported`.
- Facebook and Instagram suggested replies remain approval-required. Agentic Ops does not send replies, hide comments, delete comments, moderate users, publish content, manage ads or spend money.

## Storage Limitations

The current project repository uses local JSON storage at `data/projects.json`. This is acceptable for the MVP demo and local development, but it is not durable production storage on serverless platforms:

- writes may be unavailable, read-only or ephemeral depending on the platform;
- concurrent writes are not safe;
- project edits may disappear across deployments or function instances;
- batch results and reports are stored in browser `localStorage`, not server-side persistence.
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
  "service": "Agentic Community Ops",
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
