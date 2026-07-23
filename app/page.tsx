import Link from "next/link";

const currentMvp = [
  "Web3 Community Security",
  "Business Communication Intelligence",
  "Paste text, TXT, PDF, DOCX, CSV and XLSX analysis",
  "Gmail readonly sync and analysis",
  "Telegram message ingestion",
  "Facebook Messenger ingestion",
  "Discord Gateway ingestion",
  "Durable integration event log",
  "Human-approval-required suggestions",
  "AI-powered message analysis",
  "Scam and phishing detection",
  "Explainable deterministic decisions",
  "Batch analysis",
  "Security and communication reports",
  "Normalized message pipeline",
] as const;

const availableToday = [
  "Web3 Community Security",
  "Business Communication Intelligence",
  "Gmail readonly analysis",
  "Telegram ingestion",
  "Facebook Messenger ingestion",
  "Discord Gateway ingestion",
  "PDF, DOCX, CSV and XLSX business-file analysis",
] as const;

const roadmapToday = [
  "AI Email Workspace actions",
  "AI Marketing Intelligence",
  "AI Business Intelligence",
  "AI Audit & Compliance expansion",
  "AI Business Operator",
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
    status: "In Progress",
    items: [
      "Implemented: Gmail readonly sync",
      "Implemented: Email analysis",
      "Implemented: Reply suggestions",
      "Future: Draft complete replies",
      "Future: Human-approved sending",
      "Future: gmail.send",
      "Future: gmail.modify",
      "Future: Archive and labels",
      "Future: Follow-up",
      "Future: Inbox prioritization",
    ],
  },
  {
    phase: "Phase 3",
    title: "AI Marketing Intelligence",
    status: "Foundation Ready",
    items: [
      "Implemented foundation: Facebook Messenger",
      "Foundation ready: Instagram",
      "Future: LinkedIn",
      "Future: X",
      "Future: TikTok",
      "Future: YouTube",
      "Future: Campaign analysis",
      "Future: Ad performance",
      "Future: Creative suggestions",
      "Future: Audience recommendations",
      "Future: Campaign reports",
      "Future: Human-approved ads",
    ],
  },
  {
    phase: "Phase 4",
    title: "AI Business Intelligence",
    status: "Implemented",
    items: [
      "Implemented: Business workspace",
      "Implemented: Audit findings",
      "Implemented: Budget review",
      "Implemented: Executive reports",
      "Future: BigQuery",
      "Future: KPI feeds",
      "Future: Forecasting",
      "Future: Customer segmentation",
    ],
  },
  {
    phase: "Phase 5",
    title: "AI Audit & Compliance",
    status: "In Progress",
    items: [
      "Implemented: Preliminary business audit",
      "Implemented: Year-end report template",
      "Implemented: Department report template",
      "Future: Compliance audit",
      "Future: Security audit expansion",
      "Future: Scheduled audits",
      "Future: Evidence workflows",
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
  {
    channel: "Gmail readonly",
    status: "Implemented",
    detail:
      "Readonly Gmail messages can be synced, normalized and analyzed. Sending and mailbox modification remain unavailable.",
  },
  {
    channel: "Discord",
    status: "Live",
    detail:
      "A persistent Railway Gateway worker receives supported Discord messages and forwards them to the shared analysis pipeline.",
  },
  {
    channel: "Telegram",
    status: "Live",
    detail:
      "Telegram text messages are received through a verified webhook and analyzed through the shared pipeline.",
  },
  {
    channel: "Facebook Messenger",
    status: "Implemented",
    detail:
      "Supported Page Messenger events are normalized and analyzed in approval-required mode.",
  },
  {
    channel: "Instagram",
    status: "Foundation Ready",
    detail:
      "Webhook verification and supported payload normalization exist. Broader production event coverage remains limited.",
  },
  {
    channel: "Manual and files",
    status: "Implemented",
    detail:
      "Pasted text plus TXT, PDF, DOCX, CSV and XLSX uploads feed the Business Communication Intelligence workflow.",
  },
  {
    channel: "Website Live Chat",
    status: "Planned",
    detail:
      "Planned live-chat adapters will identify FAQs, purchase intent, lead qualification and urgent support needs.",
  },
  {
    channel: "Outlook, Slack and Teams",
    status: "Planned",
    detail:
      "Planned workplace adapters will require provider credentials, permissions and production review before activation.",
  },
  {
    channel: "X, YouTube, LinkedIn, TikTok and Reddit",
    status: "Planned",
    detail:
      "Planned social intelligence will remain human-reviewed and will not launch ads or moderation actions autonomously.",
  },
] as const;

const inputSourceGroups = [
  {
    title: "Implemented File Inputs",
    status: "Implemented",
    items: ["Paste Text", "TXT", "PDF", "DOCX", "CSV", "XLSX"],
  },
  {
    title: "Implemented Communication Sources",
    status: "Implemented",
    items: ["Gmail", "Telegram", "Facebook Messenger", "Discord"],
  },
  {
    title: "Foundation Ready",
    status: "Foundation Ready",
    items: ["Instagram"],
  },
  {
    title: "Planned",
    status: "Planned",
    items: [
      "Website Live Chat",
      "Outlook",
      "WhatsApp Business",
      "Slack",
      "Microsoft Teams",
      "X",
      "YouTube",
      "LinkedIn",
      "TikTok",
      "Reddit",
    ],
  },
] as const;

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
      "The business dashboard analyzes pasted text, supported files and common business communication purposes with explainable AI-assisted review.",
    status: "Implemented",
  },
  {
    context: "Customer Support",
    detail:
      "Available in the Business MVP as a selectable analysis purpose for support intent, urgency and next actions.",
    status: "Available in Business MVP",
  },
  {
    context: "Sales Conversations",
    detail:
      "Available in the Business MVP for buying signals, objections, product questions and follow-up opportunities.",
    status: "Implemented analysis purpose",
  },
  {
    context: "Business Email",
    detail:
      "Available in the Business MVP for formal messages, action items, priority and risk review.",
    status: "Implemented analysis purpose",
  },
  {
    context: "Internal Teams",
    detail:
      "Available in the Business MVP for internal updates, blockers, requested actions and team follow-up.",
    status: "Implemented analysis purpose",
  },
  {
    context: "General Communication",
    detail:
      "Available in the Business MVP for broad intent, sentiment, risk, urgency and recommended actions.",
    status: "Implemented analysis purpose",
  },
  {
    context: "Business Audit",
    detail:
      "Available as an AI-assisted preliminary review for findings, risks, missing information and human-review questions.",
    status: "Implemented analysis purpose",
  },
  {
    context: "Budget Review",
    detail:
      "Available as preliminary decision support for revenue, expense, variance and follow-up observations.",
    status: "Implemented analysis purpose",
  },
  {
    context: "HR",
    detail:
      "Planned HR analysis will identify employee questions, policy issues, escalations and sensitive requests.",
    status: "Planned",
  },
  {
    context: "Marketing Communication",
    detail:
      "Planned social analysis will adapt to campaigns, comments, DMs, engagement and brand risk.",
    status: "Planned",
  },
  {
    context: "Executive Operations",
    detail:
      "Planned executive workflows will summarize cross-channel decisions, risks, owners and follow-up.",
    status: "Planned",
  },
  {
    context: "Compliance",
    detail:
      "Planned compliance workflows will support communication review, evidence trails and reporting.",
    status: "Planned",
  },
  {
    context: "Advanced Social Intelligence",
    detail:
      "Planned monitoring will support broader social listening, sentiment, complaints, leads and brand-risk detection.",
    status: "Planned",
  },
];

