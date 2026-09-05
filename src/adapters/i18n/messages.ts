import type { CatalogKind } from "../../domain/entities/catalog-kind.ts";
import type { RelationLabelKey } from "../../domain/entities/entity-card.ts";
import type { Locale } from "./locale.ts";

export type ReplyButtonKey =
  | CatalogKind
  | "search"
  | "menu"
  | "language";

export type MessageTable = {
  greeting: string;
  menuHint: string;
  searchPrompt: string;
  searchEmpty: string;
  unknown: string;
  upstream: string;
  notFound: string;
  emptyList: string;
  retry: string;
  menu: string;
  back: string;
  language: string;
  languagePicker: string;
  languageSet: string;
  buttons: Record<ReplyButtonKey, string>;
  kindTitles: Record<CatalogKind, string>;
  fieldLabels: Record<string, string>;
  relationLabels: Record<RelationLabelKey, string>;
};

const FIELD_LABELS_RU: Record<string, string> = {
  title: "Название",
  name: "Имя",
  episode_id: "Эпизод",
  director: "Режиссёр",
  producer: "Продюсер",
  release_date: "Премьера",
  opening_crawl: "Вступление",
  gender: "Пол",
  birth_year: "Год рождения",
  height: "Рост",
  mass: "Масса",
  hair_color: "Цвет волос",
  skin_color: "Цвет кожи",
  eye_color: "Цвет глаз",
  climate: "Климат",
  terrain: "Ландшафт",
  population: "Население",
  gravity: "Гравитация",
  diameter: "Диаметр",
  rotation_period: "Период вращения",
  orbital_period: "Орбитальный период",
  surface_water: "Поверхностные воды",
  classification: "Классификация",
  designation: "Статус",
  language: "Язык",
  average_height: "Средний рост",
  average_lifespan: "Средняя жизнь",
  hair_colors: "Цвета волос",
  skin_colors: "Цвета кожи",
  eye_colors: "Цвета глаз",
  manufacturer: "Производитель",
  cost_in_credits: "Стоимость (кредиты)",
  length: "Длина",
  max_atmosphering_speed: "Скорость в атмосфере",
  crew: "Экипаж",
  passengers: "Пассажиры",
  cargo_capacity: "Грузоподъёмность",
  consumables: "Припасы",
  hyperdrive_rating: "Гипердвигатель",
  MGLT: "MGLT",
  starship_class: "Класс корабля",
  vehicle_class: "Класс техники",
  model: "Модель",
};

const FIELD_LABELS_EN: Record<string, string> = {
  title: "Title",
  name: "Name",
  episode_id: "Episode",
  director: "Director",
  producer: "Producer",
  release_date: "Release date",
  opening_crawl: "Opening crawl",
  gender: "Gender",
  birth_year: "Birth year",
  height: "Height",
  mass: "Mass",
  hair_color: "Hair color",
  skin_color: "Skin color",
  eye_color: "Eye color",
  climate: "Climate",
  terrain: "Terrain",
  population: "Population",
  gravity: "Gravity",
  diameter: "Diameter",
  rotation_period: "Rotation period",
  orbital_period: "Orbital period",
  surface_water: "Surface water",
  classification: "Classification",
  designation: "Designation",
  language: "Language",
  average_height: "Average height",
  average_lifespan: "Average lifespan",
  hair_colors: "Hair colors",
  skin_colors: "Skin colors",
  eye_colors: "Eye colors",
  manufacturer: "Manufacturer",
  cost_in_credits: "Cost (credits)",
  length: "Length",
  max_atmosphering_speed: "Atmosphere speed",
  crew: "Crew",
  passengers: "Passengers",
  cargo_capacity: "Cargo capacity",
  consumables: "Consumables",
  hyperdrive_rating: "Hyperdrive",
  MGLT: "MGLT",
  starship_class: "Starship class",
  vehicle_class: "Vehicle class",
  model: "Model",
};

const KIND_TITLES_RU: Record<CatalogKind, string> = {
  films: "Фильмы",
  characters: "Персонажи",
  planets: "Планеты",
  species: "Виды",
  starships: "Звёздные корабли",
  transports: "Транспорт",
  vehicles: "Техника",
};

