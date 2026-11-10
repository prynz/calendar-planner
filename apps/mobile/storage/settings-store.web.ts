/** Web preview only: settings in localStorage (devices use SQLite, see settings-store.ts). */
export interface SettingsStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export function createDeviceSettingsStore(): SettingsStore {
  return {
    get: async (key) => globalThis.localStorage.getItem(key),
    set: async (key, value) => {
      globalThis.localStorage.setItem(key, value);
    },
  };
}
