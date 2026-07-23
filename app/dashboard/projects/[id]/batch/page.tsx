import Link from "next/link";
import { notFound } from "next/navigation";

import { projectRepository } from "../../../../../lib/projects/local-json-project-repository";
import { ProjectBreadcrumbs, ProjectWorkflowNav } from "../../project-navigation";

import { BatchClient } from "./batch-client";

export async function generateStaticParams() {
  const projects = await projectRepository.list();
  return projects.map((project) => ({ id: project.id }));
}

export default async function ProjectBatchPage({
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
        <ProjectBreadcrumbs project={project} current="Batch Review" />
        <div className="section-card mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-7">
          <div>
            <p className="kicker">
              Batch Analysis
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review up to 25 messages, filter by risk and category, export
              raw results, then generate a measured report from stored results.
              Batch review uses the same normalized communication pipeline as
              single-message analysis.
            </p>
            <ProjectWorkflowNav project={project} active="batch" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/projects/${project.id}`} className="btn btn-secondary">
              Project Overview
            </Link>
            <Link href="/dashboard" className="btn btn-secondary">
              Platform Dashboard
            </Link>
          </div>
        </div>

        <BatchClient project={project} />
      </div>
    </main>
  );
}
