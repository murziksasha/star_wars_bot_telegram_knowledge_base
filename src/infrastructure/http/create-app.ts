import Fastify, { type FastifyInstance } from "fastify";
import type { Bot } from "grammy";
import { VisualGuideImageResolver } from "../../adapters/images/visual-guide-image-resolver.ts";
import { SwapiCatalogRepository } from "../../adapters/swapi/swapi-catalog-repository.ts";
import { SwapiHttpClient } from "../../adapters/swapi/swapi-http-client.ts";
import { UserLocaleStore } from "../../adapters/i18n/user-locale-store.ts";
import { createBot } from "../../adapters/telegram/bot.ts";
import { telegramWebhookPlugin } from "../../adapters/telegram/webhook-plugin.ts";
import { GetEntity } from "../../application/use-cases/get-entity.ts";
import { ListCatalog } from "../../application/use-cases/list-catalog.ts";
import { ListRelations } from "../../application/use-cases/list-relations.ts";
import { SearchCharacters } from "../../application/use-cases/search-characters.ts";
import { MemoryTtlCache } from "../cache/memory-ttl-cache.ts";
import { loadConfig, type AppConfig } from "../config.ts";

export type AppBundle = {
  app: FastifyInstance;
  bot: Bot;
  config: AppConfig;
};

export async function createApp(): Promise<AppBundle> {
  const config = loadConfig();
  const cache = new MemoryTtlCache();
  const http = new SwapiHttpClient(config.swapiBaseUrl, config.swapiTimeoutMs);
  const catalog = new SwapiCatalogRepository(http, cache);
  const images = new VisualGuideImageResolver(cache);

  const listCatalog = new ListCatalog(catalog);
  const getEntity = new GetEntity(catalog, images);
  const searchCharacters = new SearchCharacters(catalog);
  const listRelations = new ListRelations(catalog);

  const bot = createBot(
    config.telegramBotToken,
    {
      listCatalog,
      getEntity,
      searchCharacters,
      listRelations,
    },
    new UserLocaleStore(),
  );

  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ ok: true as const }));

  if (!config.polling) {
    await app.register(telegramWebhookPlugin, {
      bot,
      secretToken: config.telegramWebhookSecret,
    });
  }

  return { app, bot, config };
}