const KIND_TITLES_EN: Record<CatalogKind, string> = {
  films: "Films",
  characters: "Characters",
  planets: "Planets",
  species: "Species",
  starships: "Starships",
  transports: "Transports",
  vehicles: "Vehicles",
};

export const MESSAGES: Record<Locale, MessageTable> = {
  ru: {
    greeting: "Привет! Я справочник вселенной Звёздных войн. Выберите раздел в меню ниже.",
    menuHint: "Выберите раздел:",
    searchPrompt: "Введите имя персонажа для поиска:",
    searchEmpty: "Ничего не найдено. Попробуйте другое имя или откройте меню.",
    unknown: "Не понял команду. Нажмите /start или кнопку «Меню».",
    upstream: "Справочник SWAPI сейчас не отвечает. Попробуйте ещё раз.",
    notFound: "Сущность не найдена.",
    emptyList: "Список пуст.",
    retry: "Повторить",
    menu: "Меню",
    back: "Назад",
    language: "Язык",
    languagePicker: "Выберите язык:",
    languageSet: "Язык: русский.",
    buttons: {
      films: "Фильмы",
      characters: "Персонажи",
      search: "Поиск персонажей",
      planets: "Планеты",
      species: "Виды",
      starships: "Звёздные корабли",
      transports: "Транспорт",
      vehicles: "Техника",
      menu: "Меню",
      language: "Язык",
    },
    kindTitles: KIND_TITLES_RU,
    fieldLabels: FIELD_LABELS_RU,
    relationLabels: {
      ...KIND_TITLES_RU,
      starships: "Корабли",
      homeworld: "Родная планета",
      characterSpecies: "Вид",
    },
  },
  en: {
    greeting: "Hi! I am a Star Wars encyclopedia. Pick a section from the menu below.",
    menuHint: "Choose a section:",
    searchPrompt: "Enter a character name to search:",
    searchEmpty: "Nothing found. Try another name or open the menu.",
    unknown: "I did not understand that. Send /start or tap Menu.",
    upstream: "SWAPI is not responding right now. Please try again.",
    notFound: "Entity not found.",
    emptyList: "The list is empty.",
    retry: "Retry",
    menu: "Menu",
    back: "Back",
    language: "Language",
    languagePicker: "Choose a language:",
    languageSet: "Language: English.",
    buttons: {
      films: "Films",
      characters: "Characters",
      search: "Search characters",
      planets: "Planets",
      species: "Species",
      starships: "Starships",
      transports: "Transports",
      vehicles: "Vehicles",
      menu: "Menu",
      language: "Language",
    },
    kindTitles: KIND_TITLES_EN,
    fieldLabels: FIELD_LABELS_EN,
    relationLabels: {
      ...KIND_TITLES_EN,
      homeworld: "Homeworld",
      characterSpecies: "Species",
    },
  },
};

export function t(locale: Locale): MessageTable {
  return MESSAGES[locale];
}

export const SEARCH_PROMPT_MARKERS: Record<Locale, string> = {
  ru: "имя персонажа для поиска",
  en: "character name to search",
};

const BUTTON_TO_KIND: Record<string, CatalogKind> = {};
const MENU_BUTTONS = new Set<string>();
const SEARCH_BUTTONS = new Set<string>();
const LANGUAGE_BUTTONS = new Set<string>();

for (const locale of ["ru", "en"] as const) {
  const buttons = MESSAGES[locale].buttons;
  for (const kind of [
    "films",
    "characters",
    "planets",
    "species",
    "starships",
    "transports",
    "vehicles",
  ] as const) {
    BUTTON_TO_KIND[buttons[kind]] = kind;
  }
  MENU_BUTTONS.add(buttons.menu);
  SEARCH_BUTTONS.add(buttons.search);
  LANGUAGE_BUTTONS.add(buttons.language);
}

export function replyKindFromText(text: string): CatalogKind | undefined {
  return BUTTON_TO_KIND[text];
}

export function isMenuButton(text: string): boolean {
  return MENU_BUTTONS.has(text);
}

export function isSearchButton(text: string): boolean {
  return SEARCH_BUTTONS.has(text);
}

export function isLanguageButton(text: string): boolean {
  return LANGUAGE_BUTTONS.has(text);
}

export function isSearchPromptMessage(text: string): boolean {
  return Object.values(SEARCH_PROMPT_MARKERS).some((marker) => text.includes(marker));
}
