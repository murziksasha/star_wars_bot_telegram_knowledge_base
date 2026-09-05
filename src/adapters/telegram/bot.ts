import { Bot, GrammyError, HttpError, type Context } from "grammy";
import { formatEntityCard } from "../../application/formatters/caption.ts";
import type { GetEntity } from "../../application/use-cases/get-entity.ts";
import type { ListCatalog } from "../../application/use-cases/list-catalog.ts";
import type { ListRelations } from "../../application/use-cases/list-relations.ts";
import type { SearchCharacters } from "../../application/use-cases/search-characters.ts";
import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import { NotFoundError } from "../../domain/errors/not-found-error.ts";
import { UpstreamError } from "../../domain/errors/upstream-error.ts";
import { localizeEntityCard } from "../i18n/localize.ts";
import { detectLocale, type Locale } from "../i18n/locale.ts";
import {
  isLanguageButton,
  isMenuButton,
  isSearchButton,
  isSearchPromptMessage,
  replyKindFromText,
  t,
} from "../i18n/messages.ts";
import { expandCharacterSearchQueries } from "../i18n/search-query.ts";
import { UserLocaleStore } from "../i18n/user-locale-store.ts";
import {
  parseCallbackData,
  type CallbackAction,
} from "./callback.ts";
import {
  cardKeyboard,
  errorKeyboard,
  languageKeyboard,
  listKeyboard,
  mainReplyKeyboard,
  relationsKeyboard,
} from "./keyboards.ts";

export type BotUseCases = {
  listCatalog: ListCatalog;
  getEntity: GetEntity;
  searchCharacters: SearchCharacters;
  listRelations: ListRelations;
};

export function createBot(
  token: string,
  useCases: BotUseCases,
  localeStore: UserLocaleStore = new UserLocaleStore(),
): Bot {
  const bot = new Bot(token);

  function localeOf(ctx: Context): Locale {
    const userId = ctx.from?.id;
    if (userId != null) {
      const saved = localeStore.get(userId);
      if (saved) return saved;
    }
    return detectLocale(ctx.from?.language_code);
  }

  bot.command("start", async (ctx) => {
    const locale = localeOf(ctx);
    await ctx.reply(t(locale).greeting, { reply_markup: mainReplyKeyboard(locale) });
  });

  bot.command("menu", async (ctx) => {
    const locale = localeOf(ctx);
    await ctx.reply(t(locale).menuHint, { reply_markup: mainReplyKeyboard(locale) });
  });

  bot.on("message:text", async (ctx) => {
    const locale = localeOf(ctx);
    const text = ctx.message.text.trim();
    if (text.startsWith("/")) {
      await ctx.reply(t(locale).unknown, { reply_markup: mainReplyKeyboard(locale) });
      return;
    }

    if (isMenuButton(text)) {
      await ctx.reply(t(locale).menuHint, { reply_markup: mainReplyKeyboard(locale) });
      return;
    }

    if (isLanguageButton(text)) {
      await ctx.reply(t(locale).languagePicker, { reply_markup: languageKeyboard() });
      return;
    }

    if (isSearchButton(text)) {
      await ctx.reply(t(locale).searchPrompt, {
        reply_markup: { force_reply: true, selective: true },
      });
      return;
    }

    const kind = replyKindFromText(text);
    if (kind) {
      await showList(ctx, useCases, kind, 0, locale);
      return;
    }

    const replyText = ctx.message.reply_to_message?.text ?? "";
    if (isSearchPromptMessage(replyText)) {
      await showSearch(ctx, useCases, text, locale);
      return;
    }

    await ctx.reply(t(locale).unknown, { reply_markup: mainReplyKeyboard(locale) });
  });

  bot.on("callback_query:data", async (ctx) => {
    const action = parseCallbackData(ctx.callbackQuery.data);
    await ctx.answerCallbackQuery();
    if (!action || action.type === "noop") return;
    await dispatch(ctx, useCases, action, localeStore);
  });

  bot.catch((err) => {
    const error = err.error;
    if (error instanceof GrammyError) {
      console.error("Grammy error", error.description);
    } else if (error instanceof HttpError) {
      console.error("Telegram HTTP error", error);
    } else {
      console.error("Bot error", error);
    }
  });

  return bot;
}

