import { afterEach, describe, expect, it } from "vitest";

import {
  MemoryIntegrationEventRepository,
  setIntegrationEventRepositoryForTests,
} from "../../../../../lib/integrations/event-log";
import { createWorkflow } from "../../../../../lib/integrations/workspace.test";
import { GET } from "./route";

afterEach(() => {
  setIntegrationEventRepositoryForTests(null);
});

describe("/api/integrations/messages/[id]", () => {
  it("returns a bounded workflow detail without raw secrets", async () => {
    const repository = new MemoryIntegrationEventRepository();
    setIntegrationEventRepositoryForTests(repository);
    await repository.saveWorkflow(createWorkflow());

    const response = await GET(
      new Request("http://localhost/api/integrations/messages/gmail:hashed-message"),
      { params: Promise.resolve({ id: "gmail:hashed-message" }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.workflow.receivedMessage.textPreview).toContain("invoice");
    expect(JSON.stringify(body)).not.toContain("secret-token");
  });

  it("rejects unsafe ids", async () => {
    const response = await GET(
      new Request("http://localhost/api/integrations/messages/../../secret"),
      { params: Promise.resolve({ id: "../../secret" }) },
    );

    expect(response.status).toBe(400);
  });
});
