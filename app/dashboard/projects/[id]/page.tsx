import { notFound } from "next/navigation";

import { projectRepository } from "@/lib/projects/local-json-project-repository";

import { updateProject } from "../actions";
import { ProjectForm } from "../project-form";
import { ProjectBreadcrumbs, ProjectWorkflowNav } from "../project-navigation";

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
        <ProjectBreadcrumbs project={project} current="Overview" />
        <div className="section-card p-6 md:p-8">
          <p className="kicker">
            Communication Profile
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            {project.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This profile defines trusted documentation, official links and
            response tone for single-message review, batch analysis and
            measured reports.
          </p>
          <ProjectWorkflowNav project={project} active="overview" />
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <ProfileDetail label="Status" value="Implemented profile" />
            <ProfileDetail label="Profile type" value={project.responseTone} />
            <ProfileDetail
              label="Official links"
              value={String(project.officialLinks.length)}
            />
          </section>
          <div className="mt-8">
            <div id="project-configuration" className="mb-4">
              <p className="kicker">Settings</p>
              <h2 className="mt-2 text-2xl font-semibold">
                Project Configuration
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Edit the profile only when trusted documentation, official
                links or the approved response tone need to change.
              </p>
            </div>
            <ProjectForm
              action={updateProjectWithId}
              submitLabel="Save Profile"
              project={project}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
