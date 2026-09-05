import { describe, expect, it } from "vitest";
import { localizeValue } from "../src/adapters/i18n/glossary.ts";
import { localizeEntityCard } from "../src/adapters/i18n/localize.ts";
import { detectLocale } from "../src/adapters/i18n/locale.ts";
import { replyKindFromText, t } from "../src/adapters/i18n/messages.ts";
import { expandCharacterSearchQueries } from "../src/adapters/i18n/search-query.ts";
import { lookupTitle } from "../src/adapters/i18n/titles.ts";
import type { EntityCard } from "../src/domain/entities/entity-card.ts";

describe("locale detect", () => {
  it("maps ru variants to ru and everything else to en", () => {
    expect(detectLocale(undefined)).toBe("ru");
    expect(detectLocale("ru")).toBe("ru");
    expect(detectLocale("ru-RU")).toBe("ru");
    expect(detectLocale("en")).toBe("en");
    expect(detectLocale("uk")).toBe("en");
  });
});

describe("reply buttons", () => {
  it("maps both locale labels to the same catalog kind", () => {
    expect(replyKindFromText("Фильмы")).toBe("films");
    expect(replyKindFromText("Films")).toBe("films");
    expect(replyKindFromText("Персонажи")).toBe("characters");
    expect(replyKindFromText("Characters")).toBe("characters");
  });
});

describe("titles", () => {
  it("translates film 1", () => {
    expect(lookupTitle("films", 1, "A New Hope", "ru")).toBe("Новая надежда");
    expect(lookupTitle("films", 1, "A New Hope", "en")).toBe("A New Hope");
  });
});

describe("search expansion", () => {
  it("maps a Russian query to an English SWAPI name", () => {
    const queries = expandCharacterSearchQueries("люк", "ru");
    expect(queries[0]).toBe("люк");
    expect(queries.some((name) => name.toLowerCase().includes("luke"))).toBe(true);
  });
});

describe("card localization", () => {
  const luke: EntityCard = {
    kind: "characters",
    id: 1,
    title: "Luke Skywalker",
    fields: [{ key: "gender", label: "gender", value: "male" }],
    imageUrl: null,
    relations: [{ mode: "list", fromKind: "characters", fromId: 1, relKind: "films", labelKey: "films" }],
  };

  it("localizes labels and values in Russian", () => {
    const card = localizeEntityCard(luke, "ru");
    expect(card.title).toBe("Люк Скайуокер");
    expect(card.fields[0]?.label).toBe("Пол");
    expect(card.fields[0]?.value).toBe("мужской");
    expect(t("ru").relationLabels.films).toBe("Фильмы");
  });

  it("keeps English chrome and values", () => {
    const card = localizeEntityCard(luke, "en");
    expect(card.title).toBe("Luke Skywalker");
    expect(card.fields[0]?.label).toBe("Gender");
    expect(card.fields[0]?.value).toBe("male");
  });
});

describe("glossary", () => {
  it("translates compound climate and durations", () => {
    expect(localizeValue("temperate, tropical", "ru")).toBe("умеренный, тропический");
    expect(localizeValue("2 years", "ru")).toBe("2 года");
    expect(localizeValue("male", "en")).toBe("male");
  });
});
