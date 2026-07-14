import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Security Engine", href: "#security-engine" },
  { label: "Demo", href: "/demo" },
  { label: "Dashboard", href: "/dashboard" },
];

const workflowSteps = [
  {
    title: "Ingest community messages",
    text: "Accept posts, replies, DMs, support tickets, and moderator escalations from active Web3 communities.",
  },
  {
    title: "Apply deterministic rules",
    text: "Flag wallet drainers, seed phrase requests, impersonation, suspicious links, urgency patterns, and financial risk.",
  },
  {
    title: "Classify with AI",
    text: "Add context, intent, and support category labels while preserving the minimum risk set by the security engine.",
  },
  {
    title: "Respond or escalate",
    text: "Generate safe draft replies from project documentation, explain triggered rules, and escalate dangerous cases.",
  },
];

const ruleExamples = [
  "Seed phrase or private key request",
  "Wallet verification or token migration lure",
  "Impersonated admin, support, or founder account",
  "Urgent financial action or guaranteed return claim",
  "Unknown link shortener or lookalike project domain",
  "Uncertain intent with irreversible user impact",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              AO
            </span>
            <span className="text-sm font-semibold tracking-wide text-slate-900">
              Agentic Community Ops
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_0.85fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-5 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            Web3 community security and support ASP
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
            Agentic Community Ops
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-700">
            Detect threats. Protect communities. Respond safely.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
            A security-first agent service provider for Web3 teams that screens
            community messages, explains triggered rules, drafts safe support
            replies, and escalates risk before users lose funds.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Launch Demo
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-white shadow-xl shadow-slate-200/70">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                  Live message triage
                </p>
                <h2 className="mt-2 text-xl font-semibold">Security Console</h2>
              </div>
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-200">
                High risk
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Incoming message</p>
                <p className="mt-2 text-base leading-6">
                  &quot;Connect your wallet now to migrate tokens. Admins will
                  never ask twice.&quot;
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-emerald-400/10 p-4">
                  <p className="text-xs text-emerald-200">Rules</p>
                  <p className="mt-2 text-2xl font-semibold">4</p>
                </div>
                <div className="rounded-lg bg-amber-400/10 p-4">
                  <p className="text-xs text-amber-200">AI label</p>
                  <p className="mt-2 text-lg font-semibold">Scam lure</p>
                </div>
                <div className="rounded-lg bg-red-400/10 p-4">
                  <p className="text-xs text-red-200">Action</p>
                  <p className="mt-2 text-lg font-semibold">Escalate</p>
                </div>
              </div>
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold text-emerald-100">
                  Suggested safe reply
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-50">
                  Do not connect your wallet or share credentials. Official
                  updates are posted only in verified project channels.
                </p>
              </div>
            </div>
        </div>
      </section>

      <section id="problem" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Problem
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Community teams are the first line of defense.
            </h2>
          </div>
          <p className="text-base leading-7 text-slate-600 lg:col-span-2">
            Scammers move faster than support queues. They impersonate admins,
            abuse launch urgency, send malicious links, and pressure users into
            irreversible wallet actions. Moderators need fast answers, but they
            also need every risky decision to be explainable and auditable.
          </p>
        </div>
      </section>

      <section id="solution" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Detect threats",
              text: "Run deterministic security checks before any AI-generated judgment is considered.",
            },
            {
              title: "Respond safely",
              text: "Draft support replies from trusted project documentation without asking users to take unsafe actions.",
            },
            {
              title: "Report clearly",
              text: "Summarize risk trends, triggered rules, escalations, and unresolved community security issues.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            How It Works
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold">
            A review pipeline built for support speed and security control.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-lg border border-white/10 bg-white/5 p-5"
              >
                <span className="text-sm font-semibold text-emerald-300">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="security-engine"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.8fr_1fr] lg:px-8"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Deterministic Security
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            Rules set the minimum risk. AI can never lower it.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            The deterministic engine decides the minimum risk level using
            transparent security rules. AI can add classification, explanations,
            and reply suggestions, but it cannot downgrade deterministic risk.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ruleExamples.map((rule) => (
            <div
              key={rule}
              className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm"
            >
              {rule}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="rounded-lg bg-emerald-700 px-6 py-10 text-white md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  Call to Action
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold">
                  Give moderators a safer way to triage Web3 support.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/demo"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
                >
                  Launch Demo
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
