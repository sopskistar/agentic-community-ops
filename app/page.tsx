import Link from "next/link";

const currentMvp = [
  "Web3 Community Security",
  "Business Communication Intelligence",
  "AI-powered message analysis",
  "Scam and phishing detection",
  "Explainable deterministic decisions",
  "AI-generated reply suggestions",
  "Batch analysis",
  "Security and communication reports",
  "Normalized message pipeline",
] as const;

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Communication Intelligence",
    status: "Implemented",
    items: [
      "Implemented: Web3 Community Security",
      "Implemented: Business Communication Intelligence",
      "Future: Customer Support",
      "Future: Sales",
      "Future: Internal Teams",
      "Future: HR",
    ],
  },
  {
    phase: "Phase 2",
    title: "AI Email Workspace",
    status: "Planned",
    items: [
      "Read Email",
      "Categorize",
      "Detect Phishing",
      "Draft Replies",
      "Reply Suggestions",
      "Send Email",
      "Archive",
      "Labels",
      "Follow-up",
      "Inbox Prioritization",
    ],
  },
  {
    phase: "Phase 3",
    title: "AI Marketing Intelligence",
    status: "Planned",
    items: [
      "Facebook",
      "Instagram",
      "LinkedIn",
      "X",
      "TikTok",
      "YouTube",
      "Campaign Analysis",
      "Ad Performance",
      "Creative Suggestions",
      "Audience Recommendations",
      "Campaign Reports",
      "Human-approved Ads",
    ],
  },
  {
    phase: "Phase 4",
    title: "AI Business Intelligence",
    status: "Planned",
    items: [
      "BigQuery",
      "KPIs",
      "Revenue",
      "Expenses",
      "Forecasting",
      "Customer Segmentation",
      "Business Dashboards",
      "Executive Reports",
    ],
  },
  {
    phase: "Phase 5",
    title: "AI Audit & Compliance",
    status: "Planned",
    items: [
      "Communication Audit",
      "Business Audit",
      "Compliance Audit",
      "Security Audit",
      "End-of-Year Reports",
      "Department Reports",
      "Executive Summaries",
    ],
  },
  {
    phase: "Phase 6",
    title: "AI Business Operator",
    status: "Future",
    items: [
      "Cross-channel workflows",
      "Scheduling",
      "Automation",
      "Approvals",
      "Executive Summaries",
      "Workflow Builder",
      "Human Approval",
    ],
  },
] as const;

const channelAwareness = [
  { channel: "Web3", status: "Supported Today" },
  { channel: "Business Communication", status: "Supported Today" },
  { channel: "Email", status: "Planned" },
  { channel: "Facebook", status: "Planned" },
  { channel: "Instagram", status: "Planned" },
  { channel: "Discord", status: "Planned" },
  { channel: "Telegram", status: "Planned" },
  { channel: "WhatsApp Business", status: "Planned" },
  { channel: "Slack", status: "Planned" },
  { channel: "Microsoft Teams", status: "Planned" },
  { channel: "X", status: "Planned" },
  { channel: "YouTube", status: "Planned" },
  { channel: "LinkedIn", status: "Planned" },
  { channel: "TikTok", status: "Planned" },
  { channel: "Reddit", status: "Planned" },
];

const plannedBusinessInputs = [
  "Paste Text",
  "TXT Upload",
  "PDF",
  "DOCX",
  "CSV",
  "Excel",
  "Website Live Chat",
  "Email",
  "Discord",
  "Telegram",
  "Facebook",
  "Instagram",
  "WhatsApp",
  "Slack",
  "Teams",
  "X",
  "YouTube",
  "LinkedIn",
  "TikTok",
  "Reddit",
];

const communicationContexts = [
  {
    context: "Web3 Communities",
    detail:
      "The current MVP applies deterministic security rules and AI-assisted review to community safety workflows.",
    status: "Implemented",
  },
  {
    context: "Business Communication",
    detail:
      "The business dashboard analyzes pasted or TXT business messages with structured, explainable demonstration logic.",
    status: "Implemented",
  },
  {
    context: "Customer Support",
    detail:
      "Planned analysis will identify support intent, urgency, complaint patterns and recommended next actions.",
    status: "Planned",
  },
  {
    context: "Sales Conversations",
    detail:
      "Planned scoring will separate product questions, buying signals, objections and follow-up opportunities.",
    status: "Planned",
  },
  {
    context: "Business Email",
    detail:
      "Planned email intelligence will handle formal threads, attachments, action items and summaries.",
    status: "Planned",
  },
  {
    context: "Internal Teams",
    detail:
      "Planned team workflows will summarize decisions, requests, blockers and follow-up ownership.",
    status: "Planned",
  },
  {
    context: "HR",
    detail:
      "Planned HR analysis will identify employee questions, policy issues, escalations and sensitive requests.",
    status: "Planned",
  },
  {
    context: "Social Media",
    detail:
      "Planned social analysis will adapt to campaigns, comments, DMs, engagement and brand risk.",
    status: "Planned",
  },
  {
    context: "Compliance",
    detail:
      "Planned compliance workflows will support communication review, evidence trails and reporting.",
    status: "Planned",
  },
  {
    context: "General Communication",
    detail:
      "Planned general analysis will classify intent, sentiment, risk, urgency and recommended actions.",
    status: "Planned",
  },
];

