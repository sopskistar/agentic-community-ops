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
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-4xl">
      <div className="section-card p-6 md:p-8">
        <p className="kicker">
          Edit Project
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          {project.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Update official documentation, verified links and response tone for
          this message analysis profile.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/projects/${project.id}/analyse`}
            className="btn btn-primary"
          >
            Analyse Message
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}/batch`}
            className="btn btn-secondary"
          >
            Batch Analysis
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}/report`}
            className="btn btn-secondary"
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
      </div>
    </main>
  );
}
