import { getLocales } from 'expo-localization';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { createTranslator, resolveLocale, type Locale, type Translate } from '@nowish/i18n';

import { useSettings } from './settings';

interface I18nValue {
  locale: Locale;
  t: Translate;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Resolves the UI language from the user's choice (or the system languages) and provides `t`. */
export function I18nProvider({
  children,
  systemLanguageTags,
}: {
  children: ReactNode;
  systemLanguageTags?: readonly string[];
}) {
  const { settings } = useSettings();
  const locale = resolveLocale(settings.language, systemLanguageTags ?? getLocales().map((l) => l.languageTag));
  const value = useMemo(() => ({ locale, t: createTranslator(locale) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
