import Link from "next/link";

const currentMvp = [
  "Web3 Community Security",
  "AI-powered message analysis",
  "Scam and phishing detection",
  "Explainable deterministic decisions",
  "AI-generated moderator reply suggestions",
  "Batch analysis",
  "Community security reports",
  "A2A service capability",
];

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Universal Web3 Community Security",
    status: "Current MVP plus near-term hardening",
    items: [
      "Strengthen the existing security engine",
      "Expand the A2A API beyond the OKX ecosystem",
      "Improve documentation and reusable integrations",
      "Discord and Telegram channel architecture",
    ],
  },
  {
    phase: "Phase 2",
    title: "Business Intelligence Dashboard",
    status: "Roadmap",
    items: [
      "Copy and paste messages or conversations",
      "CSV, Excel, PDF, Word and plain-text uploads",
      "Conversation summaries",
      "Customer intent analysis",
      "Complaints, leads, FAQs and priority detection",
      "Recommended actions",
    ],
  },
  {
    phase: "Phase 3",
    title: "Channel Intelligence and Communication Integrations",
    status: "Roadmap",
    items: [
      "Facebook Pages",
      "Instagram Business",
      "Email",
      "Website Live Chat",
      "Same normalized message pipeline for every channel",
      "Channel-aware analysis by source and business context",
    ],
  },
  {
    phase: "Phase 4",
    title: "AI Customer Operations",
    status: "Roadmap",
    items: [
      "AI reply suggestions",
      "Human approval",
      "Configurable auto-reply rules",
      "Escalation rules",
      "Confidence and risk controls",
      "Audit history",
      "Safe default: no external auto-send without explicit authorization",
    ],
  },
  {
    phase: "Phase 5",
    title: "Omnichannel Expansion",
    status: "Roadmap",
    items: [
      "Discord",
      "Telegram",
      "X",
      "TikTok",
      "WhatsApp Business",
      "Slack",
      "Additional channels based on demand",
    ],
  },
  {
    phase: "Phase 6",
    title: "Workflow Automation and Developer Platform",
    status: "Roadmap",
    items: [
      "REST API",
      "A2A",
      "MCP",
      "SDKs",
      "Webhooks",
      "Configurable if/then workflows",
      "External application integration",
    ],
  },
];

const channelAwareness = [
  {
    channel: "Facebook Pages",
    focus: "Customer enquiries, products, services, leads and support.",
  },
  {
    channel: "Instagram Business",
    focus:
      "Social selling, campaign enquiries, collaborations and brand engagement.",
  },
  {
    channel: "Email",
    focus: "Formal support, partnerships, invoices, long threads and action items.",
  },
  {
    channel: "Website Live Chat",
    focus: "Purchase intent, FAQs, lead qualification and immediate support.",
  },
  {
    channel: "Discord",
    focus: "Communities, developers, gaming and Web3 moderation.",
  },
  {
    channel: "Telegram",
    focus: "Crypto communities, scam risk, impersonation and support.",
  },
];

const plannedBusinessInputs = [
  "Email",
  "PDF",
  "Word",
  "CSV",
  "Excel",
  "Customer Support Tickets",
  "Website Live Chat",
  "Facebook Messages",
  "Instagram Messages",
  "Discord",
  "Telegram",
];

const communicationContexts = [
  {
    context: "Web3 Communities",
    detail:
      "The current MVP applies deterministic security rules and AI-assisted review to community safety workflows.",
    status: "Implemented MVP context",
  },
  {
    context: "Customer Support",
    detail:
      "Planned analysis will identify support intent, urgency, complaint patterns and recommended next actions.",
    status: "Roadmap",
  },
  {
    context: "Sales Conversations",
    detail:
      "Planned scoring will separate product questions, buying signals, objections and follow-up opportunities.",
    status: "Roadmap",
  },
  {
    context: "Lead Qualification",
    detail:
      "Planned workflows will flag high-intent prospects and route them with relevant context.",
    status: "Roadmap",
  },
  {
    context: "Business Email",
    detail:
      "Planned email intelligence will handle formal threads, attachments, action items and summaries.",
    status: "Roadmap",
  },
  {
    context: "Social Media",
    detail:
      "Planned social analysis will adapt to campaigns, comments, DMs, engagement and brand risk.",
    status: "Roadmap",
  },
  {
    context: "Internal Team Communication",
    detail:
      "Planned team workflows will summarize decisions, requests, blockers and follow-up ownership.",
    status: "Future",
  },
];

