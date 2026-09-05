export const LOCALES = ["ru", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return value === "ru" || value === "en";
}

export function detectLocale(languageCode: string | undefined): Locale {
  if (!languageCode) return "ru";
  const base = languageCode.toLowerCase().split("-")[0];
  return base === "ru" ? "ru" : "en";
}
