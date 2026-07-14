import type { Project, ProjectInput } from "./types";

export type ProjectRepository = {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(input: ProjectInput): Promise<Project>;
  update(id: string, input: ProjectInput): Promise<Project>;
};
