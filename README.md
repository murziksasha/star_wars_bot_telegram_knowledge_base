# SW Codex Bot

Telegram-бот — справочник вселенной Звёздных войн. Backend: **Fastify 5 + grammY + TypeScript**, чистая архитектура, деплой на **Vercel**. Данные: [swapi.online](https://swapi.online/). Картинки: [Star Wars Visual Guide](https://starwars-visualguide.com). Язык чата — русский или английский (кнопка **Язык / Language**).

Подробности продукта: папка [`SPEC/`](SPEC/README.md). Архитектура — C4-картинки в [`SPEC/c4/`](SPEC/c4/README.md) и текст в [`SPEC/ARCHITECTURE.md`](SPEC/ARCHITECTURE.md).

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

Zero-config: точка входа `src/index.ts` (см. [Fastify on Vercel](https://vercel.com/docs/frameworks/backend/fastify)). Git auto-deploy выключен в `vercel.json` (`git.deploymentEnabled: false`): выкладка идёт только из GitHub Actions.

### CI/CD

| Событие | Что происходит |
|---|---|
| PR **в** `main` | `npm run typecheck` + `npm test`, затем **preview**-деплой. URL пишется комментарием в PR. Telegram webhook **не** меняется |
| Push / merge **в** `prod` | те же проверки, **production**-деплой, `GET /health`, затем `npm run webhook:set` |

Workflow-файл должен быть на ветке PR (для preview) и на `prod` (иначе `push` в `prod` его не увидит).

**GitHub Actions secrets** (Settings → Secrets and variables → Actions):

| Secret | Откуда |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` после `vercel link` (файл в `.gitignore`) |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |

**Env в проекте Vercel** (Production и Preview): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `PUBLIC_BASE_URL` (только Production, стабильный `https://<app>.vercel.app` без хвоста `/`, не URL конкретного `dpl_…`), `NODE_ENV=production`. Поллинг на Vercel выключается сам (`VERCEL=1`).

После первого production-деплоя заполните `PUBLIC_BASE_URL` и при необходимости перезапустите job `deploy-production`. Ручной вызов на случай сбоя Action:

```bash
# PUBLIC_BASE_URL=https://<your-app>.vercel.app
npm run webhook:set
```

Снять webhook (чтобы снова работал локальный polling):

```bash
npm run webhook:delete
```

Webhook: `POST /telegram/webhook`. Заголовок `X-Telegram-Bot-Api-Secret-Token` должен совпасть с `TELEGRAM_WEBHOOK_SECRET`. Preview-деплой этот URL не переписывает.

Локально привязать проект: `npx vercel link`. Каталог `.vercel/` не коммитить.

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | Fastify + polling |
| `npm test` | Vitest |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke:swapi` | Живые GET к SWAPI |
| `npm run webhook:set` | `setWebhook` |
| `npm run webhook:delete` | `deleteWebhook` |
| `npm run c4:render` | Пересобрать C4 PNG/SVG из `SPEC/c4/*.puml` |
