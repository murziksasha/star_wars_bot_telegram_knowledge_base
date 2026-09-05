# Архитектура (C4)

Зависимости только внутрь: `infrastructure → adapters → application → domain`. Domain не знает Fastify, Telegram и `fetch`.

## Context

```mermaid
C4Context
    title SW Codex Bot — System Context
    Person(user, "Пользователь Telegram", "Листает каталог SW")
    System(bot, "SW Codex Bot", "Webhook/polling бот-справочник")
    System_Ext(tg, "Telegram Bot API", "Доставка апдейтов и сообщений")
    System_Ext(swapi, "SWAPI swapi.online", "Факты вселенной")
    System_Ext(vg, "Star Wars Visual Guide", "Постеры и портреты по id")
    System_Ext(vercel, "Vercel", "Хостинг Fastify Function")

    Rel(user, tg, "Команды и кнопки")
    Rel(tg, bot, "Update (webhook или long poll)")
    Rel(bot, tg, "sendMessage / sendPhoto")
    Rel(bot, swapi, "GET /api/...")
    Rel(bot, vg, "HEAD/GET картинки")
    Rel(vercel, bot, "Деплой единственного контейнера")
```

## Container

Один контейнер приложения. Своей БД нет. Поиск — ForceReply, не Redis.

```mermaid
C4Container
    title SW Codex Bot — Containers
    Person(user, "Пользователь Telegram")
    System_Ext(tg, "Telegram Bot API")
    System_Ext(swapi, "SWAPI")
    System_Ext(vg, "Visual Guide")

    Container(app, "SW Codex webhook app", "Fastify 5 + grammY + TypeScript", "Единственный процесс: /health и POST /telegram/webhook")

    Rel(user, tg, "Telegram")
    Rel(tg, app, "HTTPS webhook")
    Rel(app, tg, "Bot API")
    Rel(app, swapi, "JSON GET")
    Rel(app, vg, "Проверка URL картинки")
```

## Components

```mermaid
C4Component
    title SW Codex Bot — Components
    Container_Boundary(app, "SW Codex webhook app") {
        Component(infra, "Infrastructure", "Fastify, config, TTL cache, composition root", "create-app.ts, config.ts, memory-ttl-cache.ts, index.ts")
        Component(tgAdapter, "Telegram adapters", "grammY handlers, keyboards, i18n, webhook plugin", "bot.ts, callback.ts, keyboards.ts, webhook-plugin.ts, adapters/i18n")
        Component(appLayer, "Application", "Use cases + caption formatter", "list-catalog, get-entity, search-characters, list-relations, caption.ts")
        Component(domain, "Domain", "Entities, ports, errors", "CatalogKind, EntityCard, CatalogRepository, ImageResolver")
        Component(swapiAdapter, "SWAPI adapter", "HTTP client, repository, mappers", "swapi-http-client.ts, swapi-catalog-repository.ts, mappers.ts")
        Component(imgAdapter, "Image adapter", "URL Visual Guide + 404 check", "visual-guide-image-resolver.ts")
    }

    Rel(infra, tgAdapter, "регистрирует webhook, стартует polling")
    Rel(infra, swapiAdapter, "собирает граф")
    Rel(infra, imgAdapter, "собирает граф")
    Rel(tgAdapter, appLayer, "парсит update → execute")
    Rel(appLayer, domain, "порты")
    Rel(swapiAdapter, domain, "реализует CatalogRepository")
    Rel(imgAdapter, domain, "реализует ImageResolver")
```

## Компонент → файлы

| Группа | Файлы |
|---|---|
| Infrastructure | `src/infrastructure/http/create-app.ts`, `src/infrastructure/config.ts`, `src/infrastructure/cache/memory-ttl-cache.ts`, `src/index.ts` |
| Telegram adapters | `src/adapters/telegram/*`, `src/adapters/i18n/*` |
| Application | `src/application/use-cases/*`, `src/application/formatters/caption.ts` |
| Domain | `src/domain/entities/*`, `src/domain/ports/*`, `src/domain/errors/*` |
| SWAPI adapter | `src/adapters/swapi/*` |
| Image adapter | `src/adapters/images/visual-guide-image-resolver.ts` |
