import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { REMINDER_INTENSITIES, type ReminderIntensity } from '@nowish/domain';
import { LANGUAGE_PREFERENCES, type LanguagePreference } from '@nowish/i18n';

import type { SettingsStore } from '@/storage/settings-store';

export const THEME_PREFERENCES = ['system', 'dark', 'light'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export interface Settings {
  language: LanguagePreference;
  theme: ThemePreference;
  reminderIntensity: ReminderIntensity;
  /** Fixed dawdle buffer in minutes (0–30); learning arrives in phase 4. */
  dawdleBuffer: number;
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'system',
  theme: 'system',
  reminderIntensity: 'normal',
  dawdleBuffer: 5,
};
export const BUFFER_RANGE = { min: 0, max: 30, step: 5 } as const;

const KEYS: Record<keyof Settings, string> = {
  language: 'settings.language',
  theme: 'settings.theme',
  reminderIntensity: 'settings.reminderIntensity',
  dawdleBuffer: 'settings.dawdleBuffer',
};

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (v: string | null | undefined): v is T =>
    v != null && (values as readonly string[]).includes(v);
const isLanguage = oneOf(LANGUAGE_PREFERENCES);
const isTheme = oneOf(THEME_PREFERENCES);
const isIntensity = oneOf(REMINDER_INTENSITIES);

function parseBuffer(v: string | null | undefined): number {
  const n = Number(v);
  return v != null && Number.isInteger(n) && n >= BUFFER_RANGE.min && n <= BUFFER_RANGE.max
    ? n
    : DEFAULT_SETTINGS.dawdleBuffer;
}

/** Unknown or corrupt stored values fall back to defaults. */
export function parseSettings(raw: Partial<Record<keyof Settings, string | null>>): Settings {
  return {
    language: isLanguage(raw.language) ? raw.language : DEFAULT_SETTINGS.language,
    theme: isTheme(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
    reminderIntensity: isIntensity(raw.reminderIntensity) ? raw.reminderIntensity : DEFAULT_SETTINGS.reminderIntensity,
    dawdleBuffer: parseBuffer(raw.dawdleBuffer),
  };
}

export type LoadState = 'loading' | 'ready' | 'load-failed';

interface SettingsContextValue {
  state: LoadState;
  settings: Settings;
  /** Set when the last save failed; the change still applies for this session. */
  saveFailed: boolean;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
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
    const keys = Object.keys(KEYS) as (keyof Settings)[];
    Promise.all(keys.map((k) => store.get(KEYS[k])))
      .then((values) => {
        if (!alive) return;
        setSettings(parseSettings(Object.fromEntries(keys.map((k, i) => [k, values[i] ?? null]))));
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

  const set = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((s) => ({ ...s, [key]: value }));
      store
        .set(KEYS[key], String(value))
        .then(() => setSaveFailed(false))
        .catch((error: unknown) => {
          console.warn('[settings] save failed', error instanceof Error ? error.name : 'unknown');
          setSaveFailed(true);
        });
    },
    [store],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      state,
      settings,
      saveFailed,
      set,
      setLanguage: (v) => set('language', v),
      setTheme: (v) => set('theme', v),
    }),
    [state, settings, saveFailed, set],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
