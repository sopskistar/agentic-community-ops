import Link from "next/link";
import { notFound } from "next/navigation";

import { projectRepository } from "@/lib/projects/local-json-project-repository";

import { updateProject } from "../actions";
import { ProjectForm } from "../project-form";

export async function generateStaticParams() {
  const projects = await projectRepository.list();
  return projects.map((project) => ({ id: project.id }));
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await projectRepository.getById(id);

  if (!project) {
    notFound();
  }

  const updateProjectWithId = updateProject.bind(null, project.id);

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-12 text-slate-950">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Edit Project
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {project.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Update official documentation, verified links and response tone for
          this project.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/projects/${project.id}/analyse`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Analyse Message
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}/batch`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Batch Analysis
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}/report`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Report
          </Link>
        </div>
        <div className="mt-8">
          <ProjectForm
            action={updateProjectWithId}
            submitLabel="Save Project"
            project={project}
          />
        </div>
      </div>
    </main>
  );
}
