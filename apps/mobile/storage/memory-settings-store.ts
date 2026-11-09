import type { SettingsStore } from './settings-store';

/** In-memory store for tests and as a fallback. */
export function createMemorySettingsStore(initial: Record<string, string> = {}): SettingsStore {
  const map = new Map(Object.entries(initial));
  return {
    get: async (key) => map.get(key) ?? null,
    set: async (key, value) => {
      map.set(key, value);
    },
  };
}
