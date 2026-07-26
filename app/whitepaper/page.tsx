import Link from "next/link";

export const metadata = {
  title: "White Paper | AgenticOps AI",
  description:
    "AgenticOps AI Version 1.0 technical white paper for the AI Security and Communication Intelligence Platform.",
};

const pdfPath = "/whitepaper/AgenticOps-AI-White-Paper-v1.pdf";

const currentCapabilities = [
  "Web3 Community Security",
  "Business Communication Intelligence",
  "Communication Inbox",
  "Human Approval Center",
  "Event Log",
  "Reports Dashboard",
  "Knowledge Hub",
  "TXT, PDF, DOCX, CSV and XLSX analysis",
  "Gmail readonly integration",
  "Telegram integration",
  "Facebook Messenger integration",
  "Instagram integration foundation",
  "Discord Gateway worker",
  "Unified communication pipeline",
  "Explainable AI, risk scoring and confidence scoring",
  "Upstash KV persistence",
];

const roadmapGroups = [
  {
    title: "Communication Channels",
    items: ["X", "LinkedIn", "Slack", "Microsoft Teams", "WhatsApp Business"],
  },
  {
    title: "Social Intelligence",
    items: [
      "Social comment intelligence",
      "Direct message intelligence",
      "Brand monitoring",
      "Reputation analytics",
    ],
  },
  {
    title: "Marketing Intelligence",
    items: [
      "Social ad management with human approval",
      "AI marketing intelligence",
    ],
  },
  {
    title: "Business Operations",
    items: [
      "Gmail send/modify actions with user approval",
      "Calendar intelligence",
      "Workflow automation",
    ],
  },
  {
    title: "Enterprise and AI Platform",
    items: [
      "BigQuery integration",
      "Google Cloud integrations",
      "Multiple LLM providers",
      "AI agent orchestration",
      "AI business operator",
    ],
  },
];

const stack = [
  "Next.js App Router",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Zod",
  "OpenRouter-compatible LLM reasoning",
  "Upstash Redis / Vercel KV",
  "Gmail readonly API",
  "Telegram, Meta and Discord integrations",
  "Vitest, ESLint and production smoke tests",
];

