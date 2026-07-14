This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Memory

This repository uses two root-level memory files for continuity between build sessions:

- `log.md` records append-only session notes with the newest entry at the top, including what changed, problems found, fixes, decisions, checks, and rules learned.
- `handoff.md` records the current project status, blockers, next actions, architecture decisions, standing rules, demo requirements, and known limitations.

Read both files before meaningful changes and update them after each meaningful build session.

## API Examples

Health check:

```bash
curl http://localhost:3000/api/v1/health
```

Response:

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
curl http://localhost:3000/api/v1/rules
```

Analyse a community message:

```bash
curl -X POST http://localhost:3000/api/v1/analyse \
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

The analyse endpoint validates input, loads the selected project, runs deterministic security analysis first, then runs AI analysis when configured. If AI analysis fails or is not configured, the response still includes deterministic results and a safe fallback reply.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
