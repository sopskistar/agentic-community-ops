import { createHmac } from "crypto";
import { afterEach, describe, expect, it } from "vitest";

import {
  listIntegrationEventLogEntries,
  listIntegrationWorkflowRecords,
  MemoryIntegrationEventRepository,
  resetIntegrationEventLogForTests,
  setIntegrationEventRepositoryForTests,
  type IntegrationEventRepository,
} from "../../../../lib/integrations/event-log";
import { GET, POST } from "./route";

const originalEnv = { ...process.env };

afterEach(async () => {
  process.env = { ...originalEnv };
  setIntegrationEventRepositoryForTests(null);
  await resetIntegrationEventLogForTests();
});

describe("Meta webhook route", () => {
  it("returns challenge for valid verification", async () => {
    process.env.META_VERIFY_TOKEN = "verify-token";
    const response = await GET(
      new Request(
        "http://localhost/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=abc123",
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("abc123");
  });

  it("rejects invalid verification", async () => {
    process.env.META_VERIFY_TOKEN = "verify-token";
    const response = await GET(
      new Request(
        "http://localhost/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=abc123",
      ),
    );

    expect(response.status).toBe(403);
  });

  it("rejects invalid signatures when app secret is configured", async () => {
    process.env.META_APP_SECRET = "app-secret";
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": "sha256=bad" },
        body: JSON.stringify({ object: "page", entry: [] }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("accepts valid signatures", async () => {
    process.env.META_APP_SECRET = "app-secret";
    const body = JSON.stringify({ object: "page", entry: [] });
    const signature = createHmac("sha256", "app-secret")
      .update(body)
      .digest("hex");
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": `sha256=${signature}` },
        body,
      }),
    );

    expect(response.status).toBe(200);
  });

  it("persists Facebook event lifecycle and approval-required suggestion", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createMetaPayload("page", "facebook-mid"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "facebook_message_received",
        "meta_analysis_started",
        "message",
      ]),
    );
    const workflows = await listIntegrationWorkflowRecords();
    expect(workflows[0].provider).toBe("facebook");
    expect(workflows[0].suggestion?.requiresHumanApproval).toBe(true);
    expect(workflows[0].suggestion?.outboundAvailable).toBe(false);
  });

  it("persists Instagram message diagnostics separately", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify(createMetaPayload("instagram", "instagram-mid"));
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events.some((event) => event.provider === "instagram")).toBe(true);
    expect(events.map((event) => event.eventType)).toContain(
      "instagram_message_received",
    );
  });

  it("records unsupported payloads without storing private message text", async () => {
    process.env.META_APP_SECRET = "app-secret";
    setIntegrationEventRepositoryForTests(new MemoryIntegrationEventRepository());
    const body = JSON.stringify({
      object: "page",
      entry: [{ id: "page-1", messaging: [{ message: { is_echo: true } }] }],
    });
    const response = await POST(
      new Request("http://localhost/api/webhooks/meta", {
        method: "POST",
        headers: { "x-hub-signature-256": sign(body) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    const events = await listIntegrationEventLogEntries();
    expect(events[0].eventType).toBe("meta_payload_unsupported");
    expect(JSON.stringify(events)).not.toContain("private message");
  });

  it("emits a safe diagnostic when persistence fails", async () => {
    process.env.META_APP_SECRET = "app-secret";
    const errors: string[] = [];
    const originalConsoleError = console.error;
    console.error = (message?: unknown) => {
      errors.push(String(message));
    };
    setIntegrationEventRepositoryForTests(new FailingIntegrationEventRepository());
    const body = JSON.stringify(createMetaPayload("page", "facebook-mid"));

    try {
      const response = await POST(
        new Request("http://localhost/api/webhooks/meta", {
          method: "POST",
          headers: { "x-hub-signature-256": sign(body) },
          body,
        }),
      );

      expect(response.status).toBe(200);
      expect(errors).toContain("meta_event_persistence_failed");
      expect(JSON.stringify(errors)).not.toContain("app-secret");
      expect(JSON.stringify(errors)).not.toContain("Hello Meta");
    } finally {
      console.error = originalConsoleError;
    }
  });
});

function createMetaPayload(object: "page" | "instagram", messageId: string) {
  return {
    object,
    entry: [
      {
        id: object === "instagram" ? "ig-1" : "page-1",
        time: 1,
        messaging: [
          {
            sender: { id: "sender-1" },
            recipient: { id: object === "instagram" ? "ig-1" : "page-1" },
            timestamp: 1,
            message: { mid: messageId, text: "Hello Meta" },
          },
        ],
      },
    ],
  };
}

function sign(body: string) {
  const signature = createHmac("sha256", "app-secret")
    .update(body)
    .digest("hex");
  return `sha256=${signature}`;
}

class FailingIntegrationEventRepository implements IntegrationEventRepository {
  async appendEvent() {
    throw new Error("storage failed");
  }

  async listEvents() {
    return [];
  }

  async saveWorkflow() {
    throw new Error("storage failed");
  }

  async getWorkflow() {
    return null;
  }

  async listWorkflows() {
    return [];
  }
}
