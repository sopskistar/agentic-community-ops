import Link from "next/link";

import { projectRepository } from "@/lib/projects/local-json-project-repository";

export default async function DashboardPage() {
  const projects = await projectRepository.list();
  const totalOfficialLinks = projects.reduce(
    (count, project) => count + project.officialLinks.length,
    0,
  );
  const responseToneCount = new Set(
    projects.map((project) => project.responseTone),
  ).size;

  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <div className="section-card flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between md:p-7">
          <div>
            <p className="kicker">
              Platform Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Knowledge Hub
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Create a communication profile, define trusted documentation and
              official links, analyze individual or batch messages, and
              generate an auditable report. User-submitted links are never
              treated as official sources.
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="btn btn-primary"
          >
            <PlusIcon />
            New Profile
          </Link>
        </div>

        {projects.length === 0 ? (
          <section className="section-card mt-6 border-dashed border-emerald-300 p-8 text-center md:p-10">
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <PlusIcon />
            </div>
            <h2 className="mt-4 text-2xl font-semibold">
              No communication profiles yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Create a profile to store approved knowledge, response tone and
              verified links for safe message review.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="btn btn-primary mt-6"
            >
              <PlusIcon />
              Create Profile
            </Link>
          </section>
        ) : (
          <>
            <section
              aria-label="Dashboard summary"
              className="mt-6 grid gap-4 md:grid-cols-3"
            >
              <DashboardMetric
                label="Profiles"
                value={projects.length}
                detail="Knowledge bases configured"
              />
              <DashboardMetric
                label="Verified links"
                value={totalOfficialLinks}
                detail="Trusted sources available"
              />
              <DashboardMetric
                label="Tone presets"
                value={responseToneCount}
                detail="Response styles in use"
              />
            </section>

            <section className="section-card mt-6 p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="kicker">How it works</p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Profile, review, report.
                  </h2>
                </div>
                <Link href="/security-engine" className="btn btn-secondary">
                  View Engine
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Concept
                  title="Communication Profile"
                  text="Stores approved documentation, trusted official links and response tone."
                />
                <Concept
                  title="Single Message Review"
                  text="Analyzes one message through deterministic and AI-assisted checks."
                />
                <Concept
                  title="Batch Review"
                  text="Analyzes up to 25 messages and records measured results."
                />
                <Concept
                  title="Report"
                  text="Aggregates stored results, triggered rules, categories, risks and escalations."
                />
                <Concept
                  title="Official Links"
                  text="Only explicitly configured links are treated as trusted."
                />
                <Concept
                  title="Human Review"
                  text="Suggested replies and actions remain approval-required."
                />
              </div>
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="interactive-card flex min-h-[19rem] flex-col p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Communication profile
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold leading-tight">
                        {project.name}
                      </h2>
                    </div>
                    <span className="badge shrink-0 border-emerald-200 bg-emerald-50 text-emerald-800">
                      {project.responseTone}
                    </span>
                  </div>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                    {project.description}
                  </p>
                  <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <dt className="font-semibold text-slate-800">
                        Primary site
                      </dt>
                      <dd className="mt-1 break-all text-slate-600">
                        {project.websiteUrl}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <dt className="font-semibold text-slate-800">
                        Verified links
                      </dt>
                      <dd className="mt-1 text-slate-600">
                        {project.officialLinks.length}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="btn btn-primary"
                    >
                      Open Project
                    </Link>
                    <Link
                      href={`/dashboard/projects/${project.id}/analyse`}
                      className="btn btn-secondary"
                    >
                      Review Message
                    </Link>
                    <Link
                      href={`/dashboard/projects/${project.id}/batch`}
                      className="btn btn-secondary"
                    >
                      Batch Review
                    </Link>
                    <Link
                      href={`/dashboard/projects/${project.id}/report`}
                      className="btn btn-secondary"
                    >
                      View Report
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Concept({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function DashboardMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="metric-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
