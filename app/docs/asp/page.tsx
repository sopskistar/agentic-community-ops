const serviceDescription =
  "AgenticOps AI includes a Web3 Community Security ASP service that audits Web3 community messages using a deterministic security engine and AI-assisted support layer. It detects scams, phishing, fake administrators, wallet threats and transaction issues, then produces explainable risk verdicts, safe reply suggestions and escalation actions.";

const sections = [
  {
    title: "Problem Solved",
    items: [
      "Web3 communities are attacked through fake admins, phishing links, wallet-verification scams, token-claim lures and credential requests.",
      "Community teams need fast, explainable support review without letting AI downgrade deterministic security risks.",
    ],
  },
  {
    title: "Intended Customers",
    items: [
      "Web3 community, support, security and moderation teams.",
      "Projects that need repeatable community-message audits and safer support reply suggestions.",
    ],
  },
  {
    title: "Supported Inputs",
    items: [
      "A project description, official documentation and explicit official links.",
      "One community message for single analysis or up to 25 community messages for batch analysis.",
      "Message sources: MANUAL, X, DISCORD, TELEGRAM, EMAIL or OTHER.",
    ],
  },
  {
    title: "Returned Outputs",
    items: [
      "Deterministic risk, AI-suggested risk and final risk.",
      "Triggered rule IDs, matched evidence, recommended actions and escalation status.",
      "Safe reply suggestions for human review and community risk report metrics.",
    ],
  },
  {
    title: "Published Rules",
    items: [
      "Public rules are available at /api/v1/rules.",
      "Rule IDs SEC-001 through SEC-015 are stable and explain seed phrase requests, fake admins, suspicious links, transaction issues and related risks.",
    ],
  },
  {
    title: "Safety Guarantees",
    items: [
      "Deterministic security analysis runs before AI analysis.",
      "AI can add classification and support language, but it cannot reduce deterministic risk.",
      "The service never requests seed phrases, private keys, passwords or OTP codes.",
      "The service never treats community-message links as official links.",
      "Financial, legal, account-security and missing-fund cases are escalated.",
    ],
  },
  {
    title: "Known Limitations",
    items: [
      "No payment integration is implemented yet.",
      "No authentication is implemented yet.",
      "Project knowledge-base storage currently uses local JSON and is not durable production storage on serverless platforms.",
      "Batch/report dashboard state is browser-local until server-side persistence is added.",
    ],
  },
  {
    title: "Pricing Suggestion",
    items: ["Suggested demonstration price: 1 USDC per audit."],
  },
  {
    title: "Health Endpoint",
    items: ["/api/v1/health returns service name, status, version and deterministic engine availability."],
  },
  {
    title: "Demo Route",
    items: ["/demo provides a no-login NovaBridge guided judge demonstration."],
  },
  {
    title: "Deployment Checklist",
    items: [
      "Set OPENAI_API_KEY in the deployment environment.",
      "Optionally set OPENAI_MODEL.",
      "Optionally set OPENAI_BASE_URL for OpenAI-compatible providers.",
      "Run tests, lint, TypeScript checking and production build.",
      "Confirm no real secrets are committed.",
      "Deploy over HTTPS and verify /api/v1/health.",
    ],
  },
  {
    title: "Registration Checklist",
    items: [
      "Submit service name: Community Message Security Audit.",
      "Submit service description and deliverable.",
      "Provide manifest and schema URLs.",
      "Provide demo route and health endpoint.",
      "Disclose known limitations and note that payment integration is intentionally deferred.",
    ],
  },
];

export default function AspDocsPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <header className="section-card p-6 md:p-8">
          <p className="kicker">
            AgenticOps AI ASP Documentation
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Community Message Security Audit
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600">
            {serviceDescription}
          </p>
        </header>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">Service Offering</h2>
          <dl className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <dt className="text-sm font-semibold text-slate-500">Name</dt>
              <dd className="mt-2 font-semibold">Community Message Security Audit</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Input</dt>
              <dd className="mt-2 text-sm leading-6 text-slate-700">
                A project description, official documentation and up to 25
                community messages.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">
                Deliverable
              </dt>
              <dd className="mt-2 text-sm leading-6 text-slate-700">
                Structured risk levels, triggered rules, suggested replies,
                escalations and a community risk report.
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="interactive-card p-6"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">API Examples</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <pre className="overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
{`GET /api/v1/health
GET /api/v1/rules`}
            </pre>
            <pre className="overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
{`POST /api/v1/analyse
{
  "projectId": "demo-fictional-atlas-dao",
  "message": {
    "content": "Support needs you to send your seed phrase.",
    "source": "DISCORD"
  }
}`}
            </pre>
            <pre className="overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100 lg:col-span-2">
{`POST /api/v1/analyse/batch
{
  "projectId": "demo-fictional-atlas-dao",
  "messages": [
    { "content": "Where are the docs?", "source": "MANUAL" },
    { "content": "I am the admin. DM me.", "source": "DISCORD" }
  ]
}`}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
