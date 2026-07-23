import Link from "next/link";
import { notFound } from "next/navigation";

import { projectRepository } from "../../../../../lib/projects/local-json-project-repository";
import { ProjectBreadcrumbs, ProjectWorkflowNav } from "../../project-navigation";

import { AnalyseClient } from "./analyse-client";

export async function generateStaticParams() {
  const projects = await projectRepository.list();
  return projects.map((project) => ({ id: project.id }));
}

export default async function ProjectAnalysePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await projectRepository.getById(id);

  if (!project) {
    notFound();
  }

  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <ProjectBreadcrumbs project={project} current="Review Message" />
        <div className="section-card mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-7">
          <div>
            <p className="kicker">
              Message Analysis
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Run deterministic rules first, then AI-assisted classification
              and safe reply suggestions using this profile. Messages are
              normalized before context-aware analysis runs.
            </p>
            <ProjectWorkflowNav project={project} active="analyse" />
          </div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="btn btn-secondary"
          >
            Project Overview
          </Link>
        </div>

        <AnalyseClient project={project} />
      </div>
    </main>
  );
}
