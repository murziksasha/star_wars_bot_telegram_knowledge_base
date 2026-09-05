import type { Locale } from "./locale.ts";
import { englishCharacterNamesMatching } from "./titles.ts";

export function expandCharacterSearchQueries(query: string, locale: Locale): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const queries = [trimmed];
  if (locale === "ru") {
    for (const name of englishCharacterNamesMatching(trimmed)) {
      if (!queries.some((entry) => entry.toLowerCase() === name.toLowerCase())) {
        queries.push(name);
      }
    }
  }
  return queries;
}
