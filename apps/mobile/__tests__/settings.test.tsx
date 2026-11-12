import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { parseSettings } from '@/providers/settings';
import { resolveTheme } from '@/providers/theme';
import { createMemorySettingsStore } from '@/storage/memory-settings-store';
import type { SettingsStore } from '@/storage/settings-store';

import { renderApp } from './test-utils';

const demoConfig = { ok: true as const, config: { variant: 'preview' as const, backend: 'demo' as const } };

describe('settings model', () => {
  it('falls back to defaults for unknown values', () => {
    expect(parseSettings({ language: 'fr', theme: null })).toEqual({
      language: 'system',
      theme: 'system',
      reminderIntensity: 'normal',
      reminderTone: 'casual',
      dawdleBuffer: 5,
      bufferLearning: true,
      punctualityStats: true,
      haptics: true,
      accent: 'lime',
      density: 'airy',
      startTab: 'today',
      homeOrder: ['summary', 'leave', 'helper', 'day', 'week'],
      homeHidden: [],
      weekTiles: ['events', 'free', 'punctual'],
    });
    expect(
      parseSettings({
        language: 'en',
        theme: 'light',
        reminderIntensity: 'firm',
        reminderTone: 'soft',
        dawdleBuffer: '15',
        bufferLearning: 'false',
        punctualityStats: 'nonsense',
        haptics: 'false',
        accent: 'ocean',
        density: 'compact',
        startTab: 'calendar',
        homeOrder: 'day,nonsense,leave,day',
        homeHidden: 'week,bogus',
        weekTiles: 'rides,open,focus,events',
      }),
    ).toEqual({
      language: 'en',
      theme: 'light',
      reminderIntensity: 'firm',
      reminderTone: 'soft',
      dawdleBuffer: 15,
      bufferLearning: false,
      punctualityStats: true,
      haptics: false,
      accent: 'ocean',
      density: 'compact',
      startTab: 'calendar',
      // Stored order first, unknown/duplicates dropped, missing blocks appended.
      homeOrder: ['day', 'leave', 'summary', 'helper', 'week'],
      homeHidden: ['week'],
      weekTiles: ['rides', 'open', 'focus'],
    });
    expect(parseSettings({ dawdleBuffer: '999' }).dawdleBuffer).toBe(5);
  });

  it('dark is the default for the system theme unless the OS is light', () => {
    expect(resolveTheme('system', null)).toBe('dark');
    expect(resolveTheme('system', 'light')).toBe('light');
    expect(resolveTheme('dark', 'light')).toBe('dark');
  });
});

describe('SettingsScreen', () => {
  it('turns haptic feedback off and on, and remembers it', async () => {
    const store = createMemorySettingsStore();
    await renderApp(<SettingsScreen clientConfig={demoConfig} appVersion="0.1.0" />, { store });
    await fireEvent(await screen.findByTestId('haptics-toggle'), 'valueChange', false);
    await waitFor(async () => expect(await store.get('settings.haptics')).toBe('false'));
    const selection = jest.mocked(Haptics.selectionAsync);
    selection.mockClear();
    await fireEvent.press(screen.getByTestId('theme-light'));
    expect(selection).not.toHaveBeenCalled();
    const impact = jest.mocked(Haptics.impactAsync);
    impact.mockClear();
    await fireEvent(screen.getByTestId('haptics-toggle'), 'valueChange', true);
    expect(impact).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByTestId('theme-dark'));
    expect(selection).toHaveBeenCalledTimes(1);
    await waitFor(async () => expect(await store.get('settings.haptics')).toBe('true'));
  });

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
