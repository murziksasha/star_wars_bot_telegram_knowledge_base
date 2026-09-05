import type { CatalogItem } from "../../domain/entities/catalog-item.ts";
import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import type { EntityCard, EntityField, RelationAction } from "../../domain/entities/entity-card.ts";

export type SwapiRecord = Record<string, unknown>;

const FIELD_ORDER: Record<CatalogKind, string[]> = {
  films: ["episode_id", "director", "producer", "release_date", "opening_crawl"],
  characters: ["gender", "birth_year", "height", "mass", "hair_color", "skin_color", "eye_color"],
  planets: [
    "climate",
    "terrain",
    "population",
    "gravity",
    "diameter",
    "rotation_period",
    "orbital_period",
    "surface_water",
  ],
  species: [
    "classification",
    "designation",
    "language",
    "average_height",
    "average_lifespan",
    "hair_colors",
    "skin_colors",
    "eye_colors",
  ],
  starships: [
    "manufacturer",
    "cost_in_credits",
    "length",
    "max_atmosphering_speed",
    "crew",
    "passengers",
    "cargo_capacity",
    "consumables",
    "hyperdrive_rating",
    "MGLT",
    "starship_class",
  ],
  vehicles: [
    "manufacturer",
    "cost_in_credits",
    "length",
    "max_atmosphering_speed",
    "crew",
    "passengers",
    "cargo_capacity",
    "consumables",
    "vehicle_class",
  ],
  transports: [
    "manufacturer",
    "cost_in_credits",
    "length",
    "max_atmosphering_speed",
    "crew",
    "passengers",
    "cargo_capacity",
    "consumables",
    "hyperdrive_rating",
    "MGLT",
    "starship_class",
    "vehicle_class",
  ],
};

export function asRecord(value: unknown): SwapiRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as SwapiRecord;
  }
  return {};
}

export function asRecordArray(value: unknown): SwapiRecord[] {
  if (!Array.isArray(value)) return [];
  return value.map(asRecord);
}

export function recordId(raw: SwapiRecord): number {
  return Number(raw.id);
}

export function recordTitle(raw: SwapiRecord): string {
  const title = raw.title ?? raw.name ?? raw.starship_class ?? raw.vehicle_class;
  if (typeof title === "string" && title.trim()) return title.trim();
  return `#${recordId(raw)}`;
}

export function toCatalogItem(raw: SwapiRecord, kind: CatalogKind): CatalogItem | null {
  const id = recordId(raw);
  if (!Number.isFinite(id) || id <= 0) return null;
  return { id, kind, title: recordTitle(raw) };
}

export function mergeTransport(
  transport: SwapiRecord | null,
  specific: SwapiRecord,
): SwapiRecord {
  return {
    ...(transport ?? {}),
    ...specific,
    name:
      (typeof transport?.name === "string" && transport.name) ||
      (typeof specific.name === "string" && specific.name) ||
      specific.starship_class ||
      specific.vehicle_class,
  };
}

function stringifyValue(value: unknown): string {
  if (value == null) return "";
  return String(value).replace(/\r\n/g, "\n").trim();
}

export function toFields(raw: SwapiRecord, kind: CatalogKind): EntityField[] {
  const fields: EntityField[] = [];
  for (const key of FIELD_ORDER[kind]) {
    const value = stringifyValue(raw[key]);
    if (!value) continue;
    fields.push({
      key,
      label: key,
      value,
    });
  }
  return fields;
}

export function toEntityCard(
  raw: SwapiRecord,
  kind: CatalogKind,
  relations: RelationAction[],
): EntityCard {
  return {
    kind,
    id: recordId(raw),
    title: recordTitle(raw),
    fields: toFields(raw, kind),
    imageUrl: null,
    relations,
  };
}
