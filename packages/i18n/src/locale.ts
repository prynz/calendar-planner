export const LOCALES = ['de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

export const LANGUAGE_PREFERENCES = ['system', 'de', 'en'] as const;
export type LanguagePreference = (typeof LANGUAGE_PREFERENCES)[number];

export const isLocale = (v: unknown): v is Locale =>
  typeof v === 'string' && (LOCALES as readonly string[]).includes(v);

/**
 * Picks the UI locale. An explicit preference wins; "system" uses the first supported system
 * language (e.g. "en-AT" → en); otherwise German (DACH launch market).
 */
export function resolveLocale(preference: LanguagePreference, systemLanguageTags: readonly string[]): Locale {
  if (preference !== 'system') return preference;
  for (const tag of systemLanguageTags) {
    const lang = tag.toLowerCase().split(/[-_]/)[0];
    if (isLocale(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}

/** BCP-47 tag used for Intl formatting (DACH defaults: 24 h, Monday first). */
export const intlTag: Record<Locale, string> = { de: 'de-DE', en: 'en-GB' };
