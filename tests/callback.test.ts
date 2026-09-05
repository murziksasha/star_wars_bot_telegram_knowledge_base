import { describe, expect, it } from "vitest";
import { encodeCallback, parseCallbackData } from "../src/adapters/telegram/callback.ts";

describe("callback_data", () => {
  it("round-trips list, entity, relations, retry", () => {
    const samples = [
      encodeCallback({ type: "menu" }),
      encodeCallback({ type: "search" }),
      encodeCallback({ type: "lang" }),
      encodeCallback({ type: "set-locale", locale: "en" }),
      encodeCallback({ type: "list", kind: "starships", page: 2 }),
      encodeCallback({ type: "entity", kind: "characters", id: 1 }),
      encodeCallback({
        type: "relations",
        fromKind: "films",
        fromId: 1,
        relKind: "characters",
        page: 0,
      }),
      encodeCallback({
        type: "retry",
        inner: { type: "list", kind: "planets", page: 3 },
      }),
    ];

    expect(samples.every((value) => value.length <= 64)).toBe(true);
    expect(parseCallbackData(samples[0]!)).toEqual({ type: "menu" });
    expect(parseCallbackData("g")).toEqual({ type: "lang" });
    expect(parseCallbackData("g:ru")).toEqual({ type: "set-locale", locale: "ru" });
    expect(parseCallbackData("g:en")).toEqual({ type: "set-locale", locale: "en" });
    expect(parseCallbackData("g:de")).toBeNull();
    expect(parseCallbackData(samples[4]!)).toEqual({ type: "list", kind: "starships", page: 2 });
    expect(parseCallbackData(samples[5]!)).toEqual({ type: "entity", kind: "characters", id: 1 });
    expect(parseCallbackData(samples[6]!)).toEqual({
      type: "relations",
      fromKind: "films",
      fromId: 1,
      relKind: "characters",
      page: 0,
    });
    expect(parseCallbackData(samples[7]!)).toEqual({
      type: "retry",
      inner: { type: "list", kind: "planets", page: 3 },
    });
  });

  it("rejects malformed payloads", () => {
    expect(parseCallbackData("zzz")).toBeNull();
    expect(parseCallbackData("e:c:0")).toBeNull();
    expect(parseCallbackData("l:xx:1")).toBeNull();
  });
});