const pipelineStages = [
  { label: "Incoming Message", status: "Current input" },
  { label: "Normalize", status: "Foundation implemented" },
  { label: "Identify Context", status: "Roadmap" },
  { label: "Deterministic Rules", status: "Implemented for Web3 security" },
  { label: "AI Analysis", status: "Implemented for message review" },
  { label: "Risk & Intent Classification", status: "Partial MVP" },
  { label: "Suggested Action", status: "Partial MVP" },
  { label: "Human Review / Automation", status: "Roadmap" },
];

const architectureNodes = [
  {
    title: "Future Channels",
    text: "Email, documents, live chat, social messages, communities and APIs.",
  },
  {
    title: "Normalized Message Model",
    text: "A shared typed foundation now exists for future adapters.",
  },
  {
    title: "Intelligence Engine",
    text: "Deterministic rules and AI analysis classify risk, intent and actions.",
  },
  {
    title: "Outputs",
    text: "Reports, automation, APIs and developer platform workflows.",
  },
];

const enterpriseFeatures = [
  "Organizations",
  "Workspaces",
  "Teams",
  "User accounts",
  "Role-based access control",
  "Permissions",
  "Secure tenant data isolation",
  "Durable multi-tenant persistence",
  "Audit logs",
  "API keys per organization",
  "Billing and subscription management",
  "Enterprise administration",
];

const workflowSteps = [
  {
    title: "Normalize",
    text: "Incoming payloads move toward one shared message model before analysis.",
  },
  {
    title: "Detect",
    text: "The current MVP runs deterministic Web3 security rules as the first supported context.",
  },
  {
    title: "Explain",
    text: "Results show triggered rules, evidence, final risk and suggested moderator actions.",
  },
  {
    title: "Operate",
    text: "Roadmap workflows add approvals, automations, audit history and developer integrations.",
  },
];