const pipelineStages = [
  {
    label: "Incoming Message",
    status: "Manual and API input exist today.",
    state: "Implemented",
  },
  {
    label: "Normalize",
    status: "Typed foundation exists; adapters are next.",
    state: "In Progress",
  },
  {
    label: "Identify Communication Context",
    status: "Implemented for Web3 and business communications; broader contexts are planned.",
    state: "Planned",
  },
  {
    label: "Deterministic Rules",
    status: "Implemented for Web3 Community Security.",
    state: "Implemented",
  },
  {
    label: "AI Analysis",
    status: "Implemented for message classification and replies.",
    state: "Implemented",
  },
  {
    label: "Recommendations",
    status: "Implemented as suggested actions and replies for supported contexts.",
    state: "Partial MVP",
  },
  {
    label: "Human Approval",
    status: "Required for external replies and actions; approval queues are roadmap.",
    state: "Planned",
  },
  {
    label: "Reports",
    status: "Implemented for Web3 reports; broader reporting is planned.",
    state: "Partial MVP",
  },
  {
    label: "Audit Trail",
    status: "Integration events exist; durable multi-tenant audit views are future.",
    state: "Planned",
  },
] as const;

const statusStyles = {
  Implemented: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Current MVP": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "In Progress": "border-sky-200 bg-sky-50 text-sky-800",
  "Partial MVP": "border-teal-200 bg-teal-50 text-teal-800",
  Planned: "border-amber-200 bg-amber-50 text-amber-800",
  Future: "border-slate-200 bg-slate-50 text-slate-700",
} as const;

const architectureNodes = [
  {
    title: "Communication Channels",
    text: "Manual input, TXT upload, Web3 and business contexts today; more channels are planned.",
  },
  {
    title: "Normalized Message Model",
    text: "A shared typed model keeps providers, uploads and manual messages consistent.",
  },
  {
    title: "Communication Intelligence Engine",
    text: "Deterministic rules and AI analysis classify risk, intent, context and recommendations.",
  },
  {
    title: "Outputs",
    text: "Risk, intent, classification, recommendations, reports, audit and approval workflows.",
  },
];

const enterpriseFeatures = [
  "Organizations",
  "Workspaces",
  "Teams",
  "Role-based Access",
  "Permissions",
  "Knowledge Bases",
  "Prompt Libraries",
  "Audit Logs",
  "Billing",
  "Workspaces",
  "Multi-tenant Support",
  "Workflow Automation",
  "Approval Center",
  "Human Review Queue",
];

