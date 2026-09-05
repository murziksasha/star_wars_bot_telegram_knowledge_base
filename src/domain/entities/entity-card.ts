import type { CatalogKind } from "./catalog-kind.ts";

export type EntityField = {
  key: string;
  label: string;
  value: string;
};

export type RelationLabelKey = CatalogKind | "homeworld" | "characterSpecies";

export type RelationAction =
  | { mode: "entity"; kind: CatalogKind; id: number; labelKey: RelationLabelKey }
  | { mode: "list"; fromKind: CatalogKind; fromId: number; relKind: CatalogKind; labelKey: RelationLabelKey };

export type EntityCard = {
  kind: CatalogKind;
  id: number;
  title: string;
  fields: EntityField[];
  imageUrl: string | null;
  relations: RelationAction[];
};
