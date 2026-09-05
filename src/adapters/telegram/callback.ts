import { z } from "zod";
import { isLocale, type Locale } from "../i18n/locale.ts";
import { CODE_TO_KIND, KIND_CODES, isKindCode, type CatalogKind } from "../../domain/entities/catalog-kind.ts";

export const PAGE_SIZE = 8;

const kindCodeSchema = z.string().refine(isKindCode);

export type CallbackAction =
  | { type: "menu" }
  | { type: "search" }
  | { type: "noop" }
  | { type: "lang" }
  | { type: "set-locale"; locale: Locale }
  | { type: "list"; kind: CatalogKind; page: number }
  | { type: "entity"; kind: CatalogKind; id: number }
  | { type: "relations"; fromKind: CatalogKind; fromId: number; relKind: CatalogKind; page: number }
  | { type: "retry"; inner: Exclude<CallbackAction, { type: "retry" }> };

function kindFromCode(code: string): CatalogKind {
  const parsed = kindCodeSchema.parse(code);
  return CODE_TO_KIND[parsed];
}

function parsePositiveInt(value: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("invalid int");
  }
  return n;
}

function parseId(value: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("invalid id");
  }
  return n;
}

function parseParts(data: string): CallbackAction {
  if (data === "m") return { type: "menu" };
  if (data === "s") return { type: "search" };
  if (data === "n") return { type: "noop" };
  if (data === "g") return { type: "lang" };

  const parts = data.split(":");
  const head = parts[0];

  if (head === "g" && parts.length === 2 && isLocale(parts[1]!)) {
    return { type: "set-locale", locale: parts[1]! };
  }

  if (head === "x") {
    const inner = parseParts(parts.slice(1).join(":"));
    if (inner.type === "retry") throw new Error("nested retry");
    return { type: "retry", inner };
  }

  if (head === "l" && parts.length === 3) {
    return { type: "list", kind: kindFromCode(parts[1]!), page: parsePositiveInt(parts[2]!) };
  }

  if (head === "e" && parts.length === 3) {
    return { type: "entity", kind: kindFromCode(parts[1]!), id: parseId(parts[2]!) };
  }

  if (head === "r" && parts.length === 5) {
    return {
      type: "relations",
      fromKind: kindFromCode(parts[1]!),
      fromId: parseId(parts[2]!),
      relKind: kindFromCode(parts[3]!),
      page: parsePositiveInt(parts[4]!),
    };
  }

  throw new Error("unknown callback");
}

export function parseCallbackData(data: string): CallbackAction | null {
  if (!data || data.length > 64) return null;
  try {
    return parseParts(data);
  } catch {
    return null;
  }
}

export function encodeCallback(action: CallbackAction): string {
  const encoded = encodeCallbackUnchecked(action);
  if (encoded.length > 64) {
    throw new Error(`callback_data exceeds 64 bytes: ${encoded}`);
  }
  return encoded;
}

function encodeCallbackUnchecked(action: CallbackAction): string {
  switch (action.type) {
    case "menu":
      return "m";
    case "search":
      return "s";
    case "noop":
      return "n";
    case "lang":
      return "g";
    case "set-locale":
      return `g:${action.locale}`;
    case "list":
      return `l:${KIND_CODES[action.kind]}:${action.page}`;
    case "entity":
      return `e:${KIND_CODES[action.kind]}:${action.id}`;
    case "relations":
      return `r:${KIND_CODES[action.fromKind]}:${action.fromId}:${KIND_CODES[action.relKind]}:${action.page}`;
    case "retry":
      return `x:${encodeCallbackUnchecked(action.inner)}`;
  }
}
