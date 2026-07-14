import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LocalJsonProjectRepository } from "./local-json-project-repository";
import type { ProjectInput } from "./types";

const validProjectInput: ProjectInput = {
  name: "Fictional Protocol",
  description: "A fictional Web3 project used for repository tests.",
  websiteUrl: "https://example.invalid",
  documentationText:
    "Official documentation says support will never ask for secrets, passwords, or wallet recovery material.",
  officialLinks: ["https://example.invalid/docs"],
  responseTone: "PROFESSIONAL",
};

let tempDirectory: string;

beforeEach(async () => {
  tempDirectory = await mkdtemp(path.join(os.tmpdir(), "aco-projects-"));
});

afterEach(async () => {
  await rm(tempDirectory, { recursive: true, force: true });
});

function createRepository() {
  return new LocalJsonProjectRepository(
    path.join(tempDirectory, "projects.json"),
  );
}

describe("LocalJsonProjectRepository", () => {
  it("starts with an empty list when the JSON file does not exist", async () => {
    const repository = createRepository();

    await expect(repository.list()).resolves.toEqual([]);
  });

  it("creates and retrieves a project", async () => {
    const repository = createRepository();

    const createdProject = await repository.create(validProjectInput);
    const loadedProject = await repository.getById(createdProject.id);

    expect(createdProject.id).toBe("fictional-protocol");
    expect(loadedProject).toEqual(createdProject);
    expect(createdProject.officialLinks).toEqual([
      "https://example.invalid/docs",
    ]);
  });

  it("stores official links only from the explicit officialLinks field", async () => {
    const repository = createRepository();

    const createdProject = await repository.create({
      ...validProjectInput,
      documentationText:
        "A community message mentioned https://malicious.example but this is not an official project link.",
      officialLinks: ["https://example.invalid/security"],
    });

    expect(createdProject.officialLinks).toEqual([
      "https://example.invalid/security",
    ]);
    expect(createdProject.officialLinks).not.toContain(
      "https://malicious.example",
    );
  });

  it("validates website and official link URLs", async () => {
    const repository = createRepository();

    await expect(
      repository.create({
        ...validProjectInput,
        websiteUrl: "not a url",
      }),
    ).rejects.toThrow();

    await expect(
      repository.create({
        ...validProjectInput,
        officialLinks: ["not a url"],
      }),
    ).rejects.toThrow();
  });

  it("updates an existing project without changing its id or createdAt", async () => {
    const repository = createRepository();
    const createdProject = await repository.create(validProjectInput);

    const updatedProject = await repository.update(createdProject.id, {
      ...validProjectInput,
      name: "Fictional Protocol Updated",
      responseTone: "TECHNICAL",
    });

    expect(updatedProject.id).toBe(createdProject.id);
    expect(updatedProject.createdAt).toBe(createdProject.createdAt);
    expect(updatedProject.updatedAt >= createdProject.updatedAt).toBe(true);
    expect(updatedProject.name).toBe("Fictional Protocol Updated");
    expect(updatedProject.responseTone).toBe("TECHNICAL");
  });

  it("rejects updates for unknown projects", async () => {
    const repository = createRepository();

    await expect(
      repository.update("missing", validProjectInput),
    ).rejects.toThrow("Project not found: missing");
  });
});
