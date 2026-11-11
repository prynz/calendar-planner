import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { buildDemoCollabs, buildDemoEvents, buildDemoGroups, buildDemoHousehold } from '@nowish/demo';

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

const routerMock = jest.requireMock('expo-router') as {
  __router: { push: jest.Mock; back: jest.Mock; replace: jest.Mock; setParams: jest.Mock };
  __params: Record<string, string>;
};
export const router = routerMock.__router;
/** Route params the screen under test sees; cleared after each test. */
export const routeParams = routerMock.__params;

export function seededRepo(now: Date = NOW) {
  const events = buildDemoEvents(now);
  // No departure history: plans use the fixed 5-minute buffer unless a test adds journeys.
  return createMemoryEventRepository(events, true, buildDemoCollabs(events, now), [], true, {
    household: buildDemoHousehold(events, now),
    groups: buildDemoGroups(events, now),
  });
}

export async function renderApp(
  ui: ReactElement,
  opts: { store?: SettingsStore; systemLanguageTags?: string[]; repo?: EventRepository; now?: Date } = {},
) {
  const store = opts.store ?? createMemorySettingsStore();
  const now = opts.now ?? NOW;
  const repo = opts.repo ?? seededRepo(now);
  const wrap = (node: ReactElement) => (
    <GestureHandlerRootView>
      <SettingsProvider store={store}>
        <I18nProvider systemLanguageTags={opts.systemLanguageTags ?? ['de-DE']}>
          <AppThemeProvider>
            <ClockProvider now={now}>
              <EventsProvider repository={repo} now={() => now} simulate={false}>
                <RemindersProvider>{node}</RemindersProvider>
              </EventsProvider>
            </ClockProvider>
          </AppThemeProvider>
        </I18nProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
  const result = await render(wrap(ui));
  return { ...result, repo, rerenderApp: (next: ReactElement) => result.rerender(wrap(next)) };
}
