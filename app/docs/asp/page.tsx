import Link from "next/link";

export const metadata = {
  title: "ASP Documentation | AgenticOps AI",
  description:
    "AgenticOps AI ASP documentation for OKX-ready communication risk analysis, Web3 community security, deterministic rules and future platform roadmap.",
};

const implementedSections = [
  {
    title: "Overview",
    items: [
      "AgenticOps AI includes a Web3 Community Security ASP service for community-message audits.",
      "For OKX.AI listing, the recommended service is AgenticOps Communication Risk & Intelligence Analysis through A2MCP.",
      "The ASP service returns explainable risk verdicts, triggered rules, recommendations, safe reply suggestions and escalation guidance.",
      "The wider AgenticOps AI platform also includes Business Intelligence and Integrations workspaces, but those are separate from the ASP registration contract.",
    ],
  },
  {
    title: "Architecture",
    items: [
      "Next.js App Router routes expose public service endpoints.",
      "The deterministic rule engine lives under lib/security.",
      "Hybrid analysis orchestration lives under lib/analysis and lib/ai.",
      "Project knowledge profiles live behind a repository abstraction.",
      "Integrations and business records use separate provider-neutral repositories.",
    ],
  },
  {
    title: "Communication Pipeline",
    items: [
      "Receive project context and one message, or up to 25 batch messages.",
      "Validate input with Zod.",
      "Run deterministic security rules first.",
      "Call the AI provider for structured enrichment when configured.",
      "Merge results without allowing AI to lower deterministic risk.",
      "Return suggested replies for human review.",
    ],
  },
  {
    title: "Rule Engine",
    items: [
      "SEC-001 through SEC-015 cover seed phrases, private keys, fake admins, suspicious links, remote access, OTP/password requests, prompt injection and spam.",
      "Rules produce severity, matched evidence, risk score and recommended action.",
      "Critical and high-risk findings require escalation.",
    ],
  },
  {
    title: "Human Approval",
    items: [
      "Replies are suggestions, not autonomous sends.",
      "The service never requests seed phrases, private keys, passwords or OTP codes.",
      "Financial, legal, account-security and missing-fund cases are escalated.",
    ],
  },
  {
    title: "Security and Privacy",
    items: [
      "API errors are sanitized.",
      "AI failures preserve deterministic output.",
      "Community-message links are never promoted to official links.",
      "No provider token or OAuth secret is exposed through the ASP endpoints.",
    ],
  },
];

const roadmapSections = [
  "Future AI Workspace",
  "Future Email Intelligence",
  "Future Marketing Intelligence",
  "Future CRM Intelligence",
  "Future Business Data Intelligence",
  "Future Advertising Intelligence",
  "Future outbound execution with explicit permissions and human approval",
];

export default function AspDocsPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <header className="section-card p-6 md:p-8">
          <p className="kicker">AgenticOps AI Documentation</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            AgenticOps Communication Risk & Intelligence Analysis
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600">
            Production documentation for the OKX-ready analyze-only A2MCP
            service, the implemented Web3 Community Security catalogue,
            platform architecture notes and clearly separated roadmap items.
          </p>
        </header>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">Service Offering</h2>
          <dl className="mt-5 grid gap-5 md:grid-cols-3">
            <SummaryItem
              label="Name"
              value="AgenticOps Communication Risk & Intelligence Analysis"
            />
            <SummaryItem
              label="Input"
              value="One bounded message with content, context and source."
            />
            <SummaryItem
              label="Deliverable"
              value="Summary, intent, sentiment, priority, risk, signals, suggested reply outline and explanation."
            />
          </dl>
          <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
            <CodeBlock value="POST https://agenticopsai.xyz/api/okx/analyze" />
            <CodeBlock value="POST https://agenticopsai.xyz/api/mcp" />
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          {implementedSections.map((section) => (
            <article key={section.title} className="interactive-card p-6">
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
          <h2 className="text-2xl font-semibold">Architecture Diagram</h2>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700 md:grid-cols-5">
            {[
              "Request",
              "Validation",
              "Deterministic Rules",
              "AI Enrichment",
              "Safe Response",
            ].map((step) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                {step}
              </div>
            ))}
          </div>
        </section>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">Sequence Diagram</h2>
          <pre className="mt-5 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
{`Client -> /api/v1/analyse: projectId + message
/api/v1/analyse -> Zod: validate request
Zod -> Security Engine: normalized content
Security Engine -> AI Provider: deterministic context + project context
AI Provider -> Merge Policy: structured enrichment
Merge Policy -> Client: final risk cannot be lower than deterministic risk`}
          </pre>
        </section>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">Example Requests</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <CodeBlock
              value={`GET /api/v1/health
GET /api/v1/rules
POST /api/okx/analyze
POST /api/mcp`}
            />
            <CodeBlock
              value={`POST /api/v1/analyse
{
  "projectId": "demo-fictional-atlas-dao",
  "message": {
    "content": "Support needs you to send your seed phrase.",
    "source": "DISCORD"
  }
}`}
            />
            <CodeBlock
              className="lg:col-span-2"
              value={`POST /api/v1/analyse/batch
{
  "projectId": "demo-fictional-atlas-dao",
  "messages": [
    { "content": "Where are the docs?", "source": "MANUAL" },
    { "content": "I am the admin. DM me.", "source": "DISCORD" }
  ]
}`}
            />
            <CodeBlock
              className="lg:col-span-2"
              value={`POST /api/okx/analyze
{
  "content": "Urgent wallet verification. Send your seed phrase now.",
  "context": "web3-community",
  "source": "telegram"
}`}
            />
          </div>
        </section>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">Current Limitations</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>x402 payment gating is not implemented in this ASP service.</li>
            <li>No authentication is implemented for the public ASP endpoints.</li>
            <li>Project knowledge-base storage uses local JSON and is not durable production storage on serverless platforms.</li>
            <li>Web3 batch/report dashboard state is browser-local.</li>
            <li>The OKX-facing endpoint is stateless and does not expose Gmail sync, OAuth operations, private integration events or approval mutation.</li>
          </ul>
        </section>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">Roadmap</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            These items are roadmap only unless separately marked implemented in
            the product UI.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {roadmapSections.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="badge border-slate-200 bg-white text-slate-700">
                  Future
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card mt-6 p-6">
          <h2 className="text-2xl font-semibold">Testing and Deployment</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>Run `npm test`, `npm run lint`, TypeScript checking and `npm run build` before deployment.</li>
            <li>Run `npm run test:production` against `https://agenticopsai.xyz` after deployment.</li>
            <li>Set `OPENAI_API_KEY` only in the deployment environment.</li>
            <li>Deploy over HTTPS and verify `/api/v1/health`, `/api/okx/analyze` and `/api/mcp`.</li>
            <li>Use placeholder values in API examples and never publish real secrets.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/docs/architecture" className="btn btn-secondary">
              Architecture
            </Link>
            <Link href="/demo" className="btn btn-primary">
              Guided Demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm leading-6 text-slate-700">{value}</dd>
    </div>
  );
}

function CodeBlock({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <pre className={`overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100 ${className}`}>
      {value}
    </pre>
  );
}
