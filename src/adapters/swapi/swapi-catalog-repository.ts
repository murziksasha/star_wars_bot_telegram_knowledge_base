import type { CatalogItem } from "../../domain/entities/catalog-item.ts";
import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import type { EntityCard, RelationAction } from "../../domain/entities/entity-card.ts";
import { NotFoundError } from "../../domain/errors/not-found-error.ts";
import type { CatalogRepository } from "../../domain/ports/catalog-repository.ts";
import type { TtlCache } from "../../domain/ports/ttl-cache.ts";
import { CARD_TTL_MS, LIST_TTL_MS } from "../../infrastructure/cache/memory-ttl-cache.ts";
import {
  asRecord,
  asRecordArray,
  mergeTransport,
  toCatalogItem,
  toEntityCard,
  type SwapiRecord,
} from "./mappers.ts";
import type { SwapiHttpClient } from "./swapi-http-client.ts";

const LIST_RELATIONS: Partial<Record<CatalogKind, CatalogKind[]>> = {
  films: ["characters", "planets", "species", "starships", "vehicles"],
  characters: ["films"],
  planets: ["characters", "films"],
  species: ["characters"],
  starships: ["characters"],
  vehicles: ["characters"],
  transports: ["characters"],
};

function relationPath(fromKind: CatalogKind, fromId: number, relKind: CatalogKind): string | null {
  if (fromKind === "transports" && relKind === "characters") return null;
  const allowed = LIST_RELATIONS[fromKind] ?? [];
  if (!allowed.includes(relKind)) return null;
  return `/api/${fromKind}/${fromId}/${relKind}`;
}

export class SwapiCatalogRepository implements CatalogRepository {
  constructor(
    private readonly http: SwapiHttpClient,
    private readonly cache: TtlCache,
  ) {}

  async list(kind: CatalogKind): Promise<CatalogItem[]> {
    const cacheKey = `list:${kind}`;
    const cached = this.cache.get<CatalogItem[]>(cacheKey);
    if (cached) return cached;

    const raw = asRecordArray(await this.http.getJson<unknown>(`/api/${kind}`));
    let items = this.toItems(raw, kind);
    if (kind === "starships" || kind === "vehicles") {
      items = await this.enrichTransportTitles(items);
    }
    this.cache.set(cacheKey, items, LIST_TTL_MS);
    return items;
  }

  async get(kind: CatalogKind, id: number): Promise<EntityCard> {
    const cacheKey = `card:${kind}:${id}`;
    const cached = this.cache.get<EntityCard>(cacheKey);
    if (cached) return cached;

    const raw = await this.loadRecord(kind, id);
    const relations = this.relationActions(raw, kind, id);
    const card = toEntityCard(raw, kind, relations);
    this.cache.set(cacheKey, card, CARD_TTL_MS);
    return card;
  }

  async searchCharacters(query: string): Promise<CatalogItem[]> {
    const q = query.trim();
    if (!q) return [];
    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = this.cache.get<CatalogItem[]>(cacheKey);
    if (cached) return cached;

    const encoded = encodeURIComponent(q);
    const raw = asRecordArray(await this.http.getJson<unknown>(`/api/people?search=${encoded}`));
    const items = this.toItems(raw, "characters");
    this.cache.set(cacheKey, items, LIST_TTL_MS);
    return items;
  }

  async listRelations(
    fromKind: CatalogKind,
    fromId: number,
    relKind: CatalogKind,
  ): Promise<CatalogItem[]> {
    const cacheKey = `rel:${fromKind}:${fromId}:${relKind}`;
    const cached = this.cache.get<CatalogItem[]>(cacheKey);
    if (cached) return cached;

    let raw: SwapiRecord[];
    if (fromKind === "transports" && relKind === "characters") {
      raw = await this.transportCharacters(fromId);
    } else {
      const path = relationPath(fromKind, fromId, relKind);
      if (!path) return [];
      raw = asRecordArray(await this.http.getJson<unknown>(path));
    }

    let items = this.toItems(raw, relKind);
    if (relKind === "starships" || relKind === "vehicles") {
      items = await this.enrichTransportTitles(items);
    }
    this.cache.set(cacheKey, items, LIST_TTL_MS);
    return items;
  }

  private toItems(raw: SwapiRecord[], kind: CatalogKind): CatalogItem[] {
    return raw
      .map((row) => toCatalogItem(row, kind))
      .filter((item): item is CatalogItem => item !== null);
  }

  private async loadRecord(kind: CatalogKind, id: number): Promise<SwapiRecord> {
    if (kind === "starships" || kind === "vehicles") {
      const [specific, transport] = await Promise.all([
        this.http.getJson<unknown>(`/api/${kind}/${id}`),
        this.tryGet(`/api/transports/${id}`),
      ]);
      return mergeTransport(transport, asRecord(specific));
    }

    if (kind === "transports") {
      const transport = asRecord(await this.http.getJson<unknown>(`/api/transports/${id}`));
      const starship = await this.tryGet(`/api/starships/${id}`);
      if (starship) return mergeTransport(transport, starship);
      const vehicle = await this.tryGet(`/api/vehicles/${id}`);
      if (vehicle) return mergeTransport(transport, vehicle);
      return transport;
    }

    return asRecord(await this.http.getJson<unknown>(`/api/${kind}/${id}`));
  }

  private async tryGet(path: string): Promise<SwapiRecord | null> {
    try {
      return asRecord(await this.http.getJson<unknown>(path));
    } catch (error) {
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  }

  private async transportNameMap(): Promise<Map<number, string>> {
    const cached = this.cache.get<Array<[number, string]>>("map:transports");
    if (cached) return new Map(cached);
    const items = await this.list("transports");
    const entries: Array<[number, string]> = items.map((item) => [item.id, item.title]);
    this.cache.set("map:transports", entries, LIST_TTL_MS);
    return new Map(entries);
  }

  private async enrichTransportTitles(items: CatalogItem[]): Promise<CatalogItem[]> {
    const names = await this.transportNameMap();
    return items.map((item) => {
      const name = names.get(item.id);
      return name ? { ...item, title: name } : item;
    });
  }

  private async transportCharacters(id: number): Promise<SwapiRecord[]> {
    try {
      return asRecordArray(await this.http.getJson<unknown>(`/api/starships/${id}/characters`));
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }
    try {
      return asRecordArray(await this.http.getJson<unknown>(`/api/vehicles/${id}/characters`));
    } catch (error) {
      if (error instanceof NotFoundError) return [];
      throw error;
    }
  }

  private relationActions(raw: SwapiRecord, kind: CatalogKind, id: number): RelationAction[] {
    const actions: RelationAction[] = [];
    if (kind === "characters") {
      const homeworld = Number(raw.homeworld);
      if (Number.isFinite(homeworld) && homeworld > 0) {
        actions.push({ mode: "entity", kind: "planets", id: homeworld, labelKey: "homeworld" });
      }
      const speciesId = Number(raw.species_id);
      if (Number.isFinite(speciesId) && speciesId > 0) {
        actions.push({ mode: "entity", kind: "species", id: speciesId, labelKey: "characterSpecies" });
      }
    }
    if (kind === "species") {
      const homeworld = Number(raw.homeworld);
      if (Number.isFinite(homeworld) && homeworld > 0) {
        actions.push({ mode: "entity", kind: "planets", id: homeworld, labelKey: "homeworld" });
      }
    }

    for (const relKind of LIST_RELATIONS[kind] ?? []) {
      actions.push({
        mode: "list",
        fromKind: kind,
        fromId: id,
        relKind,
        labelKey: relKind,
      });
    }
    return actions;
  }
}
