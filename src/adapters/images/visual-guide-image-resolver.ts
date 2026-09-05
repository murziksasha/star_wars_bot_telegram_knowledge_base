import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import type { ImageResolver } from "../../domain/ports/image-resolver.ts";
import type { TtlCache } from "../../domain/ports/ttl-cache.ts";
import { IMAGE_TTL_MS } from "../../infrastructure/cache/memory-ttl-cache.ts";

const VISUAL_GUIDE = "https://starwars-visualguide.com/assets/img";

const KIND_FOLDER: Record<Exclude<CatalogKind, "transports">, string> = {
  films: "films",
  characters: "characters",
  planets: "planets",
  species: "species",
  starships: "starships",
  vehicles: "vehicles",
};

function candidateUrls(kind: CatalogKind, id: number): string[] {
  if (kind === "transports") {
    return [`${VISUAL_GUIDE}/starships/${id}.jpg`, `${VISUAL_GUIDE}/vehicles/${id}.jpg`];
  }
  return [`${VISUAL_GUIDE}/${KIND_FOLDER[kind]}/${id}.jpg`];
}

export class VisualGuideImageResolver implements ImageResolver {
  constructor(
    private readonly cache: TtlCache,
    private readonly timeoutMs = 5000,
  ) {}

  async resolve(kind: CatalogKind, id: number): Promise<string | null> {
    const cacheKey = `img:${kind}:${id}`;
    const cached = this.cache.get<string | null>(cacheKey);
    if (cached !== undefined) return cached;

    let found: string | null = null;
    for (const url of candidateUrls(kind, id)) {
      const exists = await this.exists(url);
      if (exists) {
        found = url;
        break;
      }
    }
    this.cache.set(cacheKey, found, IMAGE_TTL_MS);
    return found;
  }

  private async exists(url: string): Promise<boolean> {
    const status = await this.requestStatus(url, "HEAD");
    if (status === 200) return true;
    if (status === 404) return false;
    const getStatus = await this.requestStatus(url, "GET");
    if (getStatus === 200) return true;
    if (getStatus === 404) return false;
    // Network/CDN glitch: still hand Telegram the URL.
    return status === undefined || getStatus === undefined;
  }

  private async requestStatus(url: string, method: "HEAD" | "GET"): Promise<number | undefined> {
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      return response.status;
    } catch {
      return undefined;
    }
  }
}
