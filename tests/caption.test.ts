import { describe, expect, it } from "vitest";
import {
  formatEntityCard,
  TELEGRAM_CAPTION_LIMIT,
} from "../src/application/formatters/caption.ts";
import type { EntityCard } from "../src/domain/entities/entity-card.ts";

describe("caption formatter", () => {
  it("keeps short cards in a single caption", () => {
    const card: EntityCard = {
      kind: "characters",
      id: 1,
      title: "Luke Skywalker",
      fields: [{ key: "gender", label: "Пол", value: "male" }],
      imageUrl: null,
      relations: [],
    };
    const formatted = formatEntityCard(card);
    expect(formatted.caption).toContain("Luke Skywalker");
    expect(formatted.caption).toContain("Пол: male");
    expect(formatted.extras).toEqual([]);
  });

  it("splits overflow beyond the 1024 caption limit", () => {
    const crawl = "A".repeat(1500);
    const card: EntityCard = {
      kind: "films",
      id: 1,
      title: "A New Hope",
      fields: [{ key: "opening_crawl", label: "Вступление", value: crawl }],
      imageUrl: null,
      relations: [],
    };
    const formatted = formatEntityCard(card);
    expect(formatted.caption.length).toBeLessThanOrEqual(TELEGRAM_CAPTION_LIMIT);
    expect(formatted.extras.join("").length).toBeGreaterThan(0);
    expect(formatted.caption + formatted.extras.join("")).toContain("A New Hope");
  });
});
