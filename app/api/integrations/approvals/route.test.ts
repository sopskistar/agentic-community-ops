import { afterEach, describe, expect, it } from "vitest";

import {
  getIntegrationWorkflowRecord,
  MemoryIntegrationEventRepository,
  setIntegrationEventRepositoryForTests,
} from "../../../../lib/integrations/event-log";
import { createWorkflow } from "../../../../lib/integrations/workspace.test";
import { PATCH } from "./[id]/route";

afterEach(() => {
  setIntegrationEventRepositoryForTests(null);
});

describe("/api/integrations/approvals/[id]", () => {
  it("updates approval state internally without external execution", async () => {
    const repository = new MemoryIntegrationEventRepository();
    setIntegrationEventRepositoryForTests(repository);
    await repository.saveWorkflow(createWorkflow());

    const response = await PATCH(
      new Request("http://localhost/api/integrations/approvals/gmail:hashed-message", {
        method: "PATCH",
        body: JSON.stringify({
          status: "approved",
          notes: "Reviewed internally.",
          actorLabel: "Ops reviewer",
        }),
      }),
      { params: Promise.resolve({ id: "gmail:hashed-message" }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.externalExecution).toBe("unavailable");
    const workflow = await getIntegrationWorkflowRecord("gmail:hashed-message");
    expect(workflow?.approval?.status).toBe("approved");
    expect(workflow?.approval?.history?.[0]).toMatchObject({
      previousStatus: "pending",
      newStatus: "approved",
    });
    expect(workflow?.execution?.status).toBe("not_attempted");
  });

  it("rejects invalid approval transitions", async () => {
    const repository = new MemoryIntegrationEventRepository();
    setIntegrationEventRepositoryForTests(repository);
    await repository.saveWorkflow(createWorkflow());

    const response = await PATCH(
      new Request("http://localhost/api/integrations/approvals/gmail:hashed-message", {
        method: "PATCH",
        body: JSON.stringify({ status: "executed" }),
      }),
      { params: Promise.resolve({ id: "gmail:hashed-message" }) },
    );

    expect(response.status).toBe(400);
  });
});
