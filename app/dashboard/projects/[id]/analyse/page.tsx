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
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Message Analysis
            </p>
            <h1 className="mt-3 text-4xl font-semibold">{project.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Run deterministic security analysis first, then AI-assisted
              classification and safe reply generation using this project
              knowledge base.
            </p>
          </div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            Edit Project
          </Link>
        </div>

        <AnalyseClient project={project} />
      </div>
    </main>
  );
}
