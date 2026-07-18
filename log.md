# Project Log

## 2026-07-18 - Session: branding and roadmap update

- What was built: Confirmed `public-logo/Agentic-Ops.jpg`, copied it unchanged to `public/logo/Agentic-Ops.jpg`, added exact unchanged copies at `app/icon.jpg` and `app/apple-icon.jpg`, updated shared navigation/footer branding, metadata icon/Open Graph branding, and repositioned the landing page around Agentic Ops as an AI Communication Intelligence Platform. Added current MVP, roadmap phases, channel-aware analysis and future enterprise feature sections. Updated `README.md`, `docs/architecture.md`, `docs/implementation-plan.md`, and `handoff.md`.
- Problems found: Existing API health and ASP registration artifacts still use the original Agentic Community Ops service naming; those were intentionally left unchanged to avoid modifying public API contract expectations or ASP registration materials in this branding-only task.
- Bugs fixed: None. This was scoped to branding, copy, public asset placement and documentation.
- Important technical decisions: The JPG logo is reused without visual alteration; roadmap features are explicitly labeled as future work; no external APIs, OAuth, secrets, database, API contract changes, OKX ASP changes or messaging foundation internals were modified.
- Tests performed: `npm test` passed with 65 tests across 9 files; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed and generated 19 static pages/routes plus dynamic API routes. Build emitted the expected Next metadataBase warning for relative Open Graph images because no production deployment URL is configured in this repository.
- New rules learned: Brand positioning can expand to Agentic Ops while current MVP and ASP materials must keep live capability claims precise until implementation catches up.

## 2026-07-18 - Session: messaging foundation

- What was built: Added the reusable normalized messaging foundation under `lib/messages/`, including constants/enums, TypeScript models, Zod schemas, metadata-only channel profiles, barrel exports, and unit tests. Updated `docs/architecture.md`, `docs/implementation-plan.md`, and `handoff.md` for the completed phase and next prompt scope.
- Problems found: The initial focused run caught a test import pointing at the wrong module and missing explicit `relatedSources` fields in channel profile objects; both were fixed before full validation.
- Bugs fixed: None in existing production behavior. This change is isolated infrastructure and does not modify UI, existing API responses, environment variables, storage, integrations, OKX ASP registration or deployed identity.
- Important technical decisions: `organizationId` remains optional for future tenant boundaries; `recipient` is an array to support page, inbox, group and email cases; channel profiles are structured metadata only, not AI prompts; existing routes are not wired to the new model until the next approved mapper task.
- Tests performed: `npm test` passed with 65 tests across 9 files; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed and generated 17 static pages/routes plus dynamic API routes.
- New rules learned: Future channel adapters must normalize payloads into `NormalizedMessage` before analysis, but outbound sending and persistence still require separate approval.

## 2026-07-18 - Session: staged expansion architecture audit

- What was built: Completed a repository current-state audit for the Stage 1-4 expansion plan and added `docs/architecture.md`, `docs/feature-gap-analysis.md`, and `docs/implementation-plan.md`. Updated `handoff.md` with inspected files, created documentation, architecture findings, blockers, and the exact recommended next Codex prompt.
- Problems found: The MVP has strong deterministic-first Web3 analysis, public APIs, batch analysis and browser-local reports, but lacks a normalized message model, durable multi-tenant persistence, authentication, file ingestion, channel adapters, webhook handling, approval workflows, automation rules, outbound-send authorization, and audit logs.
- Bugs fixed: None. This was documentation and audit work only.
- Important technical decisions: Preserve existing production UI/API behavior. Treat Discord, Telegram, Meta, email and live chat as future adapters feeding one normalized pipeline. Do not connect external APIs, add secrets, mutate OKX/ASP identity, or introduce a database before approval.
- Tests performed: `npm test` passed with 55 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed and generated 17 static pages/routes plus dynamic API routes.
- New rules learned: Stage 1 should start with a type-only normalized message model and schemas before adapters, file ingestion, durable storage or auto-reply workflows are implemented.

## 2026-07-15 - Session: final responsive UI refinement

