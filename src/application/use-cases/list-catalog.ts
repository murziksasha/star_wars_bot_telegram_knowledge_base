import type { CatalogItem } from "../../domain/entities/catalog-item.ts";
import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import type { CatalogRepository } from "../../domain/ports/catalog-repository.ts";

export class ListCatalog {
  constructor(private readonly catalog: CatalogRepository) {}

  execute(kind: CatalogKind): Promise<CatalogItem[]> {
    return this.catalog.list(kind);
  }
}
