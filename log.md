# Project Log

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
