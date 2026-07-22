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
              Manage official documentation, verified links and response tone
              for the current message analysis workflow. User-submitted links
              are never treated as official sources.
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
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="btn btn-secondary mt-auto w-fit"
                  >
                    Manage Profile
                  </Link>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
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