async function dispatch(
  ctx: Context,
  useCases: BotUseCases,
  action: CallbackAction,
  localeStore: UserLocaleStore,
): Promise<void> {
  if (action.type === "set-locale") {
    const userId = ctx.from?.id;
    if (userId != null) localeStore.set(userId, action.locale);
    const locale = action.locale;
    await ctx.reply(t(locale).languageSet, { reply_markup: mainReplyKeyboard(locale) });
    return;
  }

  const locale = resolveLocale(ctx, localeStore);
  const effective = action.type === "retry" ? action.inner : action;
  try {
    switch (effective.type) {
      case "menu":
        await ctx.reply(t(locale).menuHint, { reply_markup: mainReplyKeyboard(locale) });
        return;
      case "lang":
        await ctx.reply(t(locale).languagePicker, { reply_markup: languageKeyboard() });
        return;
      case "search":
        await ctx.reply(t(locale).searchPrompt, {
          reply_markup: { force_reply: true, selective: true },
        });
        return;
      case "list":
        await showList(ctx, useCases, effective.kind, effective.page, locale, true);
        return;
      case "entity":
        await showCard(ctx, useCases, effective.kind, effective.id, locale);
        return;
      case "relations":
        await showRelations(
          ctx,
          useCases,
          effective.fromKind,
          effective.fromId,
          effective.relKind,
          effective.page,
          locale,
        );
        return;
      case "noop":
      case "set-locale":
        return;
    }
  } catch (error) {
    await sendError(ctx, error, locale, effective);
  }
}

function resolveLocale(ctx: Context, localeStore: UserLocaleStore): Locale {
  const userId = ctx.from?.id;
  if (userId != null) {
    const saved = localeStore.get(userId);
    if (saved) return saved;
  }
  return detectLocale(ctx.from?.language_code);
}

async function showList(
  ctx: Context,
  useCases: BotUseCases,
  kind: CatalogKind,
  page: number,
  locale: Locale,
  edit = false,
): Promise<void> {
  try {
    const items = await useCases.listCatalog.execute(kind);
    const view = listKeyboard(items, kind, page, locale);
    if (edit && ctx.callbackQuery) {
      try {
        await ctx.editMessageText(view.text, { reply_markup: view.keyboard });
        return;
      } catch {
        // Photo messages cannot be edited into text lists.
      }
    }
    await ctx.reply(view.text, { reply_markup: view.keyboard });
  } catch (error) {
    await sendError(ctx, error, locale, { type: "list", kind, page });
  }
}

async function showRelations(
  ctx: Context,
  useCases: BotUseCases,
  fromKind: CatalogKind,
  fromId: number,
  relKind: CatalogKind,
  page: number,
  locale: Locale,
): Promise<void> {
  const items = await useCases.listRelations.execute(fromKind, fromId, relKind);
  const view = relationsKeyboard(items, fromKind, fromId, relKind, page, locale);
  if (ctx.callbackQuery) {
    try {
      await ctx.editMessageText(view.text, { reply_markup: view.keyboard });
      return;
    } catch {
      // Fall through to a new message when the source is a photo card.
    }
  }
  await ctx.reply(view.text, { reply_markup: view.keyboard });
}

async function showSearch(
  ctx: Context,
  useCases: BotUseCases,
  query: string,
  locale: Locale,
): Promise<void> {
  try {
    const queries = expandCharacterSearchQueries(query, locale);
    const seen = new Set<number>();
    const items = [];
    for (const q of queries) {
      const hits = await useCases.searchCharacters.execute(q);
      for (const hit of hits) {
        if (seen.has(hit.id)) continue;
        seen.add(hit.id);
        items.push(hit);
      }
    }
    if (items.length === 0) {
      await ctx.reply(t(locale).searchEmpty, { reply_markup: mainReplyKeyboard(locale) });
      return;
    }
    const view = listKeyboard(items, "characters", 0, locale);
    await ctx.reply(view.text, { reply_markup: view.keyboard });
  } catch (error) {
    await sendError(ctx, error, locale, { type: "search" });
  }
}

async function showCard(
  ctx: Context,
  useCases: BotUseCases,
  kind: CatalogKind,
  id: number,
  locale: Locale,
): Promise<void> {
  const card = localizeEntityCard(await useCases.getEntity.execute(kind, id), locale);
  const formatted = formatEntityCard(card);
  const keyboard = cardKeyboard(card.relations, locale);

  if (card.imageUrl) {
    try {
      await ctx.replyWithPhoto(card.imageUrl, {
        caption: formatted.caption,
        reply_markup: keyboard,
      });
    } catch {
      await ctx.reply(formatted.caption, { reply_markup: keyboard });
    }
  } else {
    await ctx.reply(formatted.caption, { reply_markup: keyboard });
  }

  for (const extra of formatted.extras) {
    await ctx.reply(extra);
  }
}

async function sendError(
  ctx: Context,
  error: unknown,
  locale: Locale,
  retry?: CallbackAction,
): Promise<void> {
  const text = error instanceof NotFoundError ? t(locale).notFound : t(locale).upstream;
  if (!(error instanceof NotFoundError) && !(error instanceof UpstreamError)) {
    console.error("Unexpected bot error", error);
  }
  await ctx.reply(text, { reply_markup: errorKeyboard(retry, locale) });
}
