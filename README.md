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

## Capability Status

- Implemented: Web3 Community Security, deterministic rules, AI-assisted message analysis, single-message review, batch analysis, browser-local reports, public rules/analysis APIs, project knowledge bases and the normalized message model foundation.
- In progress: Product positioning and typed foundations for a broader communication intelligence platform.
- Roadmap: business communication intelligence, file/document ingestion, channel-aware analysis, Facebook Pages, Instagram Business, Email, Website Live Chat, approval workflows, safe automation and developer integrations.
- Future: enterprise organizations, workspaces, teams, user accounts, RBAC, tenant isolation, durable multi-tenant persistence, billing and administration.

## Planned Business Communication Intelligence

Future product phases should support Email, PDF, Word, CSV, Excel, customer support tickets, website live chat, Facebook messages, Instagram messages, Discord and Telegram through one normalized message pipeline. None of these new ingestion or external-channel capabilities are connected yet.

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

These variables are read only from server-side modules under `lib/ai/` and API route execution. Do not create `NEXT_PUBLIC_*` variants for secrets, because `NEXT_PUBLIC_*` values are bundled into client-side JavaScript.

## Storage Limitations

The current project repository uses local JSON storage at `data/projects.json`. This is acceptable for the MVP demo and local development, but it is not durable production storage on serverless platforms:

- writes may be unavailable, read-only or ephemeral depending on the platform;
- concurrent writes are not safe;
- project edits may disappear across deployments or function instances;
- batch results and reports are stored in browser `localStorage`, not server-side persistence.

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