const workflowSteps = [
  {
    title: "Normalize",
    text: "Incoming payloads move toward one shared message model before analysis.",
  },
  {
    title: "Detect",
    text: "The current MVP runs Web3 security rules and business communication analysis as supported contexts.",
  },
  {
    title: "Explain",
    text: "Results show triggered rules, evidence, final risk, intent and suggested next actions.",
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
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-teal-100/70 via-sky-50/70 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.68fr)] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="badge hero-badge">
              AgenticOps AI
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] text-slate-950 sm:text-5xl lg:text-6xl">
              AI Communication Intelligence Platform
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-8 text-teal-800">
              One intelligent communication engine that analyzes conversations
              across multiple communication contexts using explainable AI,
              deterministic rules, structured reasoning and human approval
              workflows.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              The current product supports Web3 Community Security and Business
              Communication Intelligence. Email intelligence, marketing
              intelligence, AI audit and AI business operator capabilities remain
              roadmap items until implemented.
            </p>
            <div className="mt-7 grid max-w-3xl gap-4 md:grid-cols-2">
              <StatusList
                title="Currently Implemented"
                items={["Web3 Community Security", "Business Communication Intelligence"]}
                marker="✓"
                tone="implemented"
              />
              <StatusList
                title="Roadmap"
                items={[
                  "Email Intelligence",
                  "Marketing Intelligence",
                  "Business Intelligence",
                  "AI Audit",
                  "AI Business Operator",
                ]}
                marker="Roadmap"
                tone="planned"
              />
            </div>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-row sm:items-center">
              <Link href="/demo" className="btn btn-primary min-h-12 px-6">
                Try Web3 MVP
              </Link>
              <Link href="/business" className="btn btn-secondary min-h-12 px-6">
                Try Business MVP
              </Link>
              <Link
                href="/security-engine"
                className="btn btn-secondary min-h-12 px-6"
              >
                View Engine
              </Link>
            </div>
            <dl className="mt-9 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              <HeroStat label="Security rules" value="15" />
              <HeroStat label="Live contexts" value="2" />
              <HeroStat label="Mode" value="Human review" />
            </dl>
          </div>

          <div className="self-center rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-300/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Communication Engine
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  One pipeline, many channels
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Current console preview using today&apos;s implemented
                  communication contexts.
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-300/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                Current MVP
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Incoming Message
                  </p>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[0.68rem] font-bold uppercase text-slate-300">
                    Web3 context
                  </span>
                </div>
                <p className="mt-3 text-base leading-6 text-slate-100">
                  &quot;I am the official admin. DM me and connect your wallet
                  now.&quot;
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Analysis Output
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <ConsoleMetric label="Rule" value="SEC-004" tone="emerald" />
                  <ConsoleMetric label="Intent" value="Scam" tone="amber" />
                  <ConsoleMetric label="Action" value="Escalate" tone="red" />
                </div>
              </div>
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold text-emerald-100">
                  Roadmap direction
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-50">
                  Future channels will use the same normalized message
                  foundation while applying channel-aware analysis for each
                  communication context.
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
              Two communication contexts are live now.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              The current engine powers Web3 Community Security and Business
              Communication Intelligence through the same normalized
              communication pipeline. Roadmap items below are clearly labeled
              and are not claimed as live.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {currentMvp.map((item) => (
              <div
                key={item}
                className="interactive-card flex items-start gap-3 p-4 text-sm font-semibold text-slate-700"
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[0.7rem] font-black text-emerald-800">
                  ✓
                </span>
                <span>{item}</span>
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
            <p className="kicker">Future Inputs</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Future inputs for the same communication intelligence pipeline.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Paste Text and TXT Upload are implemented in the Business
              Intelligence Dashboard. Every other input listed here is planned
              and not yet implemented.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plannedBusinessInputs.map((input) => (
              <div key={input} className="interactive-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {input}
                  </p>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase ${
                      input === "Paste Text" || input === "TXT Upload"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-dashed border-amber-300 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {input === "Paste Text" || input === "TXT Upload"
                      ? "Implemented"
                      : "Planned"}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {input === "Paste Text" || input === "TXT Upload"
                    ? "Available in /business"
                    : "Not yet implemented"}
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
                  <span
                    className={`badge ${
                      item.status === "Current MVP"
                        ? statusStyles["Current MVP"]
                        : item.status === "Implemented"
                          ? statusStyles.Implemented
                        : item.status === "Future"
                          ? statusStyles.Future
                          : statusStyles.Planned
                    }`}
                  >
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
                <div
                  className={`h-full rounded-xl border p-5 ${
                    stage.state === "Implemented"
                      ? "border-emerald-300/35 bg-emerald-400/10"
                      : stage.state === "In Progress" ||
                          stage.state === "Partial MVP"
                        ? "border-sky-300/30 bg-sky-400/10"
                        : "border-white/10 bg-white/[0.05]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                      Step {index + 1}
                    </p>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase ${
                        stage.state === "Implemented"
                          ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                          : stage.state === "In Progress" ||
                              stage.state === "Partial MVP"
                            ? "border-sky-300/40 bg-sky-400/15 text-sky-100"
                            : "border-white/15 bg-white/5 text-slate-300"
                      }`}
                    >
                      {stage.state}
                    </span>
                  </div>
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
              Six strategic phases for AgenticOps AI.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Future phases extend the current MVP without replacing it. They
              add email, marketing, business intelligence, audit, compliance and
              operator workflows after each capability is implemented and
              validated.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {roadmapPhases.map((phase) => (
              <article key={phase.phase} className="interactive-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="kicker">{phase.phase}</p>
                  <span className={`badge ${statusStyles[phase.status]}`}>
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
            Supported today: Web3 and Business Communication. Planned channels
            remain disabled until implemented.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channelAwareness.map((channel) => (
            <article key={channel.channel} className="interactive-card p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-950">
                  {channel.channel}
                </h3>
                <span
                  className={`badge ${
                    channel.status === "Supported Today"
                      ? statusStyles.Implemented
                      : statusStyles.Planned
                  }`}
                >
                  {channel.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                All channels normalize into the same internal message model
                before analysis.
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
              risk, intent, classification, recommendations, reports, audit,
              approval queues, developer APIs, automation and SDKs.
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
            {[
              "Risk",
              "Intent",
              "Classification",
              "Recommendations",
              "Reports",
              "Audit",
              "Approval Queue",
              "Future: Developer APIs",
              "Future: Automation",
              "Future: SDKs",
            ].map(
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
                <span>{feature}</span>
                <span className="mt-2 block text-xs font-bold uppercase text-slate-500">
                  Future
                </span>
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
                Explore Web3 Community Security and Business Communication
                Intelligence today. Roadmap capabilities remain disabled until
                implemented.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="btn min-h-12 bg-white px-6 text-teal-800 hover:bg-teal-50"
              >
                Web3 Demo
              </Link>
              <Link
                href="/business"
                className="btn min-h-12 border border-white/40 px-6 text-white hover:bg-white/10"
              >
                Business Dashboard
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

function StatusList({
  title,
  items,
  marker,
  tone,
}: {
  title: string;
  items: readonly string[];
  marker: string;
  tone: "implemented" | "planned";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span
              className={`rounded-full px-2 py-0.5 text-[0.68rem] font-black uppercase ${
                tone === "implemented"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {marker}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
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
