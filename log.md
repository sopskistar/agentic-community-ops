# Project Log

## 2026-07-14 - Session: project memory setup

- What was built: Added repository memory files for session logging and project handoff context.
- Problems found: The repository did not yet have `log.md` or `handoff.md`; `README.md` still described the default create-next-app setup.
- Bugs fixed: None. Application functionality was not changed.
- Important technical decisions: `log.md` is append-only with newest entries at the top; `handoff.md` is the durable project status and rule source for future work.
- Tests performed: `npm run lint` passed; `npx tsc --noEmit --incremental false` passed; `npm run build` passed.
- New rules learned: Read `handoff.md` and `log.md` before meaningful changes; update both files after every meaningful build session; never allow AI to reduce deterministic risk; never invent official project information or official links; never request seed phrases, private keys, passwords, or OTP codes; never claim checks passed unless they were run; preserve existing working functionality.