const pipelineStages = [
  {
    label: "Incoming Message",
    status: "Manual, uploaded-file and connected-source input exist today.",
    state: "Implemented",
  },
  {
    label: "Normalize",
    status: "Shared normalized message and data models exist for supported inputs.",
    state: "Implemented",
  },
  {
    label: "Identify Communication Context",
    status: "Implemented for Web3 Community Security and Business Communication Intelligence.",
    state: "Implemented",
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
    status: "Suggestions and external actions remain approval-required.",
    state: "Implemented",
  },
  {
    label: "Reports",
    status: "Implemented for Web3 reports; broader reporting is planned.",
    state: "Partial MVP",
  },
  {
    label: "Audit Trail",
    status: "Durable integration events and workflow records exist; multi-tenant audit views are future.",
    state: "Implemented",
  },
] as const;

const statusStyles = {
  Live: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Implemented: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Available in Business MVP": "border-teal-200 bg-teal-50 text-teal-800",
  "Implemented analysis purpose": "border-teal-200 bg-teal-50 text-teal-800",
  "Foundation Ready": "border-sky-200 bg-sky-50 text-sky-800",
  "Current MVP": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "In Progress": "border-sky-200 bg-sky-50 text-sky-800",
  "Partial MVP": "border-teal-200 bg-teal-50 text-teal-800",
  Planned: "border-amber-200 bg-amber-50 text-amber-800",
  Future: "border-slate-200 bg-slate-50 text-slate-700",
} as const;

