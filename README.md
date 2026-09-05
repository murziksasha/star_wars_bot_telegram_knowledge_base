# SW Codex Bot

Telegram-бот — справочник вселенной Звёздных войн. Backend: **Fastify 5 + grammY + TypeScript**, чистая архитектура, деплой на **Vercel**. Данные: [swapi.online](https://swapi.online/). Картинки: [Star Wars Visual Guide](https://starwars-visualguide.com). Язык чата — русский или английский (кнопка **Язык / Language**).

Подробности продукта: папка [`SPEC/`](SPEC/README.md).

## Требования

- Node.js 20+
- Токен бота от [@BotFather](https://t.me/BotFather)

## Локальный запуск (polling)

```bash
copy .env.example .env
# заполните TELEGRAM_BOT_TOKEN или BOT_TOKEN
npm install
npm test
npm run dev
```

Сервер поднимает `GET /health` и начинает long polling. Маршрут webhook в этом режиме не регистрируется: grammY не позволяет одновременно polling и `webhookCallback`. Для локальной проверки webhook задайте `ENABLE_POLLING=false` и пробросьте HTTPS (например, ngrok).

Проверка контракта SWAPI:

```bash
npm run smoke:swapi
```

## Переменные окружения

| Имя | Назначение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен бота. Допускается алиас `BOT_TOKEN` |
| `TELEGRAM_WEBHOOK_SECRET` | Secret token webhook (обязателен на проде) |
| `PUBLIC_BASE_URL` | HTTPS-origin Vercel без хвоста `/` |
| `SWAPI_BASE_URL` | По умолчанию `https://swapi.online` |
| `NODE_ENV` | `development` / `production` |
| `PORT` | Порт Fastify, по умолчанию `3000` |
| `ENABLE_POLLING` | `true`/`false`, иначе polling выключен на Vercel и в `production` |

## Деплой на Vercel

Zero-config: точка входа `src/index.ts` (см. [Fastify on Vercel](https://vercel.com/docs/frameworks/backend/fastify)).

1. Залейте репозиторий и добавьте env в проекте Vercel.
2. После деплоя:

```bash
# PUBLIC_BASE_URL=https://<your-app>.vercel.app
npm run webhook:set
```

Снять webhook (чтобы снова работал локальный polling):

```bash
npm run webhook:delete
```

Webhook: `POST /telegram/webhook`. Заголовок `X-Telegram-Bot-Api-Secret-Token` должен совпасть с `TELEGRAM_WEBHOOK_SECRET`.

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | Fastify + polling |
| `npm test` | Vitest |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke:swapi` | Живые GET к SWAPI |
| `npm run webhook:set` | `setWebhook` |
| `npm run webhook:delete` | `deleteWebhook` |
