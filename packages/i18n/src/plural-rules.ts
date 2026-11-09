/**
 * Hermes (React Native) may ship without `Intl.PluralRules`, which ICU plurals need.
 * Our locales (de, en) share the same cardinal rule: "one" for exactly 1, else "other".
 * This installs a minimal, spec-shaped fallback only when the engine lacks the API.
 */
export function ensurePluralRules(target: { Intl: typeof Intl } = globalThis): boolean {
  if (typeof target.Intl.PluralRules === 'function') return false;

  class MinimalPluralRules {
    private readonly locale: string;
    constructor(locales?: string | readonly string[]) {
      const first = Array.isArray(locales) ? locales[0] : locales;
      this.locale = typeof first === 'string' ? first : 'de';
    }
    select(n: number): Intl.LDMLPluralRule {
      return Math.abs(n) === 1 && Number.isInteger(n) ? 'one' : 'other';
    }
    resolvedOptions() {
      return { locale: this.locale, type: 'cardinal', pluralCategories: ['one', 'other'] };
    }
    static supportedLocalesOf(locales: string | readonly string[]): string[] {
      return (Array.isArray(locales) ? [...locales] : [locales]).filter((l) => /^(de|en)\b/i.test(String(l)));
    }
  }

  // Type assertion: the fallback implements the subset of Intl.PluralRules that intl-messageformat uses.
  (target.Intl as { PluralRules: unknown }).PluralRules = MinimalPluralRules;
  return true;
}
