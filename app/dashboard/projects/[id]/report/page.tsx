import Link from "next/link";
import { notFound } from "next/navigation";

import { projectRepository } from "../../../../../lib/projects/local-json-project-repository";
import { ProjectBreadcrumbs, ProjectWorkflowNav } from "../../project-navigation";

import { ReportClient } from "./report-client";

export async function generateStaticParams() {
  const projects = await projectRepository.list();
  return projects.map((project) => ({ id: project.id }));
}

export default async function ProjectReportPage({
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
        <ProjectBreadcrumbs project={project} current="Report" />
        <div className="section-card mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-7">
          <div>
            <p className="kicker">
              Analysis Report
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Report metrics are recomputed from actual stored batch analysis
              results. Measured data is kept separate from interpretation.
            </p>
            <ProjectWorkflowNav project={project} active="report" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/projects/${project.id}`} className="btn btn-secondary">
              Project Overview
            </Link>
            <Link href={`/dashboard/projects/${project.id}/batch`} className="btn btn-secondary">
              Batch Review
            </Link>
            <Link href="/dashboard" className="btn btn-secondary">
              Platform Dashboard
            </Link>
          </div>
        </div>

        <ReportClient project={project} />
      </div>
    </main>
  );
}
