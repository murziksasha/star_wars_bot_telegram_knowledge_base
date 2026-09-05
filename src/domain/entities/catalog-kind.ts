export const CATALOG_KINDS = [
  "films",
  "characters",
  "planets",
  "species",
  "starships",
  "transports",
  "vehicles",
] as const;

export type CatalogKind = (typeof CATALOG_KINDS)[number];

export const KIND_CODES = {
  films: "f",
  characters: "c",
  planets: "p",
  species: "s",
  starships: "ss",
  transports: "t",
  vehicles: "v",
} as const satisfies Record<CatalogKind, string>;

export const CODE_TO_KIND = {
  f: "films",
  c: "characters",
  p: "planets",
  s: "species",
  ss: "starships",
  t: "transports",
  v: "vehicles",
} as const satisfies Record<string, CatalogKind>;

export type KindCode = keyof typeof CODE_TO_KIND;

export function isCatalogKind(value: string): value is CatalogKind {
  return (CATALOG_KINDS as readonly string[]).includes(value);
}

export function isKindCode(value: string): value is KindCode {
  return value in CODE_TO_KIND;
}
