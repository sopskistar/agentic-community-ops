import Image from "next/image";
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
    text: "Future channels convert incoming payloads into one shared message model before analysis.",
  },
  {
    title: "Detect",
    text: "The current MVP runs deterministic Web3 security rules before AI enrichment.",
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
              Web3 security today. Broader communication intelligence next.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              The working MVP helps teams analyse Web3 community messages for
              scams, phishing, impersonation and unsafe support requests. The
              roadmap expands the same normalized message pipeline into
              business intelligence, channel-aware analysis and AI customer
              operations.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-row">
              <Link href="/demo" className="btn btn-primary min-h-12 px-6">
                Launch Web3 Security Demo
              </Link>
              <Link
                href="/security-engine"
                className="btn btn-secondary min-h-12 px-6"
              >
                View Security Engine
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
                  Official brand
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Communication Intelligence Console
                </h2>
              </div>
              <Image
                src="/logo/Agentic-Ops.jpg"
                alt="Agentic Ops logo"
                width={80}
                height={80}
                priority
                className="size-20 rounded-xl border border-white/10 bg-white object-contain"
              />
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
              Web3 moderators and projects. Roadmap items below are clearly
              labeled and are not claimed as live.
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
                Review Web3 community messages with deterministic proof and
                AI-assisted moderator replies.
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
