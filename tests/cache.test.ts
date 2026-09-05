import { describe, expect, it, vi } from "vitest";
import { MemoryTtlCache } from "../src/infrastructure/cache/memory-ttl-cache.ts";

describe("MemoryTtlCache", () => {
  it("returns values inside TTL and drops them after", () => {
    vi.useFakeTimers();
    const cache = new MemoryTtlCache();
    cache.set("k", 1, 1000);
    expect(cache.get("k")).toBe(1);
    vi.advanceTimersByTime(1001);
    expect(cache.get("k")).toBeUndefined();
    vi.useRealTimers();
  });
});
