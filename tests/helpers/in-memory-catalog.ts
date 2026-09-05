import type { CatalogItem } from "../../src/domain/entities/catalog-item.ts";
import type { CatalogKind } from "../../src/domain/entities/catalog-kind.ts";
import type { EntityCard } from "../../src/domain/entities/entity-card.ts";
import { NotFoundError } from "../../src/domain/errors/not-found-error.ts";
import type { CatalogRepository } from "../../src/domain/ports/catalog-repository.ts";

export class InMemoryCatalogRepository implements CatalogRepository {
  constructor(
    private readonly items: CatalogItem[],
    private readonly cards: EntityCard[],
    private readonly relations: Record<string, CatalogItem[]> = {},
  ) {}

  async list(kind: CatalogKind): Promise<CatalogItem[]> {
    return this.items.filter((item) => item.kind === kind);
  }

  async get(kind: CatalogKind, id: number): Promise<EntityCard> {
    const card = this.cards.find((entry) => entry.kind === kind && entry.id === id);
    if (!card) throw new NotFoundError(kind, id);
    return { ...card, fields: [...card.fields], relations: [...card.relations] };
  }

  async searchCharacters(query: string): Promise<CatalogItem[]> {
    const needle = query.toLowerCase();
    return this.items.filter(
      (item) => item.kind === "characters" && item.title.toLowerCase().includes(needle),
    );
  }

  async listRelations(
    fromKind: CatalogKind,
    fromId: number,
    relKind: CatalogKind,
  ): Promise<CatalogItem[]> {
    return this.relations[`${fromKind}:${fromId}:${relKind}`] ?? [];
  }
}
