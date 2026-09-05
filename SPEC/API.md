# Контракт SWAPI и картинок

База: `https://swapi.online` (переопределяется `SWAPI_BASE_URL`). Списки приходят **целиком**, без `page`/`next`. Пагинация только в Telegram.

## Kind → endpoints

| Kind | Список | По id | Поиск |
|---|---|---|---|
| films | `GET /api/films` | `GET /api/films/{id}` | нет |
| characters | `GET /api/characters` | `GET /api/characters/{id}` | `GET /api/people?search={name}` (дубль `/api/characters?search=`) |
| planets | `GET /api/planets` | `GET /api/planets/{id}` | нет |
| species | `GET /api/species` | `GET /api/species/{id}` | нет |
| starships | `GET /api/starships` | `GET /api/starships/{id}` | нет |
| transports | `GET /api/transports` | `GET /api/transports/{id}` | нет |
| vehicles | `GET /api/vehicles` | `GET /api/vehicles/{id}` | нет |

## Join-правила

- **Starship card** = `transports/{id}` + `starships/{id}`. Имя — из transport.
- **Vehicle card** = `transports/{id}` + `vehicles/{id}`.
- **Transport card** = transport, плюс starship- или vehicle-поля, если id существует в одном из каталогов.

## Junction (связи)

Документированные пути swapi.online:

| Путь | Смысл |
|---|---|
| `/api/characters/:id/films` | Фильмы персонажа |
| `/api/films/:id/characters` | Персонажи фильма |
| `/api/films/:id/planets` | Планеты фильма |
| `/api/films/:id/species` | Виды фильма |
| `/api/films/:id/starships` | Корабли фильма |
| `/api/films/:id/vehicles` | Техника фильма |
| `/api/planets/:id/characters` | Жители (homeworld) |
| `/api/planets/:id/films` | Фильмы с планетой |
| `/api/species/:id/characters` | Представители вида |
| `/api/starships/:id/characters` | Пилоты |
| `/api/vehicles/:id/characters` | Водители |

Дополнительно на карточке персонажа: `homeworld` → планета, `species_id` → вид.

Для списков starships/vehicles заголовки обогащаются именами из `/api/transports` (junction часто отдаёт `starship_class` вместо имени).

## Поля карточек

- **Film:** episode_id, director, producer, release_date, opening_crawl
- **Character:** gender, birth_year, height, mass, hair_color, skin_color, eye_color
- **Planet:** climate, terrain, population, gravity, diameter, rotation_period, orbital_period, surface_water
- **Species:** classification, designation, language, average_height, average_lifespan, hair_colors, skin_colors, eye_colors
- **Starship:** manufacturer, cost, length, speed, crew, passengers, cargo, consumables, hyperdrive, MGLT, class
- **Vehicle:** те же общие ТТХ + vehicle_class

## Картинки

```
https://starwars-visualguide.com/assets/img/{characters|films|planets|species|starships|vehicles}/{id}.jpg
```

Проверка: HEAD, при необходимости GET. 404 кэшируется как miss.
