import { describe, expect, it } from "vitest";

import { normalizeDiscordMessage } from "./discord";

describe("normalizeDiscordMessage", () => {
  it("normalizes guild text messages", () => {
    const normalized = normalizeDiscordMessage({
      id: "msg-1",
      content: "Can someone review this suspicious link?",
      createdTimestamp: 1_800_000_000_000,
      channelId: "channel-1",
      guildId: "guild-1",
      author: { id: "user-1", username: "user", bot: false },
    });

    expect(normalized).toMatchObject({
      source: "discord",
    });
    expect(normalized?.externalId).toMatch(/^[a-f0-9]{32}$/);
    expect(normalized?.channelId).toMatch(/^[a-f0-9]{32}$/);
    expect(normalized?.senderId).toMatch(/^[a-f0-9]{32}$/);
    expect(normalized?.externalId).not.toBe("msg-1");
    expect(normalized?.channelId).not.toBe("channel-1");
    expect(normalized?.senderId).not.toBe("user-1");
  });

  it("ignores bot messages and direct messages", () => {
    expect(
      normalizeDiscordMessage({
        id: "msg-1",
        content: "bot",
        channelId: "channel-1",
        guildId: "guild-1",
        author: { id: "bot-1", bot: true },
      }),
    ).toBeNull();

    expect(
      normalizeDiscordMessage({
        id: "msg-2",
        content: "dm",
        channelId: "channel-1",
        guildId: null,
        author: { id: "user-1", bot: false },
      }),
    ).toBeNull();
  });
});
