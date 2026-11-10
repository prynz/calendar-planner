import Storage from 'expo-sqlite/kv-store';

/** Key-value persistence for device-local settings (SQLite-backed, docs/architecture/overview.md §4). */
export interface SettingsStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export function createDeviceSettingsStore(): SettingsStore {
  return {
    get: (key) => Storage.getItem(key),
    set: (key, value) => Storage.setItem(key, value),
  };
}
