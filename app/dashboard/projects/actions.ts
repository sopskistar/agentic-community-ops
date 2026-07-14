"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { projectRepository } from "@/lib/projects/local-json-project-repository";
import { parseOfficialLinks, projectInputSchema } from "@/lib/projects/schemas";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseProjectFormData(formData: FormData) {
  return projectInputSchema.parse({
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description"),
    websiteUrl: getStringValue(formData, "websiteUrl"),
    documentationText: getStringValue(formData, "documentationText"),
    officialLinks: parseOfficialLinks(formData.get("officialLinks")),
    responseTone: getStringValue(formData, "responseTone"),
  });
}

export async function createProject(formData: FormData) {
  const projectInput = parseProjectFormData(formData);
  const project = await projectRepository.create(projectInput);

  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${project.id}`);
}

export async function updateProject(projectId: string, formData: FormData) {
  const projectInput = parseProjectFormData(formData);
  const project = await projectRepository.update(projectId, projectInput);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${project.id}`);
  redirect(`/dashboard/projects/${project.id}`);
}
