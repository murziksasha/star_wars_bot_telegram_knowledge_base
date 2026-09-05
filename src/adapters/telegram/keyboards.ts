import { InlineKeyboard, Keyboard } from "grammy";
import { localizeCatalogItem, relationLabel } from "../i18n/localize.ts";
import type { Locale } from "../i18n/locale.ts";
import { t } from "../i18n/messages.ts";
import type { CatalogItem } from "../../domain/entities/catalog-item.ts";
import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import type { RelationAction } from "../../domain/entities/entity-card.ts";
import { encodeCallback, PAGE_SIZE, type CallbackAction } from "./callback.ts";

export function mainReplyKeyboard(locale: Locale): Keyboard {
  const buttons = t(locale).buttons;
  return new Keyboard()
    .text(buttons.films)
    .text(buttons.characters)
    .row()
    .text(buttons.search)
    .text(buttons.planets)
    .row()
    .text(buttons.species)
    .text(buttons.starships)
    .row()
    .text(buttons.transports)
    .text(buttons.vehicles)
    .row()
    .text(buttons.menu)
    .text(buttons.language)
    .resized()
    .persistent();
}

export function languageKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("Русский", encodeCallback({ type: "set-locale", locale: "ru" }))
    .text("English", encodeCallback({ type: "set-locale", locale: "en" }));
}

function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function slicePage<T>(items: T[], page: number): { slice: T[]; page: number; pages: number } {
  const pages = pageCount(items.length);
  const safePage = Math.min(Math.max(page, 0), pages - 1);
  const start = safePage * PAGE_SIZE;
  return { slice: items.slice(start, start + PAGE_SIZE), page: safePage, pages };
}

function navRow(
  keyboard: InlineKeyboard,
  page: number,
  pages: number,
  pageAction: (page: number) => CallbackAction,
): void {
  if (pages <= 1) return;
  if (page > 0) {
    keyboard.text("«", encodeCallback(pageAction(page - 1)));
  }
  keyboard.text(`${page + 1}/${pages}`, encodeCallback({ type: "noop" }));
  if (page < pages - 1) {
    keyboard.text("»", encodeCallback(pageAction(page + 1)));
  }
  keyboard.row();
}

export function listKeyboard(
  items: CatalogItem[],
  kind: CatalogKind,
  page: number,
  locale: Locale,
): { text: string; keyboard: InlineKeyboard } {
  const localized = items.map((item) => localizeCatalogItem(item, locale));
  const { slice, page: safePage, pages } = slicePage(localized, page);
  const ui = t(locale);
  const keyboard = new InlineKeyboard();
  for (const item of slice) {
    keyboard.text(truncate(item.title, 40), encodeCallback({ type: "entity", kind, id: item.id })).row();
  }
  navRow(keyboard, safePage, pages, (p) => ({ type: "list", kind, page: p }));
  keyboard.text(ui.menu, encodeCallback({ type: "menu" }));
  const heading = `${ui.kindTitles[kind]} (${items.length})`;
  const text = items.length === 0 ? `${heading}\n\n${ui.emptyList}` : heading;
  return { text, keyboard };
}

export function relationsKeyboard(
  items: CatalogItem[],
  fromKind: CatalogKind,
  fromId: number,
  relKind: CatalogKind,
  page: number,
  locale: Locale,
): { text: string; keyboard: InlineKeyboard } {
  const localized = items.map((item) => localizeCatalogItem(item, locale));
  const { slice, page: safePage, pages } = slicePage(localized, page);
  const ui = t(locale);
  const keyboard = new InlineKeyboard();
  for (const item of slice) {
    keyboard
      .text(truncate(item.title, 40), encodeCallback({ type: "entity", kind: relKind, id: item.id }))
      .row();
  }
  navRow(keyboard, safePage, pages, (p) => ({
    type: "relations",
    fromKind,
    fromId,
    relKind,
    page: p,
  }));
  keyboard
    .text(ui.back, encodeCallback({ type: "entity", kind: fromKind, id: fromId }))
    .text(ui.menu, encodeCallback({ type: "menu" }));
  const heading = `${ui.kindTitles[relKind]} (${items.length})`;
  const text = items.length === 0 ? `${heading}\n\n${ui.emptyList}` : heading;
  return { text, keyboard };
}

export function cardKeyboard(relations: RelationAction[], locale: Locale): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const ui = t(locale);
  for (const relation of relations) {
    const label = relationLabel(relation, locale);
    if (relation.mode === "entity") {
      keyboard.text(
        truncate(label, 32),
        encodeCallback({ type: "entity", kind: relation.kind, id: relation.id }),
      );
    } else {
      keyboard.text(
        truncate(label, 32),
        encodeCallback({
          type: "relations",
          fromKind: relation.fromKind,
          fromId: relation.fromId,
          relKind: relation.relKind,
          page: 0,
        }),
      );
    }
    keyboard.row();
  }
  keyboard.text(ui.menu, encodeCallback({ type: "menu" }));
  return keyboard;
}

export function errorKeyboard(retry: CallbackAction | undefined, locale: Locale): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const ui = t(locale);
  if (retry && retry.type !== "retry" && retry.type !== "noop" && retry.type !== "lang" && retry.type !== "set-locale") {
    keyboard.text(ui.retry, encodeCallback({ type: "retry", inner: retry }));
  }
  keyboard.text(ui.menu, encodeCallback({ type: "menu" }));
  return keyboard;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
