import Link from "next/link";
import { notFound } from "next/navigation";

import { projectRepository } from "../../../../../lib/projects/local-json-project-repository";

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
        <div className="section-card mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-7">
          <div>
            <p className="kicker">
              Message Review
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Run deterministic security analysis first, then AI-assisted
              classification and safe reply generation using this project
              knowledge base.
            </p>
          </div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="btn btn-secondary"
          >
            Edit Project
          </Link>
        </div>

        <AnalyseClient project={project} />
      </div>
    </main>
  );
}
