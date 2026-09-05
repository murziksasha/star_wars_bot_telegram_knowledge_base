import type { TtlCache } from "../../domain/ports/ttl-cache.ts";

type Entry = { value: unknown; expiresAt: number };

export class MemoryTtlCache implements TtlCache {
  private readonly store = new Map<string, Entry>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

export const LIST_TTL_MS = 5 * 60 * 1000;
export const CARD_TTL_MS = 15 * 60 * 1000;
export const IMAGE_TTL_MS = 15 * 60 * 1000;
