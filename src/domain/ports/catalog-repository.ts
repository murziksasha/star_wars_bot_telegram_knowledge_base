import type { CatalogItem } from "../entities/catalog-item.ts";
import type { CatalogKind } from "../entities/catalog-kind.ts";
import type { EntityCard } from "../entities/entity-card.ts";

export interface CatalogRepository {
  list(kind: CatalogKind): Promise<CatalogItem[]>;
  get(kind: CatalogKind, id: number): Promise<EntityCard>;
  searchCharacters(query: string): Promise<CatalogItem[]>;
  listRelations(fromKind: CatalogKind, fromId: number, relKind: CatalogKind): Promise<CatalogItem[]>;
}
