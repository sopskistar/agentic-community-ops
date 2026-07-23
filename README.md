# AgenticOps AI

AgenticOps AI is an AI Communication Intelligence Platform. The implemented
product includes Web3 Community Security, Business Intelligence, communication
integrations, human approval workflows and explainable analysis.

The repository name remains `agentic-community-ops`.

## Screenshots

Screenshots are intentionally not committed in this repository. Use the deployed
application or local development server to capture current UI states.

## Implemented Features

- Web3 Community Security with deterministic scam, phishing, impersonation and
  unsafe-support detection.
- AI-assisted message analysis with deterministic-first risk merging.
- Batch analysis and browser-local Web3 reports.
- Business Intelligence Workspace for pasted text and supported business files.
- TXT, PDF, DOCX, CSV and XLSX ingestion with bounded extraction previews.
- Business Audit, Budget Review, Executive Reports, Knowledge Hub and Analysis
  History.
- Gmail readonly OAuth, manual sync and analyze-only message ingestion.
- Telegram webhook ingestion and analysis.
- Discord Gateway ingestion through a persistent Railway worker.
- Facebook Messenger webhook foundation and supported inbound processing.
- Instagram webhook foundation and supported payload processing where Meta
  delivers events.
- Integrations & AI Workspace with Communication Inbox, Approval Center, Event
  Log and Health & Diagnostics.
- Durable integration event/workflow storage through Vercel KV or Upstash REST.
- Encrypted Google OAuth token storage.
- Privacy and Data Deletion pages.

## Roadmap

Roadmap items are not implemented unless explicitly listed above.

- Email Workspace: human-approved sending, `gmail.send`, `gmail.modify`, labels,
  archive, follow-up, shared inbox and attachment intelligence.
- Marketing Intelligence: social comments, mentions, campaign engagement,
  brand-risk detection, lead identification and campaign reports.
- Advertising Intelligence: Meta Ads, Google Ads, YouTube campaigns, X Ads,
  LinkedIn Ads and TikTok Ads. No ad action may execute without provider
  permissions, explicit human approval and audit logging.
- CRM Intelligence: HubSpot, Salesforce, Zendesk, Intercom and Freshdesk.
- Business Data Intelligence: BigQuery, Google Cloud Platform, Google Workspace,
  Microsoft 365, data warehouses and BI tools.
- Enterprise: organizations, workspaces, RBAC, tenant isolation, billing,
  organization API keys and administration.

## Architecture

```text
Inputs and Channels
  -> Normalized Message/Data Models
  -> Deterministic Rules
  -> AI-Assisted Analysis
  -> Recommendations
  -> Human Review
  -> Reports, Event Logs and Diagnostics
```

Important boundaries:

- AI can enrich output but cannot lower deterministic Web3 risk.
- Integration workflows separate received message, analysis, suggestion,
  approval state, execution state and audit events.
- Current external integrations are analyze-only.
- Business reports are generated from saved analysis records only.
- Uploaded file bytes are parsed for extraction and are not permanently stored.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zod
- Vitest
- OpenAI-compatible AI provider support
- Vercel KV or Upstash REST for durable integration/business records
- Railway-compatible Discord worker

## Setup

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Do not commit `.env.local`.

Core:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `APP_BASE_URL`

Business:

- `BUSINESS_UPLOAD_MAX_BYTES`
- `BUSINESS_REPOSITORY`
- `BUSINESS_RECORD_RETENTION_DAYS`

Durable storage:

- `INTEGRATION_EVENT_REPOSITORY`
- `INTEGRATION_MESSAGE_RETENTION_DAYS`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

OAuth and integrations:

- `OAUTH_TOKEN_ENCRYPTION_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_VERIFY_TOKEN`
- `META_PAGE_ACCESS_TOKEN`
- `DISCORD_APPLICATION_ID`
- `DISCORD_PUBLIC_KEY`
- `DISCORD_BOT_TOKEN`
- `INTERNAL_INTEGRATION_SECRET`

## Validation

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

Discord worker configuration validation:

```bash
DISCORD_BOT_TOKEN=placeholder \
DISCORD_APPLICATION_ID=placeholder \
INTERNAL_INTEGRATION_SECRET=placeholder \
APP_BASE_URL=https://agenticopsai.xyz \
npm run discord:worker -- --validate
```

## Deployment

- Vercel or another Next.js-compatible host runs the web app, API routes and
  webhooks.
- Railway runs only the persistent Discord Gateway worker.
- Upstash/Vercel KV stores durable integration events, workflows and production
  token/business records when configured.
- No Railway public domain, database or persistent volume is required for the
  Discord worker.

Railway worker:

- Build command: `npm ci`
- Start command: `npm run discord:worker`
- Required variables: `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`,
  `INTERNAL_INTEGRATION_SECRET`, `APP_BASE_URL`, `NODE_ENV=production`

## Security

- Never expose provider secrets or OAuth tokens to the browser.
- Gmail uses `gmail.readonly` only.
- Meta signatures and Telegram webhook secrets are validated where configured.
- Discord worker calls Vercel through `INTERNAL_INTEGRATION_SECRET`.
- Provider identifiers are hashed or redacted before persistence where
  applicable.
- No automatic replies, moderation, email mutation, ad actions, CRM writes or
  payment actions are implemented.

## API Documentation

- Human-readable ASP docs: `/docs/asp`
- Architecture page: `/docs/architecture`
- API testing guide: `docs/api-testing.md`
- Public health: `/api/v1/health`
- Public rules: `/api/v1/rules`
- Single analysis: `/api/v1/analyse`
- Batch analysis: `/api/v1/analyse/batch`

## Known Limitations

- No authentication or tenant isolation is implemented yet.
- Web3 project storage uses local JSON and is not production durable on
  serverless platforms.
- Web3 batch reports are browser-local.
- Business analysis is AI-assisted decision support, not certified audit,
  accounting, legal, tax or investment advice.
- OCR, legacy `.doc`, legacy `.xls` and `.xlsm` parsing are unsupported.
- Meta production delivery depends on provider dashboard setup, subscriptions,
  account linkage, app mode and App Review.

## Contributing

Use small, tested changes. Preserve implemented routes and provider security
controls. Run the full validation suite before committing.

## License

No open-source license has been selected yet. Treat this repository as private
unless a license is added.
