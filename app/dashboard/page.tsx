import Link from "next/link";

import { projectRepository } from "@/lib/projects/local-json-project-repository";

export default async function DashboardPage() {
  const projects = await projectRepository.list();

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold">
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
            className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <section className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold">No projects yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Create a project to add official documentation, response tone and
              verified links for safe community support workflows.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Create Project
            </Link>
          </section>
        ) : (
          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{project.name}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {project.description}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {project.responseTone}
                  </span>
                </div>
                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-800">Website</dt>
                    <dd className="mt-1 break-all text-slate-600">
                      {project.websiteUrl}
                    </dd>
                  </div>
                  <div>
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
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
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
