import { describe, expect, it } from "vitest";

import { normalizeTelegramUpdate } from "./telegram";

describe("normalizeTelegramUpdate", () => {
  it("normalizes Telegram text messages", () => {
    const normalized = normalizeTelegramUpdate({
      update_id: 123,
      message: {
        message_id: 456,
        date: 1_800_000_000,
        text: "Need help with pricing.",
        from: { id: 789, first_name: "Ada", is_bot: false },
        chat: { id: -100, type: "group", title: "Test Group" },
      },
    });

    expect(normalized).toMatchObject({
      source: "telegram",
      externalId: "123",
      channelId: "-100",
      senderName: "Ada",
      text: "Need help with pricing.",
    });
  });

  it("ignores bot-authored messages", () => {
    expect(
      normalizeTelegramUpdate({
        update_id: 123,
        message: {
          message_id: 456,
          date: 1_800_000_000,
          text: "bot",
          from: { id: 789, is_bot: true },
          chat: { id: -100, type: "group" },
        },
      }),
    ).toBeNull();
  });
});
