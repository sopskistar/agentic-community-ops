import Link from "next/link";
import { notFound } from "next/navigation";

import { projectRepository } from "../../../../../lib/projects/local-json-project-repository";

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
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-12 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Security Report
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Report metrics are recomputed from actual stored batch analysis
              results. Measured data is kept separate from interpretation.
            </p>
          </div>
          <Link
            href={`/dashboard/projects/${project.id}/batch`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Batch Analysis
          </Link>
        </div>

        <ReportClient project={project} />
      </div>
    </main>
  );
}
