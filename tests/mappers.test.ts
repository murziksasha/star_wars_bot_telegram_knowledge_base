import { describe, expect, it } from "vitest";
import { mergeTransport, toCatalogItem, toFields } from "../src/adapters/swapi/mappers.ts";

describe("SWAPI mappers", () => {
  it("merges transport name onto a starship without name", () => {
    const merged = mergeTransport(
      {
        id: 2,
        name: "CR90 corvette",
        manufacturer: "Corellian Engineering Corporation",
        crew: "30-165",
      },
      { id: 2, MGLT: "60", starship_class: "corvette", hyperdrive_rating: "2.0" },
    );

    expect(merged.name).toBe("CR90 corvette");
    expect(merged.starship_class).toBe("corvette");
    expect(merged.hyperdrive_rating).toBe("2.0");
    expect(merged.manufacturer).toBe("Corellian Engineering Corporation");
  });

  it("falls back to class when transport is missing", () => {
    const merged = mergeTransport(null, { id: 2, starship_class: "corvette" });
    expect(merged.name).toBe("corvette");
  });

  it("maps catalog titles from name or title", () => {
    expect(toCatalogItem({ id: 1, title: "A New Hope" }, "films")?.title).toBe("A New Hope");
    expect(toCatalogItem({ id: 1, name: "Luke Skywalker" }, "characters")?.title).toBe(
      "Luke Skywalker",
    );
  });

  it("keeps starship fields after merge", () => {
    const merged = mergeTransport(
      { id: 2, name: "CR90 corvette", length: "150" },
      { id: 2, starship_class: "corvette", hyperdrive_rating: "2.0" },
    );
    const fields = toFields(merged, "starships");
    expect(fields.find((field) => field.key === "hyperdrive_rating")?.value).toBe("2.0");
    expect(fields.find((field) => field.key === "length")?.value).toBe("150");
  });
});
