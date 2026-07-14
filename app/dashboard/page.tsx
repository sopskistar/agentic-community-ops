import Link from "next/link";

import { projectRepository } from "@/lib/projects/local-json-project-repository";

export default async function DashboardPage() {
  const projects = await projectRepository.list();

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-12 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
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
            className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-emerald-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              +
            </div>
            <h2 className="text-2xl font-semibold">No projects yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Create a project to add official documentation, response tone and
              verified links for safe community support workflows.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Create Project
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{project.name}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {project.description}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {project.responseTone}
                  </span>
                </div>
                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
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
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
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
