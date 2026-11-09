import { IntlMessageFormat } from 'intl-messageformat';

import { intlTag, type Locale } from './locale';
import { de, type MessageKey, type Messages } from './messages/de';
import { en } from './messages/en';
import { ensurePluralRules } from './plural-rules';

export const catalogs: Record<Locale, Messages> = { de, en };

export type MessageValues = Record<string, string | number | boolean>;
export type Translate = (key: MessageKey, values?: MessageValues) => string;

/** Creates a cached ICU translator. Missing keys cannot happen at compile time (typed keys). */
export function createTranslator(locale: Locale): Translate {
  ensurePluralRules();
  const cache = new Map<MessageKey, IntlMessageFormat>();
  const catalog = catalogs[locale];
  return (key, values) => {
    let fmt = cache.get(key);
    if (!fmt) {
      fmt = new IntlMessageFormat(catalog[key], intlTag[locale]);
      cache.set(key, fmt);
    }
    // ICU `select` needs strings; booleans are passed as "true"/"false".
    const normalized = values
      ? Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === 'boolean' ? String(v) : v]))
      : undefined;
    const out = fmt.format(normalized);
    if (typeof out !== 'string') throw new Error(`Message "${key}" did not format to a string`);
    return out;
  };
}