- What was built: Completed a narrow UI-only refinement pass before feature completion. Added a hamburger navigation menu for small and tablet screens while preserving desktop navigation, improved spacing beneath the sticky header, tightened landing badge contrast in Light and Dark mode, aligned dashboard project tone badges with card titles, and normalized dashboard card height/alignment.
- Problems found: Mobile/tablet navigation was still crowded as a horizontal scroll row. The landing hero badge depended on generic dark-mode color overrides instead of an explicit contrast treatment. Dashboard project tone badges were top-aligned against the full card header content rather than centered with the project title.
- Bugs fixed: Removed the mobile horizontal nav scroller in favor of an accessible menu button with `aria-expanded`/`aria-controls`. Added a small content offset under the sticky header for mobile. Kept project card rows wrapping safely to avoid narrow-screen overflow.
- Important technical decisions: No functionality, security engine logic, API behavior, AI behavior, data flow or route behavior was changed. Verification of the requested 360px, 390px, 768px, 1024px and 1440px breakpoints was source/CSS based because no Playwright/Cypress browser binary is installed in the project.
- Tests performed: `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Keep the desktop nav breakpoint explicit and use a menu below `lg` so 360px, 390px and 768px layouts do not depend on horizontal navigation scrolling.

## 2026-07-15 - Session: responsive SaaS UI polish with dark mode

- What was built: Polished the application UI across the shared shell, landing page, demo, dashboard, project forms, security engine, ASP docs, loading and error states. Added a persistent Light/Dark mode toggle in the shared navigation, first-visit system preference detection, a clean shared footer, stronger focus states, shared card/button/form styling, responsive page shells, compact dashboard cards, clearer message-review wording and subtle hover/transition behavior.
- Problems found: The existing UI relied on repeated page-local Tailwind classes, had no dark mode, had some inconsistent page headers/cards/buttons, and still used confusing "triage" wording in user-facing copy. The first lint run flagged synchronous state initialization inside a theme effect.
- Bugs fixed: Reworked theme initialization into a lazy client-safe initializer and document-sync effect so ESLint passes. Removed an invalid responsive utility from the landing page. Kept mobile navigation horizontally contained with an internal scrollable nav row and hidden page overflow.
- Important technical decisions: Changes stayed presentation-only. The deterministic security engine, API behavior, AI analysis flow, project repository behavior, and report/batch calculations were not modified.
- Tests performed: `npm test` passed with 55 tests; `npm run lint` passed after the theme initialization fix; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Theme persistence should be initialized before paint and synchronized from React state without setState-in-effect patterns that violate the current React lint rules.

## 2026-07-14 - Session: hackathon UI and navigation polish

- What was built: Polished the application UI for hackathon judging without changing architecture, deterministic security logic, AI analysis logic, API contracts, data models or storage. Added a consistent responsive root navigation bar, created a dedicated `/security-engine` rule catalog page, refreshed the landing page, improved Guided Judge Demo presentation, and aligned dashboard cards, forms, buttons, badges, panels and headers.
- Problems found: The landing page had its own local navigation and linked Security Engine to an in-page anchor, creating inconsistent navigation and a weak Security Engine destination. Several pages used similar but not fully consistent spacing, card radius, button hover behavior and header treatment.
- Bugs fixed: Removed navigation dead ends by adding global navigation across pages and a dedicated Security Engine route. Updated client-side error display to read the existing structured API error message cleanly.
- Important technical decisions: UI polish stayed presentation-only. The deterministic engine, hybrid analysis service, API route contracts, project repository and storage implementation were not changed.
- Tests performed: `npm test` passed with 55 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed and included `/security-engine`; `git status --short` reviewed before commit.
- New rules learned: Hackathon UI work should keep product navigation global and recoverable while preserving all security and analysis behavior unchanged.

## 2026-07-14 - Session: production deployment preparation

- What was built: Prepared the MVP for manual production deployment by replacing starter README content with deployment instructions, adding structured API error responses, adding generic production-safe root error UI, tightening dashboard error display, and documenting serverless/local JSON storage limitations.
- Problems found: README still contained create-next-app starter guidance and outdated Google Fonts text. API error payloads were sanitized but not consistently structured. Dashboard error UI displayed raw error messages. Local JSON project storage remains an MVP limitation for serverless production writes.
- Bugs fixed: Standardized API error envelopes as `{ error: { code, message, issues? } }`; replaced browser-visible error details with generic messages; documented that `.env.local` is ignored and that secrets must not use `NEXT_PUBLIC_*` names.
- Important technical decisions: The no-login demo remains self-contained and does not depend on local JSON writes, authentication, database setup or AI API keys. Serverless deployment is acceptable for the demo and API reads, but project creation/editing and persistent reports require durable storage before production multi-user use.
- Tests performed: `npm test` passed with 55 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed; `git status --short` reviewed before commit; `/api/v1/health` returned `healthy`; `.env.local` was confirmed ignored and untracked; secret/client-boundary scans found no client-side secret env usage.
- New rules learned: Deployment readiness must distinguish a successful local build from manual deployment success; never claim deployment succeeded before the deployed URL is tested.

## 2026-07-14 - Session: OpenRouter live AI integration verification

- What was built: Re-ran live AI integration against the configured OpenRouter-compatible endpoint through the production `/api/v1/analyse` route. Added a narrow compatibility normalization for AI responses that return `evidenceUsed` as a single string, and added a deterministic knowledge-base coverage guard so AI cannot mark missing project information as grounded without source coverage.
- Problems found: Some OpenRouter-compatible responses returned valid JSON but used a single string for `evidenceUsed`, causing the app to reject otherwise usable live AI output. A missing-knowledge prompt was initially marked grounded by the AI even though the project knowledge base did not contain validator slashing or compensation details. A generated `.next/dev` route type file from an earlier dev-server run was corrupted and caused one TypeScript check failure until the ignored dev cache was removed.
- Bugs fixed: Normalized single-string `evidenceUsed` values into arrays before Zod validation; forced escalation and `answerGroundedInKnowledgeBase: false` when deterministic knowledge coverage is missing; removed the ignored `.next/dev` cache so TypeScript used clean generated types.
- Important technical decisions: Deterministic risk merging remains unchanged; final risk must still be at least deterministic risk. Knowledge-grounding is now checked after AI validation using only supplied project description, documentation and official links.
- Tests performed: Production server live checks passed for safe documentation, failed transaction, fake administrator, seed-phrase scam, prompt injection and missing-knowledge cases without printing secrets; `npm test` passed with 55 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed after clearing ignored generated dev cache; `npm run build` passed.
- New rules learned: OpenAI-compatible providers can vary small structured-output shapes; normalize low-risk shape differences before validation, but keep missing/unsafe knowledge checks deterministic and fail closed.

## 2026-07-14 - Session: local AI integration verification

- What was built: No product features were added. Verified local AI integration wiring through the running `/api/v1/analyse` endpoint and checked AI environment-variable presence without printing values.
- Problems found: `OPENAI_API_KEY` and `OPENAI_MODEL` are present, but the configured OpenAI-compatible provider returned `402 Insufficient credits`, so live AI-generated replies could not be confirmed with the current provider account. Local API responses correctly preserved deterministic fallback output when the AI call failed.
- Bugs fixed: None; no implementation errors were found.
- Important technical decisions: The API must continue to return deterministic-first fallback results when the AI provider fails for external reasons such as provider credits, authentication or network availability.
- Tests performed: Local dev server started and `/api/v1/analyse` was exercised for safe documentation, failed transaction, fake administrator, seed-phrase scam, prompt injection and missing-knowledge cases; `npm test` passed with 53 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Provider health checks may report presence and sanitized status metadata only; never print secret environment values or raw provider credentials.

## 2026-07-14 - Session: OpenAI-compatible base URL support

- What was built: Made the OpenAI analysis provider explicitly read optional `OPENAI_BASE_URL` configuration while preserving the default OpenAI endpoint when it is unset.
- Problems found: The installed OpenAI SDK already supports a `baseURL` client option and documents `OPENAI_BASE_URL`; the project provider was not passing it explicitly.
- Bugs fixed: None.
- Important technical decisions: `OPENAI_BASE_URL` is optional, trimmed, and omitted when empty so the SDK keeps its default endpoint behavior.
- Tests performed: `npm test` passed with 53 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed.
- New rules learned: OpenAI-compatible provider configuration should expose API key, model, and optional base URL separately.

## 2026-07-14 - Session: complete MVP verification

- What was built: No new product features were added. Audited the repository against the complete Agentic Community Ops MVP, inspected route structure and git history, verified public ASP artifacts, and confirmed final build readiness.
- Problems found: No missing or broken MVP requirements were found. Secret scan returned one benign false-positive phrase in a rule description: `risk-free`.
- Bugs fixed: None.
- Important technical decisions: The MVP is ready for deployment verification and ASP registration preparation; remaining work is external deployment, environment configuration, public URL replacement, and ASP submission.
- Tests performed: `npm test` passed with 53 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed; manifest and schema JSON parsing passed; route structure and git history were inspected; environment-variable and secret exposure reviews completed.
- New rules learned: Final verification should record exact commands, route inventory, manual external actions, and known deployment requirements before submission.

## 2026-07-14 - Session: ASP registration preparation

- What was built: Added public service manifest, JSON input/output schemas for single and batch analysis, `/docs/asp`, `ASP_REGISTRATION.md`, and `FINAL_CHECKLIST.md` for OKX.AI Agent Service Provider registration preparation.
- Problems found: No unsupported OKX or payment integration should be implemented before deployment; documentation now explicitly states payment integration is deferred and the 1 USDC price is a suggested demonstration price only.
- Bugs fixed: None. This session added documentation, schemas and registration artifacts without changing core analysis behavior.
- Important technical decisions: ASP materials describe the existing service honestly, reference public endpoints and schemas, and do not claim OKX payment support or any unimplemented integration.
- Tests performed: `npm test` passed with 53 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed; public JSON files parsed successfully; environment-variable and secret exposure reviews completed; responsive-page and demo-flow source reviews completed.
- New rules learned: Registration materials must distinguish deployed product capabilities from future/payment integration work; manifests and schemas should be public static files and safe to share.

## 2026-07-14 - Session: guided judge demo

- What was built: Added a polished no-login `/demo` page using the fictional NovaBridge project, safe fictional documentation and official links, ten fictional messages, single-message LOW/HIGH/CRITICAL walkthroughs, exact triggered-rule proof, safe suggested reply, batch audit, community security report, reset control, and "Why this is not an AI hallucination" explanation.
- Problems found: The first lint run found an unused type import in the demo page; removed it before final checks.
- Bugs fixed: Removed the unused import and kept the demo self-contained with a local mock AI provider so no external API key or setup is required.
- Important technical decisions: The demo uses the real `analyseMessage` hybrid flow, deterministic security engine, and `createBatchSummary` metrics, but swaps in a local NovaBridge AI provider for reproducible no-setup judge recordings. Report numbers are measured from actual demo analysis results.
- Tests performed: `npm test` passed with 53 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Judge demos should be reproducible without secrets, clearly fictional, and short enough to record end-to-end in 90 seconds.

## 2026-07-14 - Session: batch analysis and reporting

- What was built: Added `POST /api/v1/analyse/batch`, batch summary generation, controlled-concurrency batch analysis, batch route integration tests, deterministic summary tests, `/dashboard/projects/[id]/batch`, and `/dashboard/projects/[id]/report`.
- Problems found: The first lint run reported an unused import in the batch route; removed it before final checks. Batch/report storage is currently browser-local because persistent analysis storage has not been added yet.
- Bugs fixed: Removed the unused batch route import and kept batch metrics in a reusable deterministic helper so identical stored input produces identical measured summaries.
- Important technical decisions: Maximum batch size is 25 messages; invalid messages are returned in `failedResults` while valid messages continue through analysis; AI failures are contained by the existing deterministic fallback path; report metrics are recomputed from stored analysis results and kept separate from interpretation.
- Tests performed: `npm test` passed with 53 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Batch analysis must isolate per-message failures; reports must not invent counts and must derive all metrics from actual analysis results.

## 2026-07-14 - Session: analysis API and dashboard analyser

- What was built: Added `POST /api/v1/analyse`, `GET /api/v1/health`, `GET /api/v1/rules`, API input validation, route-handler integration tests, a project message-analysis UI at `/dashboard/projects/[id]/analyse`, README API examples, and a default AI provider factory that safely falls back when OpenAI is not configured.
- Problems found: Initial route-handler tests failed because the new API route imports walked one directory too high; corrected the relative import paths. The API must tolerate missing OpenAI configuration and still return deterministic results, so the default AI provider fails closed into the existing deterministic fallback path.
- Bugs fixed: Fixed API route import paths for Vitest and ensured `.env.example` remains committable despite `.env*` ignore rules from a prior session.
- Important technical decisions: API errors return sanitized messages only; stack traces and secrets are not exposed. The analyse endpoint limits message content to 2,000 characters, loads the selected project, runs deterministic analysis first, then AI analysis, and returns deterministic output even when AI is unavailable. The dashboard analysis UI posts to the API rather than calling analysis logic directly.
- Tests performed: `npm test` passed with 48 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Public API routes must sanitize validation and runtime errors; dashboard analysis output must show proof, escalation state, generated reply review disclaimers, and final risk evidence.

## 2026-07-14 - Session: hybrid message-analysis service

- What was built: Added a hybrid message-analysis service under `lib/analysis/` and `lib/ai/` that runs deterministic security first, calls an OpenAI-compatible provider for structured AI classification, validates AI output with Zod, and merges results without allowing AI to reduce deterministic risk.
- Problems found: `openai` was not installed, so it was added as the only new required package. Vitest did not resolve the Next `@/*` alias for new library imports, so the new library modules use relative imports for test compatibility. A prompt-injection test correctly triggered both prompt-injection and OTP rules, raising final risk to CRITICAL.
- Bugs fixed: Fixed test-runner import resolution for new analysis modules and corrected the prompt-injection test expectation to preserve the higher deterministic risk.
- Important technical decisions: `finalRisk` is always the higher of `deterministicRisk` and `aiSuggestedRisk`; AI output is accepted only after Zod validation; provider/API failures and invalid AI JSON return deterministic results with a safe fallback reply and escalation; `.env.example` documents `OPENAI_API_KEY` and `OPENAI_MODEL`.
- Tests performed: `npm test` passed with 42 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Community messages are untrusted; AI replies must be suggestions for human review; AI must use only supplied official links; missing knowledge, financial, legal, account-security, missing-fund and AI failure cases require escalation.

## 2026-07-14 - Session: project knowledge base MVP

- What was built: Added a local JSON-backed project knowledge-base system with TypeScript types, Zod validation schemas, a repository interface, a local JSON repository implementation, repository tests, dashboard project list, project creation page, and project editing page.
- Problems found: Zod was not a direct dependency even though validation schemas were required, so it was added. npm continued to report 2 moderate audit findings after dependency installation.
- Bugs fixed: None from existing functionality. New repository tests verify URL validation, explicit official-link storage, project creation, project update, missing-file handling, and unknown-project update errors.
- Important technical decisions: Project official links are stored only from the explicit `officialLinks` field; URLs found inside documentation or community messages are never promoted to official links. Local JSON storage lives at `data/projects.json` behind the `ProjectRepository` interface so it can be replaced later by a database.
- Tests performed: `npm test` passed with 33 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Validate project URLs with Zod before persistence; keep local storage behind a repository contract; clearly label fictional demo projects.

## 2026-07-14 - Session: deterministic security engine

- What was built: Added a deterministic Web3 community security rule engine under `lib/security/` with typed analysis output, 15 stable public rules, public UI rule metadata, deterministic risk scoring, escalation decisions, safe-auto-reply decisions, and Vitest coverage.
- Problems found: No test framework existed, so Vitest was installed as the only new dev dependency. The first test run exposed a punctuation-normalization gap where `private-key` did not match `private key`.
- Bugs fixed: Updated message normalization to treat hyphenated sensitive terms as equivalent to spaced terms.
- Important technical decisions: The highest triggered severity determines `deterministicRisk`; `riskScore` is deterministic and capped at 100; CRITICAL and HIGH rules require escalation by default; SEC-009 and SEC-010 explicitly require escalation; AI is not used by the engine.
- Tests performed: `npm test` passed with 27 tests; `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Safe educational statements must avoid false positives where possible; deterministic matching must normalize case and punctuation; identical inputs must return identical outputs.

## 2026-07-14 - Session: project memory setup

- What was built: Added repository memory files for session logging and project handoff context.
- Problems found: The repository did not yet have `log.md` or `handoff.md`; `README.md` still described the default create-next-app setup.
- Bugs fixed: None. Application functionality was not changed.
- Important technical decisions: `log.md` is append-only with newest entries at the top; `handoff.md` is the durable project status and rule source for future work.
- Tests performed: `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Read `handoff.md` and `log.md` before meaningful changes; update both files after every meaningful build session; never allow AI to reduce deterministic risk; never invent official project information or official links; never request seed phrases, private keys, passwords, or OTP codes; never claim checks passed unless they were run; preserve existing working functionality.
