import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { REMINDER_INTENSITIES, REMINDER_TONES, type ReminderIntensity, type ReminderTone } from '@nowish/domain';
import { LANGUAGE_PREFERENCES, type LanguagePreference } from '@nowish/i18n';
import { ACCENT_NAMES, type AccentName } from '@nowish/ui';

import { setHapticsEnabled } from '@/services/haptics';
import type { SettingsStore } from '@/storage/settings-store';

export const THEME_PREFERENCES = ['system', 'dark', 'light'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

/** Phase 8 personalisation (ADR 0016). */
export const DENSITIES = ['airy', 'compact'] as const;
export type Density = (typeof DENSITIES)[number];
export const START_TABS = ['today', 'calendar', 'together'] as const;
export type StartTab = (typeof START_TABS)[number];
/** Building blocks of the Today screen, in the user's order. */
export const HOME_BLOCKS = ['summary', 'leave', 'helper', 'day', 'week'] as const;
export type HomeBlock = (typeof HOME_BLOCKS)[number];
export const WEEK_TILES = ['events', 'free', 'punctual', 'rides', 'open', 'busiest'] as const;
export type WeekTile = (typeof WEEK_TILES)[number];
export const MAX_WEEK_TILES = 3;

export interface Settings {
  language: LanguagePreference;
  theme: ThemePreference;
  reminderIntensity: ReminderIntensity;
  reminderTone: ReminderTone;
  /** Fixed dawdle buffer in minutes (0–30); used until/unless buffer learning has enough data. */
  dawdleBuffer: number;
  /** Learn the buffer from "on my way" taps (anti-chaos-engine.md §1) – switchable, private. */
  bufferLearning: boolean;
  /** Show the private punctuality summary (anti-chaos-engine.md §5). */
  punctualityStats: boolean;
  /** Haptic feedback on taps, swipes and saves (Phase 7: switchable for people who find it irritating). */
  haptics: boolean;
  accent: AccentName;
  density: Density;
  startTab: StartTab;
  /** All blocks in display order; hidden ones stay in the list so their place is remembered. */
  homeOrder: readonly HomeBlock[];
  homeHidden: readonly HomeBlock[];
  weekTiles: readonly WeekTile[];
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'system',
  theme: 'system',
  reminderIntensity: 'normal',
  reminderTone: 'casual',
  dawdleBuffer: 5,
  bufferLearning: true,
  punctualityStats: true,
  haptics: true,
  accent: 'sunrise',
  density: 'airy',
  startTab: 'today',
  homeOrder: HOME_BLOCKS,
  // Kompass: calm first – the day summary and week tiles are opt-in under Personalise.
  homeHidden: ['summary', 'week'],
  weekTiles: ['events', 'free', 'punctual'],
};
export const BUFFER_RANGE = { min: 0, max: 30, step: 5 } as const;

const KEYS: Record<keyof Settings, string> = {
  language: 'settings.language',
  theme: 'settings.theme',
  reminderIntensity: 'settings.reminderIntensity',
  reminderTone: 'settings.reminderTone',
  dawdleBuffer: 'settings.dawdleBuffer',
  bufferLearning: 'settings.bufferLearning',
  punctualityStats: 'settings.punctualityStats',
  haptics: 'settings.haptics',
  accent: 'settings.accent',
  density: 'settings.density',
  startTab: 'settings.startTab',
  homeOrder: 'settings.homeOrder',
  homeHidden: 'settings.homeHidden',
  weekTiles: 'settings.weekTiles',
};

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (v: string | null | undefined): v is T =>
    v != null && (values as readonly string[]).includes(v);
const isLanguage = oneOf(LANGUAGE_PREFERENCES);
const isTheme = oneOf(THEME_PREFERENCES);
const isIntensity = oneOf(REMINDER_INTENSITIES);
const isTone = oneOf(REMINDER_TONES);
const isAccent = oneOf(ACCENT_NAMES);
const isDensity = oneOf(DENSITIES);
const isStartTab = oneOf(START_TABS);

/** Comma-separated list of known values, unknown and duplicate entries dropped. */
function parseList<T extends string>(v: string | null | undefined, values: readonly T[]): T[] | null {
  if (v == null) return null;
  const known = oneOf(values);
  return [...new Set(v.split(',').filter(known))];
}

/** Keeps the stored order and appends blocks added in a later version, so nothing ever disappears. */
function parseHomeOrder(v: string | null | undefined): readonly HomeBlock[] {
  const stored = parseList(v, HOME_BLOCKS) ?? [];
  return [...stored, ...HOME_BLOCKS.filter((b) => !stored.includes(b))];
}
const parseBool = (v: string | null | undefined, fallback: boolean) =>
  v === 'true' ? true : v === 'false' ? false : fallback;

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
    reminderTone: isTone(raw.reminderTone) ? raw.reminderTone : DEFAULT_SETTINGS.reminderTone,
    dawdleBuffer: parseBuffer(raw.dawdleBuffer),
    bufferLearning: parseBool(raw.bufferLearning, DEFAULT_SETTINGS.bufferLearning),
    punctualityStats: parseBool(raw.punctualityStats, DEFAULT_SETTINGS.punctualityStats),
    haptics: parseBool(raw.haptics, DEFAULT_SETTINGS.haptics),
    accent: isAccent(raw.accent) ? raw.accent : DEFAULT_SETTINGS.accent,
    density: isDensity(raw.density) ? raw.density : DEFAULT_SETTINGS.density,
    startTab: isStartTab(raw.startTab) ? raw.startTab : DEFAULT_SETTINGS.startTab,
    homeOrder: parseHomeOrder(raw.homeOrder),
    homeHidden: parseList(raw.homeHidden, HOME_BLOCKS) ?? DEFAULT_SETTINGS.homeHidden,
    weekTiles: (parseList(raw.weekTiles, WEEK_TILES) ?? DEFAULT_SETTINGS.weekTiles).slice(0, MAX_WEEK_TILES),
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

  // haptic() is called from event handlers all over the app; a module flag keeps those call sites simple.
  useEffect(() => {
    setHapticsEnabled(settings.haptics);
  }, [settings.haptics]);

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
