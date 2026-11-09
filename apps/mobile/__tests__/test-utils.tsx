import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ClockProvider } from '@/providers/clock';
import { DemoWorldProvider } from '@/providers/demo-world';
import { I18nProvider } from '@/providers/i18n';
import { SettingsProvider } from '@/providers/settings';
import { AppThemeProvider } from '@/providers/theme';
import { createMemorySettingsStore } from '@/storage/memory-settings-store';
import type { SettingsStore } from '@/storage/settings-store';

/** Monday 9 Nov 2026, 08:00 in Berlin. */
export const NOW = new Date('2026-11-09T07:00:00Z');

export async function renderApp(ui: ReactElement, opts: { store?: SettingsStore; systemLanguageTags?: string[] } = {}) {
  const store = opts.store ?? createMemorySettingsStore();
  const wrap = (node: ReactElement) => (
    <SettingsProvider store={store}>
      <I18nProvider systemLanguageTags={opts.systemLanguageTags ?? ['de-DE']}>
        <AppThemeProvider>
          <ClockProvider now={NOW}>
            <DemoWorldProvider>{node}</DemoWorldProvider>
          </ClockProvider>
        </AppThemeProvider>
      </I18nProvider>
    </SettingsProvider>
  );
  const result = await render(wrap(ui));
  return { ...result, rerenderApp: (next: ReactElement) => result.rerender(wrap(next)) };
}
