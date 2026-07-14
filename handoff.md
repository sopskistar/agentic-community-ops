# Current Status

Agentic Community Ops is a Next.js App Router project for a Web3 community security and support Agent Service Provider. The current app has a product landing page for threat detection, safe response workflows, deterministic security rules, escalation, and reporting. A deterministic security engine now exists under `lib/security/` with 15 public Web3 community safety rules and tests.

# Current Blockers

No active implementation blockers are known.

# Next Actions

- Build the `/demo` experience for message analysis using `analyseSecurity`.
- Build the `/dashboard` experience for community security reports and escalations.
- Add UI surfaces for triggered rules, deterministic risk, risk score, escalation state, and safe reply eligibility.
- Add tests around any future UI or API integration that consumes the deterministic engine.

# Architecture Decisions

- The deterministic security engine decides the minimum risk level.
- AI may add classification, explanations, and suggested replies, but it must never reduce deterministic risk.
- The current deterministic engine is implemented in `lib/security/analyse-security.ts`; public rule metadata is exported from `lib/security/rules.ts`.
- The highest triggered rule severity determines `deterministicRisk`; `riskScore` is deterministic and capped at 100.
- CRITICAL and HIGH rules require escalation by default; explicit MEDIUM escalation rules can also require escalation.
- Suggested replies must be grounded in project documentation and must avoid unsafe financial or credential-handling instructions.
- Dangerous, financial, or uncertain cases must be escalated rather than auto-resolved.
- The app uses Next.js App Router, TypeScript, Tailwind CSS, ESLint, and Node.js 22.
- The app uses local system font stacks to avoid network-dependent Google Fonts during production builds.
- Vitest is used for deterministic security engine tests.

# Standing Rules

- Read handoff.md and log.md before meaningful changes.
- Never allow AI to reduce a deterministic risk level.
- Never invent official project information.
- Never present unknown URLs as official links.
- Never request seed phrases, private keys, passwords or OTP codes.
- Never claim a task passed unless the relevant checks were actually run.
- Update log.md and handoff.md after every meaningful build session.
- Preserve existing working functionality.

# Demo Requirements

- Accept a community message as input.
- Run deterministic security rules first via `analyseSecurity`.
- Show the minimum deterministic risk level.
- Add AI-style classification without lowering deterministic risk.
- Explain exactly which security rules were triggered.
- Generate safe suggested replies from known project documentation only.
- Escalate dangerous, financial, or uncertain cases.
- Produce community security report summaries.

# Known Limitations

- `/demo` and `/dashboard` are navigation targets but are not implemented yet.
- The deterministic engine uses regex and explicit matching rules; it is deterministic but not a substitute for full abuse-intelligence feeds, domain allowlists, or human review.
- No AI classification or documentation-grounded reply generation exists yet.
- No authentication is implemented, by design for the current scope.
- Automated tests currently focus on the deterministic security engine.
