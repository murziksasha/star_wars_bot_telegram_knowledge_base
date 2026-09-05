import { describe, expect, it } from "vitest";
import { GetEntity } from "../src/application/use-cases/get-entity.ts";
import { ListCatalog } from "../src/application/use-cases/list-catalog.ts";
import { ListRelations } from "../src/application/use-cases/list-relations.ts";
import { SearchCharacters } from "../src/application/use-cases/search-characters.ts";
import type { EntityCard } from "../src/domain/entities/entity-card.ts";
import type { ImageResolver } from "../src/domain/ports/image-resolver.ts";
import { InMemoryCatalogRepository } from "./helpers/in-memory-catalog.ts";

const lukeCard: EntityCard = {
  kind: "characters",
  id: 1,
  title: "Luke Skywalker",
  fields: [{ key: "gender", label: "Пол", value: "male" }],
  imageUrl: null,
  relations: [{ mode: "list", fromKind: "characters", fromId: 1, relKind: "films", labelKey: "films" }],
};

const repo = new InMemoryCatalogRepository(
  [
    { id: 1, kind: "characters", title: "Luke Skywalker" },
    { id: 4, kind: "characters", title: "Darth Vader" },
    { id: 1, kind: "films", title: "A New Hope" },
  ],
  [lukeCard],
  {
    "characters:1:films": [{ id: 1, kind: "films", title: "A New Hope" }],
  },
);

const images: ImageResolver = {
  async resolve(kind, id) {
    if (kind === "characters" && id === 1) {
      return "https://starwars-visualguide.com/assets/img/characters/1.jpg";
    }
    return null;
  },
};

describe("use cases", () => {
  it("lists a catalog kind", async () => {
    const items = await new ListCatalog(repo).execute("characters");
    expect(items.map((item) => item.title)).toEqual(["Luke Skywalker", "Darth Vader"]);
  });

  it("loads an entity card and attaches an image", async () => {
    const card = await new GetEntity(repo, images).execute("characters", 1);
    expect(card.title).toBe("Luke Skywalker");
    expect(card.imageUrl).toContain("/characters/1.jpg");
  });

  it("searches characters by substring", async () => {
    const hits = await new SearchCharacters(repo).execute("vader");
    expect(hits).toEqual([{ id: 4, kind: "characters", title: "Darth Vader" }]);
  });

  it("lists relations", async () => {
    const films = await new ListRelations(repo).execute("characters", 1, "films");
    expect(films).toEqual([{ id: 1, kind: "films", title: "A New Hope" }]);
  });
});
