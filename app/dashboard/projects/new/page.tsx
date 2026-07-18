import { createProject } from "../actions";
import { ProjectForm } from "../project-form";

export default function NewProjectPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-4xl">
      <div className="section-card p-6 md:p-8">
        <p className="kicker">
          New Project
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          Create communication knowledge base
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add official project documentation and verified links. Links from
          submitted messages are never imported or treated as official sources.
        </p>
        <div className="mt-8">
          <ProjectForm action={createProject} submitLabel="Create Project" />
        </div>
      </div>
      </div>
    </main>
  );
}
