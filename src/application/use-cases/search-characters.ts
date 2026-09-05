import type { CatalogItem } from "../../domain/entities/catalog-item.ts";
import type { CatalogRepository } from "../../domain/ports/catalog-repository.ts";

export class SearchCharacters {
  constructor(private readonly catalog: CatalogRepository) {}

  execute(query: string): Promise<CatalogItem[]> {
    return this.catalog.searchCharacters(query.trim());
  }
}
