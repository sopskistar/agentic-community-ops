import Link from "next/link";

import { projectRepository } from "@/lib/projects/local-json-project-repository";

export default async function DashboardPage() {
  const projects = await projectRepository.list();

  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <div className="section-card flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between md:p-7">
          <div>
            <p className="kicker">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Project knowledge base
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Store official project documentation and verified links for safe
              response generation. Community-message links are not treated as
              official links.
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="btn btn-primary"
          >
            <PlusIcon />
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <section className="section-card mt-6 border-dashed border-emerald-300 p-8 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <PlusIcon />
            </div>
            <h2 className="text-2xl font-semibold">No projects yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Create a project to add official documentation, response tone and
              verified links for safe community support workflows.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="btn btn-primary mt-6"
            >
              <PlusIcon />
              Create Project
            </Link>
          </section>
        ) : (
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="interactive-card flex min-h-[19rem] flex-col p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="min-w-0 flex-1 text-2xl font-semibold leading-tight">
                    {project.name}
                  </h2>
                  <span className="badge shrink-0 border-emerald-200 bg-emerald-50 text-emerald-800">
                    {project.responseTone}
                  </span>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                  {project.description}
                </p>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <dt className="font-semibold text-slate-800">Website</dt>
                    <dd className="mt-1 break-all text-slate-600">
                      {project.websiteUrl}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <dt className="font-semibold text-slate-800">
                      Official links
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
                  Edit Project
                </Link>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
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
