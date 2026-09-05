import type { CatalogKind } from "./catalog-kind.ts";

export type CatalogItem = {
  id: number;
  kind: CatalogKind;
  title: string;
};
