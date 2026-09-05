import type { Locale } from "./locale.ts";

export class UserLocaleStore {
  private readonly map = new Map<number, Locale>();

  get(userId: number): Locale | undefined {
    return this.map.get(userId);
  }

  set(userId: number, locale: Locale): void {
    this.map.set(userId, locale);
  }
}
