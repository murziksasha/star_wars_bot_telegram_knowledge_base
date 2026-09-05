# Правила продукта

## Данные

- Источник истины — только `GET` к [swapi.online](https://swapi.online/). Запись, правка и локальная БД запрещены.
- Кэш — in-memory TTL: списки и поиск 5 минут, карточки и проверка картинок 15 минут. На serverless кэш живёт в тёплом инстансе; холодный старт просто перезапрашивает SWAPI.
- У `starships` и `vehicles` нет поля `name`. Карточка и заголовок списка = merge с `transports` того же `id`.
- Картинок в SWAPI нет. URL Visual Guide строится по `id`. 404 → карточка без фото. Для `transports` сначала `starships/{id}.jpg`, иначе `vehicles/{id}.jpg`.

## Telegram

- Язык интерфейса и карточек — `ru` или `en` на пользователя. Идентификаторы в коде — английские. Кэш SWAPI всегда на английском; перевод применяется при отправке в Telegram.
- Выбор языка: сохранённый `user id` в in-memory Map процесса; иначе `language_code` Telegram (`ru*` → `ru`, иначе `en`); если `from` нет — `ru`. Это не каталожная БД: после холодного старта снова берётся язык Telegram.
- `callback_data` ≤ 64 байт. Схема: `m`, `s`, `n`, `g`, `g:ru`, `g:en`, `l:{kind}:{page}`, `e:{kind}:{id}`, `r:{fromKind}:{fromId}:{relKind}:{page}`, `x:{inner}` (повтор).
- Коды kind: `f|c|p|s|ss|t|v`.
- Подпись фото ≤ 1024 символов, текстовое сообщение ≤ 4096. Обрезка по границе строки/слова.
- Поиск не хранит сессию в Redis: только Force Reply. Serverless-инстансы память не шарят.
- Локально — long polling (`bot.start()`). На Vercel — webhook `POST /telegram/webhook`.
- Заголовок `X-Telegram-Bot-Api-Secret-Token` сверяется с `TELEGRAM_WEBHOOK_SECRET`.

## Инфраструктура

- Таймаут SWAPI — 8 секунд (запас до лимита Vercel Hobby).
- `GET /health` → `{ "ok": true }`.
- Токен бота и webhook secret не логировать и не коммитить (`.env` в `.gitignore`).
- Переменные: `TELEGRAM_BOT_TOKEN` или `BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `PUBLIC_BASE_URL`, `SWAPI_BASE_URL`, `NODE_ENV`, `PORT`.
