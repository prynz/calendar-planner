import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { parseSettings } from '@/providers/settings';
import { resolveTheme } from '@/providers/theme';
import { createMemorySettingsStore } from '@/storage/memory-settings-store';
import type { SettingsStore } from '@/storage/settings-store';

import { renderApp } from './test-utils';

const demoConfig = { ok: true as const, config: { variant: 'preview' as const, backend: 'demo' as const } };

describe('settings model', () => {
  it('falls back to defaults for unknown values', () => {
    expect(parseSettings({ language: 'fr', theme: null })).toEqual({ language: 'system', theme: 'system' });
    expect(parseSettings({ language: 'en', theme: 'light' })).toEqual({ language: 'en', theme: 'light' });
  });

  it('dark is the default for the system theme unless the OS is light', () => {
    expect(resolveTheme('system', null)).toBe('dark');
    expect(resolveTheme('system', 'light')).toBe('light');
    expect(resolveTheme('dark', 'light')).toBe('dark');
  });
});

describe('SettingsScreen', () => {
  it('switches the language immediately and persists it', async () => {
    const store = createMemorySettingsStore();
    await renderApp(<SettingsScreen clientConfig={demoConfig} appVersion="0.1.0" />, { store });
    expect(await screen.findByText('Einstellungen')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('language-en'));
    expect(await screen.findByText('Settings')).toBeTruthy();
    await waitFor(async () => expect(await store.get('settings.language')).toBe('en'));
  });

  it('restores stored settings on start', async () => {
    await renderApp(<SettingsScreen clientConfig={demoConfig} appVersion="0.1.0" />, {
      store: createMemorySettingsStore({ 'settings.language': 'en', 'settings.theme': 'light' }),
    });
    expect(await screen.findByText('Settings')).toBeTruthy();
    expect(screen.getByTestId('theme-light').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('tells the user when saving fails but keeps the choice', async () => {
    const failing: SettingsStore = { get: async () => null, set: () => Promise.reject(new Error('disk full')) };
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await renderApp(<SettingsScreen clientConfig={demoConfig} appVersion="0.1.0" />, { store: failing });
    await fireEvent.press(await screen.findByTestId('theme-light'));
    expect(await screen.findByTestId('settings-save-error')).toBeTruthy();
    expect(screen.getByTestId('theme-light').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('shows demo mode and invalid configuration honestly', async () => {
    const { rerenderApp } = await renderApp(<SettingsScreen clientConfig={demoConfig} appVersion="0.1.0" />);
    expect(await screen.findByText(/Demo-Modus mit Beispieldaten/)).toBeTruthy();
    await rerenderApp(
      <SettingsScreen clientConfig={{ ok: false, reason: 'SUPABASE_URL: invalid' }} appVersion="0.1.0" />,
    );
    expect(await screen.findByText(/Konfiguration ungültig: SUPABASE_URL: invalid/)).toBeTruthy();
  });
});