export default function WhitePaperPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <header className="section-card overflow-hidden p-0">
          <div className="border-b border-slate-200 bg-slate-950 px-6 py-10 text-white md:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">
              Technical White Paper
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              AgenticOps AI
            </h1>
            <p className="mt-3 max-w-3xl text-2xl font-semibold text-slate-100">
              AI Security and Communication Intelligence Platform
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-300">
              Version 1.0 documents the first production release: Web3
              Community Security, Business Communication Intelligence,
              connected ingestion foundations, document intelligence,
              explainable AI outputs, reports, event logs and human approval
              workflows.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={pdfPath} download className="btn btn-primary">
                Download White Paper
              </a>
              <Link href="/docs/asp" className="btn btn-secondary">
                ASP Documentation
              </Link>
            </div>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-4 md:p-8">
            <SummaryStat label="Release" value="Version 1.0" />
            <SummaryStat label="Mode" value="Analyze-only" />
            <SummaryStat label="OKX service" value="A2MCP submitted" />
            <SummaryStat label="Safety" value="Human approval" />
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1fr]">
          <article className="section-card p-6">
            <p className="kicker">Executive Summary</p>
            <h2 className="mt-3 text-2xl font-semibold">
              One engine for communication risk and intelligence.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              AgenticOps AI helps organizations analyze communications across
              multiple channels using deterministic security rules, AI
              reasoning, explainable risk scoring, confidence scoring and human
              approval workflows.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The platform solves fragmentation across community messages,
              email, social conversations, business documents, spreadsheets and
              manual review workflows. It turns unstructured communication into
              structured decisions without enabling autonomous external action.
            </p>
          </article>

          <article className="section-card p-6">
            <p className="kicker">The Problem</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Fragmented communication creates operational risk.
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>Web3 scams, phishing and social engineering move quickly.</li>
              <li>Manual moderation is slow, inconsistent and hard to audit.</li>
              <li>Business communication overload hides urgent signals.</li>
              <li>Teams lack centralized communication intelligence.</li>
            </ul>
          </article>
        </section>

        <section className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">Architecture</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Unified communication pipeline
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
            Each supported source is validated, normalized and analyzed through
            a shared engine. Deterministic checks provide stable security
            signals, while AI reasoning adds classification, summarization,
            confidence and response guidance.
          </p>
          <div className="mt-7 grid gap-3 text-sm font-semibold text-slate-700 md:grid-cols-4">
            {[
              "Ingest",
              "Validate",
              "Normalize",
              "Identify Context",
              "Deterministic Rules",
              "AI Analysis",
              "Structured Output",
              "Human Review",
            ].map((stage) => (
              <div
                key={stage}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center"
              >
                {stage}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="section-card p-6">
            <p className="kicker">Current Platform</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Implemented in Version 1.0
            </h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {currentCapabilities.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="section-card p-6">
            <p className="kicker">AI Reasoning</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Deterministic rules plus LLM reasoning plus human approval.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Deterministic rules detect stable security patterns such as seed
              phrase requests, private-key requests, fake administrators,
              suspicious links, remote access, OTP/password requests, prompt
              injection and spam.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              OpenRouter-backed reasoning adds intent, sentiment, priority,
              summaries, confidence and recommended actions. Human approval
              remains the safety boundary for suggested replies or external
              actions.
            </p>
          </article>
        </section>

        <section className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">MCP Service</p>
          <h2 className="mt-3 text-3xl font-semibold">
            External AI systems can call one safe analysis tool.
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <EndpointCard label="MCP endpoint" value="https://agenticopsai.xyz/api/mcp" />
            <EndpointCard
              label="Analysis endpoint"
              value="https://agenticopsai.xyz/api/okx/analyze"
            />
            <EndpointCard
              label="Health endpoint"
              value="https://agenticopsai.xyz/api/v1/health"
            />
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">
              Tool: <code>analyze_communication_risk</code>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The MCP surface is analyze-only. It does not expose Gmail sync,
              OAuth operations, provider secrets, private integration events or
              approval mutation.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <article className="section-card p-6">
            <p className="kicker">Security</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>Bounded public inputs and structured validation.</li>
              <li>No committed secrets or token exposure to the browser.</li>
              <li>Readonly Gmail integration.</li>
              <li>Human approval for recommendations and future actions.</li>
            </ul>
          </article>
          <article className="section-card p-6">
            <p className="kicker">Technical Stack</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="section-card p-6">
            <p className="kicker">Current Deployment</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Production runs at <code>agenticopsai.xyz</code>. Validation
              included build, lint, typecheck, unit tests, endpoint validation
              and production smoke verification.
            </p>
          </article>
        </section>

        <section className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">Use Cases</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              "Web3 Communities",
              "Business Operations",
              "Customer Support",
              "Fraud Detection",
              "Operational Risk",
              "Communication Intelligence",
            ].map((item) => (
              <div key={item} className="interactive-card p-4">
                <h3 className="font-semibold">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explainable analysis, risk signals, priority and recommended
                  next steps for human review.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">OKX Integration</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Submitted as an A2MCP-compatible Communication Intelligence service.
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
            AgenticOps AI exposes the callable tool
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">
              analyze_communication_risk
            </code>
            through the production MCP endpoint. The service has been submitted
            to OKX for review. This page does not claim approval or public
            listing until review is complete.
          </p>
        </section>

        <section className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">Future Roadmap</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Planned features remain separate from Version 1.0.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roadmapGroups.map((group) => (
              <article key={group.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <span className="badge border-slate-200 bg-white text-slate-700">
                  Planned
                </span>
                <h3 className="mt-3 text-lg font-semibold">{group.title}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">Conclusion</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Version 1.0 is the first production release.
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
            AgenticOps AI is designed to become a broader AI operations layer
            for communication, business intelligence, audit, compliance,
            marketing and workflow automation. The current release boundary
            remains clear: analyze communications, explain risk, recommend
            actions and keep humans in control.
          </p>
        </section>

        <section className="section-card mt-6 p-6 md:p-8">
          <p className="kicker">Appendix</p>
          <h2 className="mt-3 text-3xl font-semibold">
            API examples, MCP examples, glossary and architecture references.
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <CodeBlock
              value={`POST https://agenticopsai.xyz/api/okx/analyze
{
  "content": "Urgent wallet verification. Send your seed phrase now.",
  "context": "web3-community",
  "source": "telegram"
}`}
            />
            <CodeBlock
              value={`POST https://agenticopsai.xyz/api/mcp
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "analyze_communication_risk"
  }
}`}
            />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold">Glossary</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                <li>A2MCP: service mode for exposing callable tools.</li>
                <li>Deterministic rule: reproducible security signal.</li>
                <li>Human approval: review boundary before external action.</li>
                <li>Normalized message: provider-neutral communication model.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold">Architecture References</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                <li><code>docs/architecture.md</code></li>
                <li><code>docs/okx-submission.md</code></li>
                <li><code>lib/messages/</code></li>
                <li><code>lib/integrations/</code></li>
                <li><code>lib/security/</code></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={pdfPath} download className="btn btn-primary">
              Download White Paper
            </a>
            <Link href="/docs/architecture" className="btn btn-secondary">
              Architecture Docs
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function EndpointCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words font-mono text-xs leading-5 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function CodeBlock({ value }: { value: string }) {
  return (
    <pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
      {value}
    </pre>
  );
}
