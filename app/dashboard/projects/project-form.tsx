import Link from "next/link";

import { responseTones } from "@/lib/projects/types";
import type { Project } from "@/lib/projects/types";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  project?: Project;
};

export function ProjectForm({
  action,
  submitLabel,
  project,
}: ProjectFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Project name
          </span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            defaultValue={project?.name}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-emerald-600"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Website URL
          </span>
          <input
            name="websiteUrl"
            type="url"
            required
            defaultValue={project?.websiteUrl}
            placeholder="https://example.org"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-emerald-600"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">
          Description
        </span>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={500}
          defaultValue={project?.description}
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 shadow-sm outline-none transition-colors focus:border-emerald-600"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">
          Documentation text
        </span>
        <textarea
          name="documentationText"
          required
          minLength={20}
          defaultValue={project?.documentationText}
          rows={8}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 shadow-sm outline-none transition-colors focus:border-emerald-600"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">
          Official links
        </span>
        <textarea
          name="officialLinks"
          defaultValue={project?.officialLinks.join("\n")}
          rows={4}
          placeholder="https://example.org/docs"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 shadow-sm outline-none transition-colors focus:border-emerald-600"
        />
        <span className="block text-xs leading-5 text-slate-500">
          One URL per line. Only these explicit links are treated as official;
          links found in community messages are never promoted automatically.
        </span>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">
          Response tone
        </span>
        <select
          name="responseTone"
          defaultValue={project?.responseTone ?? "PROFESSIONAL"}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-emerald-600"
        >
          {responseTones.map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          {submitLabel}
        </button>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
