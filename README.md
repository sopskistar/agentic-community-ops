# Agentic Community Ops

Agentic Community Ops is a Web3 community security and support MVP. It audits community messages with deterministic security rules first, then uses an OpenAI-compatible AI layer for classification, explanation and safe suggested replies. AI output can never reduce the deterministic risk level.

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
