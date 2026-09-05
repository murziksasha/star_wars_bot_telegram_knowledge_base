import type { CatalogItem } from "../../domain/entities/catalog-item.ts";
import type { EntityCard, EntityField, RelationAction } from "../../domain/entities/entity-card.ts";
import { localizeValue } from "./glossary.ts";
import type { Locale } from "./locale.ts";
import { t } from "./messages.ts";
import { lookupTitle } from "./titles.ts";

export function localizeCatalogItem(item: CatalogItem, locale: Locale): CatalogItem {
  return {
    ...item,
    title: lookupTitle(item.kind, item.id, item.title, locale),
  };
}

export function localizeFields(
  fields: EntityField[],
  locale: Locale,
  entityId: number,
): EntityField[] {
  const labels = t(locale).fieldLabels;
  return fields.map((field) => ({
    ...field,
    label: labels[field.key] ?? field.label,
    value: localizeValue(field.value, locale, { fieldKey: field.key, entityId }),
  }));
}

export function relationLabel(action: RelationAction, locale: Locale): string {
  return t(locale).relationLabels[action.labelKey] ?? action.labelKey;
}

export function localizeEntityCard(card: EntityCard, locale: Locale): EntityCard {
  return {
    ...card,
    title: lookupTitle(card.kind, card.id, card.title, locale),
    fields: localizeFields(card.fields, locale, card.id),
  };
}
