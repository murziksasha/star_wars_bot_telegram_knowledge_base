export type CallbackClaim = 'process' | 'duplicate' | 'busy';

/**
 * Drops Telegram webhook retries of the same callback_query.id and
 * duplicate in-flight clicks on the same inline button in a chat.
 */
export class CallbackGate {
  private readonly seen = new Map<string, number>();
  private readonly inflight = new Map<string, number>();

  constructor(
    private readonly seenTtlMs = 10 * 60_000,
    private readonly inflightTtlMs = 30_000,
    private readonly maxSeen = 1_000,
  ) {}

  claim(queryId: string, chatKey: string, data: string): CallbackClaim {
    const now = Date.now();
    this.prune(now);

    if (this.seen.has(queryId)) return 'duplicate';
    this.seen.set(queryId, now);

    const key = flightKey(chatKey, data);
    const started = this.inflight.get(key);
    if (started !== undefined && now - started < this.inflightTtlMs) {
      return 'busy';
    }
    this.inflight.set(key, now);
    return 'process';
  }

  release(chatKey: string, data: string): void {
    this.inflight.delete(flightKey(chatKey, data));
  }

  private prune(now: number): void {
    if (this.seen.size >= this.maxSeen) {
      for (const [id, ts] of this.seen) {
        if (now - ts > this.seenTtlMs) this.seen.delete(id);
      }
      while (this.seen.size >= this.maxSeen) {
        const first = this.seen.keys().next().value;
        if (first === undefined) break;
        this.seen.delete(first);
      }
    }
    for (const [key, ts] of this.inflight) {
      if (now - ts > this.inflightTtlMs) this.inflight.delete(key);
    }
  }
}

function flightKey(chatKey: string, data: string): string {
  return `${chatKey}\0${data}`;
}
