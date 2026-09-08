import { afterEach, describe, expect, it, vi } from "vitest";
import { CallbackGate } from "../src/adapters/telegram/callback-gate.ts";

afterEach(() => {
  vi.useRealTimers();
});

describe("CallbackGate", () => {
  it("processes a new query once", () => {
    const gate = new CallbackGate();
    expect(gate.claim("q1", "chat", "e:f:1")).toBe("process");
    expect(gate.claim("q1", "chat", "e:f:1")).toBe("duplicate");
  });

  it("ignores a second click on the same button while the first is in flight", () => {
    const gate = new CallbackGate();
    expect(gate.claim("q1", "chat", "e:f:1")).toBe("process");
    expect(gate.claim("q2", "chat", "e:f:1")).toBe("busy");
  });

  it("allows the same button after release", () => {
    const gate = new CallbackGate();
    expect(gate.claim("q1", "chat", "e:f:1")).toBe("process");
    gate.release("chat", "e:f:1");
    expect(gate.claim("q2", "chat", "e:f:1")).toBe("process");
  });

  it("allows a different button in the same chat concurrently", () => {
    const gate = new CallbackGate();
    expect(gate.claim("q1", "chat", "e:f:1")).toBe("process");
    expect(gate.claim("q2", "chat", "e:f:2")).toBe("process");
  });

  it("expires a stuck in-flight lock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const gate = new CallbackGate(60_000, 5);
    expect(gate.claim("q1", "chat", "e:f:1")).toBe("process");
    vi.setSystemTime(1_010);
    expect(gate.claim("q2", "chat", "e:f:1")).toBe("process");
  });
});
