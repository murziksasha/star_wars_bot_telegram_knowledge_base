import type { CatalogKind } from "../entities/catalog-kind.ts";

export interface ImageResolver {
  resolve(kind: CatalogKind, id: number): Promise<string | null>;
}