export default function Home() {
  return (
    <main className="app-bg text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-teal-100/70 via-sky-50/70 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="badge hero-badge">
              AI Communication Intelligence Platform
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] text-slate-950 sm:text-5xl lg:text-7xl">
              Agentic Ops
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-teal-800">
              One AI communication engine for modern customer conversations.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Analyze conversations across channels using one intelligent
              pipeline. The current MVP supports Web3 Community Security as the
              first communication context; the roadmap expands into business
              intelligence, document intelligence, channel-aware analysis and AI
              customer operations.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-row">
              <Link href="/demo" className="btn btn-primary min-h-12 px-6">
                Launch Web3 Security Demo
              </Link>
              <Link
                href="/security-engine"
                className="btn btn-secondary min-h-12 px-6"
              >
                View Engine
              </Link>
            </div>
            <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              <HeroStat label="Rules" value="15" />
              <HeroStat label="Batch limit" value="25" />
              <HeroStat label="Current setup" value="MVP" />
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-300/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Communication engine
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  One pipeline, many channels
                </h2>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                Current MVP
              </span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-slate-300">
                  Current MVP
                </p>
                <p className="mt-2 text-base leading-6">
                  &quot;I am the official admin. DM me and connect your wallet
                  now.&quot;
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ConsoleMetric label="Rules" value="SEC-004" tone="emerald" />
                <ConsoleMetric label="AI label" value="Scam" tone="amber" />
                <ConsoleMetric label="Action" value="Escalate" tone="red" />
              </div>
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold text-emerald-100">
                  Roadmap direction
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-50">
                  Future channels will use the same normalized message
                  foundation while applying channel-aware analysis for each
                  business context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="kicker">Current MVP</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Web3 Community Security is live now.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              The implemented product focuses on explainable message review for
              Web3 communities. It is the first supported context for a broader
              communication intelligence platform. Roadmap items below are
              clearly labeled and are not claimed as live.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {currentMvp.map((item) => (
              <div
                key={item}
                className="interactive-card p-4 text-sm font-semibold text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Operating Model
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">
            One message pipeline, multiple communication contexts.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-xl border border-white/10 bg-white/[0.06] p-5 transition-colors hover:border-emerald-300/30 hover:bg-white/10"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-emerald-400/10 text-sm font-bold text-emerald-200">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="kicker">Business Communication Intelligence</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Future inputs for the same intelligent pipeline.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              These inputs are planned and not yet implemented. The next
              product phases will add ingestion and analysis one narrow,
              testable capability at a time.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plannedBusinessInputs.map((input) => (
              <div key={input} className="interactive-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {input}
                  </p>
                  <span className="rounded-full border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase text-amber-800">
                    Planned
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Not yet implemented
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kicker">Communication Contexts</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              One model that adapts to the work behind each message.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              The same normalized message foundation can support different
              communication contexts while keeping analysis, reporting and
              review workflows consistent.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {communicationContexts.map((item) => (
              <article key={item.context} className="interactive-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {item.context}
                  </h3>
                  <span className="badge border-slate-200 bg-slate-50 text-slate-700">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Message Pipeline
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">
            Platform-wide flow from incoming message to action.
          </h2>
          <div className="mt-10 grid gap-3 lg:grid-cols-4">
            {pipelineStages.map((stage, index) => (
              <div key={stage.label} className="relative">
                <div className="h-full rounded-xl border border-white/10 bg-white/[0.06] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">{stage.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {stage.status}
                  </p>
                </div>
                {index < pipelineStages.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="mx-auto h-3 w-px bg-emerald-300/50 lg:absolute lg:right-[-0.45rem] lg:top-1/2 lg:h-px lg:w-3"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kicker">Product Roadmap</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              From Web3 security to communication intelligence.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Future phases extend the current MVP without replacing it. They
              add business intelligence, integrations, approvals, omnichannel
              operations and developer workflows after the foundation is ready.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {roadmapPhases.map((phase) => (
              <article key={phase.phase} className="interactive-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="kicker">{phase.phase}</p>
                  <span className="badge border-slate-200 bg-slate-50 text-slate-700">
                    {phase.status}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950">
                  {phase.title}
                </h3>
                <ul className="mt-5 grid gap-2 text-sm leading-6 text-slate-700">
                  {phase.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="kicker">Channel-Aware Analysis</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Same normalized pipeline, source-specific priorities.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Future channel adapters will normalize messages into the same data
            model. Analysis can then account for how each channel is used
            without fragmenting the core workflow.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channelAwareness.map((channel) => (
            <article key={channel.channel} className="interactive-card p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                {channel.channel}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {channel.focus}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kicker">Platform Architecture</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Future expansion without fragmenting the engine.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              This is an architecture illustration only. It shows how planned
              channels can feed the implemented normalized model and later power
              reports, automation, APIs and developer tools.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {architectureNodes.map((node, index) => (
              <article key={node.title} className="interactive-card p-5">
                <p className="kicker">Layer {index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  {node.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {node.text}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {["Reports", "Automation", "API", "Developer Platform"].map(
              (output) => (
                <div
                  key={output}
                  className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                >
                  {output}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kicker">Future Enterprise Features</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Enterprise administration is a roadmap item, not current MVP
              functionality.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              These features require future authentication, authorization,
              durable storage, tenant boundaries and billing decisions before
              implementation.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {enterpriseFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-slate-950 px-6 py-9 text-white shadow-xl shadow-emerald-900/15 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Try the implemented MVP
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold">
                Try the current Web3 Community Security MVP with deterministic
                proof and AI-assisted reply suggestions.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="btn min-h-12 bg-white px-6 text-teal-800 hover:bg-teal-50"
              >
                Launch Demo
              </Link>
              <Link
                href="/dashboard"
                className="btn min-h-12 border border-white/40 px-6 text-white hover:bg-white/10"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card p-4">
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function ConsoleMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "red";
}) {
  const toneClasses = {
    emerald: "bg-emerald-400/10 text-emerald-100",
    amber: "bg-amber-400/10 text-amber-100",
    red: "bg-red-400/10 text-red-100",
  };

  return (
    <div className={`rounded-lg p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-medium opacity-85">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
