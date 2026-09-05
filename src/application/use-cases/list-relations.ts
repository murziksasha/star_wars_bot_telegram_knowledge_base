import type { CatalogItem } from "../../domain/entities/catalog-item.ts";
import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import type { CatalogRepository } from "../../domain/ports/catalog-repository.ts";

export class ListRelations {
  constructor(private readonly catalog: CatalogRepository) {}

  execute(fromKind: CatalogKind, fromId: number, relKind: CatalogKind): Promise<CatalogItem[]> {
    return this.catalog.listRelations(fromKind, fromId, relKind);
  }
}
