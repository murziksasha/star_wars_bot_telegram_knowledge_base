import type { EntityCard } from "../../domain/entities/entity-card.ts";

export const TELEGRAM_CAPTION_LIMIT = 1024;
export const TELEGRAM_TEXT_LIMIT = 4096;

export type FormattedCard = {
  caption: string;
  extras: string[];
};

function splitChunks(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > limit) {
    let cut = rest.lastIndexOf("\n", limit);
    if (cut < limit * 0.5) cut = rest.lastIndexOf(" ", limit);
    if (cut < 1) cut = limit;
    chunks.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

export function formatEntityCard(card: EntityCard): FormattedCard {
  const lines = [`${card.title}`, ""];
  for (const field of card.fields) {
    if (!field.value) continue;
    const multiline = field.value.includes("\n");
    if (multiline) {
      lines.push(`${field.label}:`, field.value, "");
    } else {
      lines.push(`${field.label}: ${field.value}`);
    }
  }
  const full = lines.join("\n").trim();
  const [caption, ...overflow] = splitChunks(full, TELEGRAM_CAPTION_LIMIT);
  const extras = overflow.flatMap((part) => splitChunks(part, TELEGRAM_TEXT_LIMIT));
  return { caption: caption ?? card.title, extras };
}
