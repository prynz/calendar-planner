import { IntlMessageFormat } from 'intl-messageformat';
import { describe, expect, it } from 'vitest';

import {
  catalogs,
  createTranslator,
  de,
  en,
  ensurePluralRules,
  formatTime,
  resolveLocale,
  type MessageKey,
} from '../src';

type AstNode = { type: number; value?: string; options?: Record<string, { value: AstNode[] }>; children?: AstNode[] };

/** Collects ICU argument names (variables) of a message, including nested plural/select branches. */
function argumentNames(message: string): string[] {
  const names = new Set<string>();
  const walk = (nodes: AstNode[]) => {
    for (const n of nodes) {
      if (n.type !== 0 && n.type !== 7 && typeof n.value === 'string') names.add(n.value);
      if (n.options) for (const o of Object.values(n.options)) walk(o.value);
      if (n.children) walk(n.children);
    }
  };
  walk(new IntlMessageFormat(message, 'de').getAst() as unknown as AstNode[]);
  return [...names].sort();
}

const keys = Object.keys(de) as MessageKey[];

describe('catalogs', () => {
  it('en has exactly the de keys (no missing, no extra)', () => {
    expect(Object.keys(en).sort()).toEqual([...keys].sort());
  });

  it.each(keys)('"%s" is valid ICU and uses the same variables in de and en', (key) => {
    expect(argumentNames(en[key])).toEqual(argumentNames(de[key]));
  });

  it('no message is empty', () => {
    for (const locale of ['de', 'en'] as const) {
      for (const key of keys) expect(catalogs[locale][key].trim().length, `${locale}:${key}`).toBeGreaterThan(0);
    }
  });
});

describe('createTranslator', () => {
  it('formats plurals in both languages', () => {
    const tDe = createTranslator('de');
    const tEn = createTranslator('en');
    expect(tDe('today.count', { count: 0 })).toBe('Keine Termine');
    expect(tDe('today.count', { count: 1 })).toBe('1 Termin');
    expect(tDe('today.count', { count: 3 })).toBe('3 Termine');
    expect(tEn('today.count', { count: 1 })).toBe('1 plan');
  });

  it('accepts booleans for select', () => {
    const t = createTranslator('de');
    expect(t('today.title', { isToday: true, weekday: 'Montag' })).toBe('Dein Tag');
    expect(t('today.title', { isToday: false, weekday: 'Montag' })).toBe('Montag');
  });
});

describe('resolveLocale', () => {
  it('prefers the explicit choice', () => {
    expect(resolveLocale('en', ['de-DE'])).toBe('en');
    expect(resolveLocale('de', ['en-US'])).toBe('de');
  });
  it('uses the first supported system language', () => {
    expect(resolveLocale('system', ['fr-FR', 'en-AT', 'de-DE'])).toBe('en');
    expect(resolveLocale('system', ['de_CH'])).toBe('de');
  });
  it('falls back to German', () => {
    expect(resolveLocale('system', ['fr-FR'])).toBe('de');
    expect(resolveLocale('system', [])).toBe('de');
  });
});

describe('ensurePluralRules', () => {
  it('does nothing when the engine has Intl.PluralRules', () => {
    expect(ensurePluralRules()).toBe(false);
  });

  it('installs a de/en fallback when missing (Hermes)', () => {
    const fakeIntl = { ...Intl, PluralRules: undefined } as unknown as typeof Intl;
    const target = { Intl: fakeIntl };
    expect(ensurePluralRules(target)).toBe(true);
    const rules = new target.Intl.PluralRules('de');
    expect(rules.select(1)).toBe('one');
    expect(rules.select(2)).toBe('other');
    expect(rules.select(1.5)).toBe('other');
  });
});

describe('formatTime', () => {
  it('uses the 24-hour clock in both locales', () => {
    const d = new Date(Date.UTC(2026, 10, 9, 18, 5));
    expect(formatTime(d, 'de', 'Europe/Berlin')).toBe('19:05');
    expect(formatTime(d, 'en', 'Europe/Berlin')).toBe('19:05');
  });
});
