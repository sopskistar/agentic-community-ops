# Final Checklist

## Product Readiness

- [x] Deterministic security engine exists.
- [x] AI-assisted analysis exists.
- [x] AI cannot reduce deterministic risk.
- [x] Public rule list exists.
- [x] Single-message analysis API exists.
- [x] Batch analysis API exists.
- [x] Health endpoint exists.
- [x] Guided no-login demo exists.
- [x] ASP documentation page exists.
- [x] Service manifest exists.
- [x] JSON schemas exist.

## Environment Variables

- Required: `OPENAI_API_KEY`
- Optional: `OPENAI_MODEL`
- Do not commit real API keys.

## Final Audit Commands

Run before deployment:

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

## Environment-Variable Review

- `.env.example` contains only placeholder variable names.
- Real secrets must be configured in the deployment platform.
- `OPENAI_API_KEY` is required for live AI provider calls.
- Demo route works without external setup.

## Secret Exposure Review

- No real API keys should appear in tracked files.
- `.env*` files are ignored except `.env.example`.
- API errors must not expose stack traces or secrets.

## Responsive-Page Review

- Review `/`, `/demo`, `/docs/asp`, `/dashboard`, `/dashboard/projects/[id]/analyse`, `/dashboard/projects/[id]/batch` and `/dashboard/projects/[id]/report` on mobile and desktop widths.
- Confirm tables, cards, code blocks and long URLs wrap or scroll without overlap.

## Demo-Flow Review

- Open `/demo`.
- Confirm NovaBridge knowledge base appears first.
- Confirm normal message is LOW risk.
- Confirm fake-admin message is HIGH risk.
- Confirm seed-phrase request is CRITICAL risk.
- Confirm exact triggered rule and evidence appear.
- Confirm safe suggested reply appears.
- Confirm batch audit of ten messages appears.
- Confirm report metrics appear.
- Confirm "Why this is not an AI hallucination" appears.
- Confirm Reset Demo returns to `/demo`.

## Deployment Requirements

- HTTPS deployment URL.
- Node.js 22-compatible deployment environment.
- `npm ci` or equivalent dependency install.
- `npm run build` must pass.
- `OPENAI_API_KEY` configured in runtime environment.
- Optional `OPENAI_MODEL` configured if not using the default.

## Remaining ASP Registration Steps

- Deploy the application.
- Replace placeholder deployment URLs in registration materials.
- Verify public manifest URL.
- Verify public schema URLs.
- Verify health endpoint.
- Verify demo route.
- Submit service details to the ASP registration process.
- Do not advertise payment integration until it is implemented.

## Final Demo Recording Steps

1. Open `/demo`.
2. Show the NovaBridge knowledge base.
3. Scroll through LOW, HIGH and CRITICAL single-message verdicts.
4. Show the exact triggered rule for the seed-phrase case.
5. Show the safe suggested reply.
6. Show all ten batch messages.
7. Show the community security report.
8. End on "Why this is not an AI hallucination".