function getStatusStyle(status: string) {
  return statusStyles[status as keyof typeof statusStyles] ?? statusStyles.Planned;
}

const architectureNodes = [
  {
    title: "Inputs and Channels",
    text: "Implemented: Paste Text, TXT, PDF, DOCX, CSV, XLSX, Gmail, Telegram, Facebook Messenger and Discord. Foundation ready: Instagram. Remaining channels are planned.",
  },
  {
    title: "Normalized Message Model",
    text: "Implemented typed models keep providers, uploads and manual messages consistent before analysis.",
  },
  {
    title: "Communication Intelligence Engine",
    text: "Implemented deterministic rules and AI-assisted classification produce risk, intent, sentiment, suggestions and explainability.",
  },
  {
    title: "Outputs",
    text: "Implemented outputs include analysis, event log, suggestions, reports and human approval records. Autonomous execution remains planned.",
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
                title="Available Today"
                items={availableToday}
                marker="Live"
                tone="implemented"
              />
              <StatusList
                title="Roadmap"
                items={roadmapToday}
                marker="Roadmap"
                tone="planned"
              />
            </div>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-row sm:items-center">
              <Link href="/demo" className="btn btn-primary min-h-12 px-6">
                Guided Demo
              </Link>
              <Link href="/business" className="btn btn-secondary min-h-12 px-6">
                Business Intelligence
              </Link>
              <Link
                href="/security-engine"
                className="btn btn-secondary min-h-12 px-6"
              >
                Communication Engine
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
              Communication Intelligence through the same normalized pipeline.
              Business analysis now accepts pasted text plus TXT, PDF, DOCX,
              CSV and XLSX files. Roadmap items below are clearly labeled and
              are not claimed as live.
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
            <p className="kicker">Inputs and Communication Sources</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Implemented inputs and planned source expansion.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Manual input, supported business files and selected live
              communication sources already feed the engine. Planned sources
              require additional provider credentials, permissions and testing
              before activation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {inputSourceGroups.map((group) => (
              <article key={group.title} className="interactive-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {group.title}
                  </h3>
                  <span className={`badge ${getStatusStyle(group.status)}`}>
                    {group.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
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
                    className={`badge ${getStatusStyle(item.status)}`}
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
                      : stage.state === "Partial MVP"
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
                          : stage.state === "Partial MVP"
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
                  <span className={`badge ${getStatusStyle(phase.status)}`}>
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
            Communication contexts describe the work being performed. Source
            channels describe where the content came from. Supported sources
            use provider-aware normalization while preserving the same core
            analysis and human-review safety model.
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
                  className={`badge ${getStatusStyle(channel.status)}`}
                >
                  {channel.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {channel.detail}
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
              "Implemented: Event Log",
              "Implemented: Human Approval Records",
              "Future: Developer APIs",
              "Future: Automation",
              "Future: SDKs",
              "Planned: Email Sending",
              "Planned: Moderation Actions",
              "Planned: CRM Actions",
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
                Try the implemented platform
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold">
                Explore the AgenticOps AI Platform
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50">
                Try the working communication engine, Web3 security case study,
                business communication analysis, file intelligence, connected
                integrations and human-approval workflow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-end">
              <Link
                href="/demo"
                className="btn min-h-12 bg-white px-6 text-teal-800 hover:bg-teal-50"
              >
                Guided Demo
              </Link>
              <Link
                href="/business"
                className="btn min-h-12 border border-white/40 px-6 text-white hover:bg-white/10"
              >
                Business Intelligence
              </Link>
              <Link
                href="/security-engine"
                className="btn min-h-12 border border-white/40 px-6 text-white hover:bg-white/10"
              >
                Communication Engine
              </Link>
              <Link
                href="/integrations"
                className="btn min-h-12 border border-white/40 px-6 text-white hover:bg-white/10"
              >
                Integrations
              </Link>
              <Link
                href="/docs/asp"
                className="btn min-h-12 border border-white/40 px-6 text-white hover:bg-white/10"
              >
                ASP Docs
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
    <div className="capability-panel rounded-xl p-4" data-tone={tone}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span
              className="status-marker rounded-full px-2 py-0.5 text-[0.68rem] font-black uppercase"
              data-tone={tone}
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
