# Project Log

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
