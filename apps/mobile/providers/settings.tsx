import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { LANGUAGE_PREFERENCES, type LanguagePreference } from '@nowish/i18n';

import type { SettingsStore } from '@/storage/settings-store';

export const THEME_PREFERENCES = ['system', 'dark', 'light'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export interface Settings {
  language: LanguagePreference;
  theme: ThemePreference;
}

export const DEFAULT_SETTINGS: Settings = { language: 'system', theme: 'system' };

const KEYS = { language: 'settings.language', theme: 'settings.theme' } as const;

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (v: string | null): v is T =>
    v !== null && (values as readonly string[]).includes(v);
const isLanguage = oneOf(LANGUAGE_PREFERENCES);
const isTheme = oneOf(THEME_PREFERENCES);

/** Unknown or corrupt stored values fall back to defaults. */
export function parseSettings(raw: { language: string | null; theme: string | null }): Settings {
  return {
    language: isLanguage(raw.language) ? raw.language : DEFAULT_SETTINGS.language,
    theme: isTheme(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
  };
}

export type LoadState = 'loading' | 'ready' | 'load-failed';

interface SettingsContextValue {
  state: LoadState;
  settings: Settings;
  /** Set when the last save failed; the change still applies for this session. */
  saveFailed: boolean;
  setLanguage: (v: LanguagePreference) => void;
  setTheme: (v: ThemePreference) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ store, children }: { store: SettingsStore; children: ReactNode }) {
  const [state, setState] = useState<LoadState>('loading');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([store.get(KEYS.language), store.get(KEYS.theme)])
      .then(([language, theme]) => {
        if (!alive) return;
        setSettings(parseSettings({ language, theme }));
        setState('ready');
      })
      .catch((error: unknown) => {
        if (!alive) return;
        // Defaults keep the app usable; the settings screen shows that saving may not work.
        console.warn('[settings] load failed', error instanceof Error ? error.name : 'unknown');
        setState('load-failed');
      });
    return () => {
      alive = false;
    };
  }, [store]);

  const persist = useCallback(
    (key: string, value: string) => {
      store
        .set(key, value)
        .then(() => setSaveFailed(false))
        .catch((error: unknown) => {
          console.warn('[settings] save failed', error instanceof Error ? error.name : 'unknown');
          setSaveFailed(true);
        });
    },
    [store],
  );

  const setLanguage = useCallback(
    (language: LanguagePreference) => {
      setSettings((s) => ({ ...s, language }));
      persist(KEYS.language, language);
    },
    [persist],
  );
  const setTheme = useCallback(
    (theme: ThemePreference) => {
      setSettings((s) => ({ ...s, theme }));
      persist(KEYS.theme, theme);
    },
    [persist],
  );

  const value = useMemo(
    () => ({ state, settings, saveFailed, setLanguage, setTheme }),
    [state, settings, saveFailed, setLanguage, setTheme],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
