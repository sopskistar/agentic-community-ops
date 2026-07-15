import Link from "next/link";

const workflowSteps = [
  {
    title: "Ingest",
    text: "Review Discord, Telegram, X, email and manual support messages in one moderation flow.",
  },
  {
    title: "Rule check",
    text: "Run deterministic Web3 security rules before any AI classification is considered.",
  },
  {
    title: "AI assist",
    text: "Classify intent and draft a safe reply from approved project knowledge only.",
  },
  {
    title: "Escalate",
    text: "Route financial, dangerous and uncertain cases to humans with proof attached.",
  },
];

const featureCards = [
  {
    icon: ShieldIcon,
    title: "Deterministic first",
    text: "Published rule IDs set the minimum risk level, so AI can add context but never downgrade security.",
  },
  {
    icon: MessageIcon,
    title: "Safe support replies",
    text: "Suggested responses are grounded in project documentation and framed for human review.",
  },
  {
    icon: ReportIcon,
    title: "Community reports",
    text: "Batch analysis rolls message risk, triggered rules and escalations into judge-ready reports.",
  },
];

const ruleExamples = [
  "Seed phrase or private-key request",
  "Fake admin or support impersonation",
  "Urgent wallet verification threat",
  "Unknown claim or wallet-connection link",
  "Missing funds or unauthorized transaction",
  "Prompt injection against safety rules",
];

export default function Home() {
  return (
    <main className="app-bg text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-teal-100/70 via-sky-50/70 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8 lg:py-18">
          <div className="flex flex-col justify-center">
            <p className="badge hero-badge">
              Web3 community security and support ASP
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] text-slate-950 sm:text-5xl lg:text-7xl">
              Agentic Community Ops
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-teal-800">
              Detect threats. Protect communities. Respond safely.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Give moderators a safer way to review Web3 community messages.
              Deterministic rules catch wallet threats first, then AI helps
              classify intent, explain risk and draft safer replies.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-row">
              <Link
                href="/demo"
                className="btn btn-primary min-h-12 px-6"
              >
                Launch Demo
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-secondary min-h-12 px-6"
              >
                Open Dashboard
              </Link>
            </div>
            <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              <HeroStat label="Rules" value="15" />
              <HeroStat label="Batch limit" value="25" />
              <HeroStat label="Setup" value="0" />
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-300/80">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Live message review
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Security Console
                </h2>
              </div>
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-100">
                High risk
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-slate-300">
                  Incoming message
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
                  Suggested safe reply
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-50">
                  Please do not use direct messages for wallet support. A
                  moderator should verify this account and remove unsafe links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((item) => (
            <article
              key={item.title}
              className="interactive-card group p-6"
            >
              <div className="grid size-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <item.icon />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.75fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Problem
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Community teams are the first line of defense.
            </h2>
          </div>
          <p className="text-base leading-8 text-slate-600">
            Scammers move faster than support queues. They impersonate admins,
            abuse launch urgency, send malicious links and pressure users into
            irreversible wallet actions. Moderators need fast answers, but every
            risky decision also needs to be explainable and auditable.
          </p>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            How It Works
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">
            A security review pipeline built for support speed and control.
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

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Deterministic Security
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Rules set the minimum risk. AI can never lower it.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            The deterministic engine evaluates public Web3 security rules first.
            AI can add labels, explanations and draft replies, but final risk is
            always at least the deterministic verdict.
          </p>
          <Link
            href="/security-engine"
            className="btn btn-secondary mt-7"
          >
            View Security Engine
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ruleExamples.map((rule) => (
            <div
              key={rule}
              className="interactive-card p-4 text-sm font-semibold text-slate-700"
            >
              {rule}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-slate-950 px-6 py-9 text-white shadow-xl shadow-emerald-900/15 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  Call to Action
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold">
                  Give moderators a safer way to review Web3 community messages.
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

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.6-4" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 3h9l3 3v15H6V3Z" />
      <path d="M14 3v4h4M9 13h6M9 17h4" />
    </svg>
  );
}
