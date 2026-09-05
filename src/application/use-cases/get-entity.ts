import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import type { EntityCard } from "../../domain/entities/entity-card.ts";
import type { CatalogRepository } from "../../domain/ports/catalog-repository.ts";
import type { ImageResolver } from "../../domain/ports/image-resolver.ts";

export class GetEntity {
  constructor(
    private readonly catalog: CatalogRepository,
    private readonly images: ImageResolver,
  ) {}

  async execute(kind: CatalogKind, id: number): Promise<EntityCard> {
    const card = await this.catalog.get(kind, id);
    const imageUrl = await this.images.resolve(kind, id);
    return { ...card, imageUrl };
  }
}
