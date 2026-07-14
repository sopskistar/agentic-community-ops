import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  projectCollectionSchema,
  projectInputSchema,
} from "./schemas";
import type { ProjectRepository } from "./repository";
import type { Project, ProjectInput } from "./types";

const defaultProjectsPath = path.join(
  process.cwd(),
  "data",
  "projects.json",
);

function createProjectId(name: string, existingProjects: Project[]) {
  const baseId =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project";

  let candidate = baseId;
  let suffix = 2;

  while (existingProjects.some((project) => project.id === candidate)) {
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export class LocalJsonProjectRepository implements ProjectRepository {
  constructor(private readonly filePath = defaultProjectsPath) {}

  async list() {
    return this.readProjects();
  }

  async getById(id: string) {
    const projects = await this.readProjects();
    return projects.find((project) => project.id === id) ?? null;
  }

  async create(input: ProjectInput) {
    const parsedInput = projectInputSchema.parse(input);
    const projects = await this.readProjects();
    const timestamp = new Date().toISOString();
    const project: Project = {
      ...parsedInput,
      id: createProjectId(parsedInput.name, projects),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.writeProjects([...projects, project]);
    return project;
  }

  async update(id: string, input: ProjectInput) {
    const parsedInput = projectInputSchema.parse(input);
    const projects = await this.readProjects();
    const projectIndex = projects.findIndex((project) => project.id === id);

    if (projectIndex === -1) {
      throw new Error(`Project not found: ${id}`);
    }

    const updatedProject: Project = {
      ...projects[projectIndex],
      ...parsedInput,
      updatedAt: new Date().toISOString(),
    };

    const nextProjects = projects.toSpliced(projectIndex, 1, updatedProject);
    await this.writeProjects(nextProjects);
    return updatedProject;
  }

  private async readProjects() {
    try {
      const fileContents = await readFile(this.filePath, "utf8");
      return projectCollectionSchema.parse(JSON.parse(fileContents));
    } catch (error) {
      if (isMissingFileError(error)) {
        return [];
      }

      throw error;
    }
  }

  private async writeProjects(projects: Project[]) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const parsedProjects = projectCollectionSchema.parse(projects);
    await writeFile(
      this.filePath,
      `${JSON.stringify(parsedProjects, null, 2)}\n`,
      "utf8",
    );
  }
}

function isMissingFileError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

export const projectRepository = new LocalJsonProjectRepository();
