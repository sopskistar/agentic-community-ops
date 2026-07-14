import { createProject } from "../actions";
import { ProjectForm } from "../project-form";

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          New Project
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          Create project knowledge base
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add official project documentation and verified links. Links from
          community messages are never imported or treated as official sources.
        </p>
        <div className="mt-8">
          <ProjectForm action={createProject} submitLabel="Create Project" />
        </div>
      </div>
    </main>
  );
}
