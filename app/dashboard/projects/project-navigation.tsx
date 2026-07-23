import Link from "next/link";

import type { Project } from "../../../lib/projects/types";

type ProjectSection = "overview" | "analyse" | "batch" | "report" | "settings";

export function ProjectBreadcrumbs({
  project,
  current,
}: {
  project: Project;
  current: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/dashboard" className="font-semibold text-teal-700 hover:underline">
            Platform Dashboard
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="font-semibold text-teal-700 hover:underline"
          >
            {project.name}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="font-semibold text-slate-800">
          {current}
        </li>
      </ol>
    </nav>
  );
}

export function ProjectWorkflowNav({
  project,
  active,
}: {
  project: Project;
  active: ProjectSection;
}) {
  const links: Array<{ id: ProjectSection; label: string; href: string }> = [
    { id: "overview", label: "Overview", href: `/dashboard/projects/${project.id}` },
    {
      id: "analyse",
      label: "Review Message",
      href: `/dashboard/projects/${project.id}/analyse`,
    },
    {
      id: "batch",
      label: "Batch Review",
      href: `/dashboard/projects/${project.id}/batch`,
    },
    { id: "report", label: "Report", href: `/dashboard/projects/${project.id}/report` },
    { id: "settings", label: "Settings", href: `/dashboard/projects/${project.id}#project-configuration` },
  ];

  return (
    <nav aria-label="Project workflow" className="mt-6 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          aria-current={active === link.id ? "page" : undefined}
          className={active === link.id ? "btn btn-primary" : "btn btn-secondary"}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
