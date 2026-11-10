import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { buildDemoEvents } from '@nowish/demo';

import { createMemoryEventRepository } from '@/data/memory-event-repository';
import type { EventRepository } from '@/data/event-repository';
import { ClockProvider } from '@/providers/clock';
import { EventsProvider } from '@/providers/events';
import { I18nProvider } from '@/providers/i18n';
import { RemindersProvider } from '@/providers/reminders';
import { SettingsProvider } from '@/providers/settings';
import { AppThemeProvider } from '@/providers/theme';
import { createMemorySettingsStore } from '@/storage/memory-settings-store';
import type { SettingsStore } from '@/storage/settings-store';

/** Monday 9 Nov 2026, 08:00 in Berlin. */
export const NOW = new Date('2026-11-09T07:00:00Z');

export const router = (jest.requireMock('expo-router') as { __router: { push: jest.Mock; back: jest.Mock } }).__router;

export function seededRepo(now: Date = NOW) {
  return createMemoryEventRepository(buildDemoEvents(now), true);
}

export async function renderApp(
  ui: ReactElement,
  opts: { store?: SettingsStore; systemLanguageTags?: string[]; repo?: EventRepository; now?: Date } = {},
) {
  const store = opts.store ?? createMemorySettingsStore();
  const now = opts.now ?? NOW;
  const repo = opts.repo ?? seededRepo(now);
  const wrap = (node: ReactElement) => (
    <SettingsProvider store={store}>
      <I18nProvider systemLanguageTags={opts.systemLanguageTags ?? ['de-DE']}>
        <AppThemeProvider>
          <ClockProvider now={now}>
            <EventsProvider repository={repo} now={() => now}>
              <RemindersProvider>{node}</RemindersProvider>
            </EventsProvider>
          </ClockProvider>
        </AppThemeProvider>
      </I18nProvider>
    </SettingsProvider>
  );
  const result = await render(wrap(ui));
  return { ...result, repo, rerenderApp: (next: ReactElement) => result.rerender(wrap(next)) };
}
