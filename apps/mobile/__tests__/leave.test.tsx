import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { buildDemoCollabs, buildDemoEvents, buildDemoJourneys, DEMO_TIME_ZONE } from '@nowish/demo';
import { CATEGORY_READY_KEYS, STANDARD_READY_KEYS } from '@nowish/domain';
import { de, en } from '@nowish/i18n';

import { deserializeJourney, serializeJourney } from '@/data/collab-serialization';
import { createMemoryEventRepository } from '@/data/memory-event-repository';
import { EventDetailScreen } from '@/features/detail/EventDetailScreen';
import { FocusScreen } from '@/features/leave/FocusScreen';
import { ReadyCheckScreen } from '@/features/leave/ReadyCheckScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';

import { renderApp } from './test-utils';

/** Monday 9 Nov 2026, 17:00 in Berlin – game night (19:00, leave 18:33) is inside the 3-hour window. */
const EVENING = new Date('2026-11-09T16:00:00Z');

function repoAt(now: Date, withHistory = false) {
  const events = buildDemoEvents(now);
  return createMemoryEventRepository(
    events,
    true,
    buildDemoCollabs(events, now),
    withHistory ? buildDemoJourneys(now, DEMO_TIME_ZONE) : [],
    true,
  );
}

const clientConfig = { ok: true as const, config: { backend: 'demo' as const, variant: 'development' as const } };

describe('ready-check texts', () => {
  it('exist in German and English for every standard and category item', () => {
    const keys = [...STANDARD_READY_KEYS, ...Object.values(CATEGORY_READY_KEYS).flat()].map((k) => `ready.item.${k}`);
    for (const k of keys) {
      expect(Object.keys(de)).toContain(k);
      expect(Object.keys(en)).toContain(k);
    }
  });
});

describe('journey serialization', () => {
  it('round-trips the demo history and rejects corrupt rows', () => {
    const js = buildDemoJourneys(EVENING, DEMO_TIME_ZONE);
    for (const j of js) expect(deserializeJourney(serializeJourney(j))).toEqual(j);
    const raw = JSON.parse(serializeJourney(js[0]!)) as Record<string, unknown>;
    expect(() => deserializeJourney(JSON.stringify({ ...raw, occurrenceKey: 'monday' }))).toThrow();
    expect(() => deserializeJourney(JSON.stringify({ ...raw, leftAt: 'soon' }))).toThrow();
  });
});

describe('leave panel', () => {
  it('records "on my way" and shows how it went', async () => {
    const repo = repoAt(EVENING);
    await renderApp(<EventDetailScreen eventId="demo-games" occurrence="2026-11-09" />, { repo, now: EVENING });
    await fireEvent.press(await screen.findByTestId('leave-on-my-way'));
    expect(await screen.findByTestId('leave-underway')).toHaveTextContent(
      'Unterwegs seit 17:00 · 93 Min. früher als geplant 👏',
    );
    expect((await repo.load()).journeys[0]).toMatchObject({ id: 'demo-games|2026-11-09', leftAt: EVENING });
  });

  it('"running late" tells the others in the chat and queues a kind reply', async () => {
    const repo = repoAt(EVENING);
    await renderApp(<EventDetailScreen eventId="demo-games" occurrence="2026-11-09" />, { repo, now: EVENING });
    await fireEvent.press(await screen.findByTestId('leave-running-late'));
    await fireEvent.press(screen.getByTestId('leave-late-10'));
    expect(await screen.findByTestId('leave-late-noted')).toHaveTextContent(
      'Gesagt: ca. 10 Min. später. Die anderen wissen Bescheid.',
    );
    const saved = await repo.load();
    expect(saved.journeys[0]?.lateMinutes).toBe(10);
    const games = saved.collabs.find((c) => c.eventId === 'demo-games');
    expect(games?.messages.at(-1)).toMatchObject({ type: 'system', note: { kind: 'late', minutes: 10 } });
    expect(games?.pending.some((a) => a.type === 'message')).toBe(true);
  });

  it('opens the delay choice directly from the reminder action', async () => {
    await renderApp(<EventDetailScreen eventId="demo-games" occurrence="2026-11-09" openLate />, {
      repo: repoAt(EVENING),
      now: EVENING,
    });
    expect(await screen.findByTestId('leave-late-5')).toBeTruthy();
  });

  it('hides departure buttons outside the 3-hour window but keeps the ready check', async () => {
    await renderApp(<EventDetailScreen eventId="demo-games" occurrence="2026-11-09" />);
    expect(await screen.findByTestId('leave-ready-check')).toBeTruthy();
    expect(screen.queryByTestId('leave-on-my-way')).toBeNull();
  });
});

describe('ready check', () => {
  it('ticks items in the list and step by step', async () => {
    const repo = repoAt(EVENING);
    await renderApp(<ReadyCheckScreen eventId="demo-games" occurrence="2026-11-09" />, { repo, now: EVENING });
    // own bring-list claim is listed first? Chris has none for game night → category-free standard items
    await fireEvent.press(await screen.findByTestId('ready-std-keys'));
    expect(screen.getByTestId('ready-progress')).toHaveTextContent('1 von 3 dabei');
    await fireEvent.press(screen.getByTestId('ready-mode-steps'));
    await fireEvent.press(screen.getByTestId('ready-got'));
    await fireEvent.press(screen.getByTestId('ready-got'));
    expect(await screen.findByTestId('ready-done')).toBeTruthy();
    expect((await repo.load()).journeys[0]?.checked.sort()).toEqual(['std-keys', 'std-phone', 'std-wallet']);
  });

  it('includes bring-list claims and category items', async () => {
    await renderApp(<ReadyCheckScreen eventId="demo-dentist" occurrence="2026-11-09" />);
    expect(await screen.findByText('Versichertenkarte')).toBeTruthy();
    expect(screen.getByText('Ausweis')).toBeTruthy();
  });

  it('explains when there is no leave plan', async () => {
    await renderApp(<ReadyCheckScreen eventId="demo-tom-bday" occurrence="2026-11-12" />);
    expect(await screen.findByTestId('ready-unavailable')).toBeTruthy();
  });
});

describe('focus mode', () => {
  it('shows only now and up next, and runs the companion timer', async () => {
    await renderApp(<FocusScreen />, { repo: repoAt(EVENING), now: EVENING });
    const nowBox = await screen.findByTestId('focus-now');
    // Phase 8 demo: the hairdresser at 17:45 comes before game night.
    expect(within(nowBox).getByText('Friseur · 17:45')).toBeTruthy();
    expect(screen.getByTestId('focus-next')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('focus-body-double-toggle'));
    expect(screen.getByTestId('focus-timer')).toHaveTextContent(/^Noch (25:00|24:5\d)$/);
  });
});

describe('anti-chaos settings', () => {
  it('learns the buffer from the history and summarises punctuality', async () => {
    await renderApp(<SettingsScreen clientConfig={clientConfig} appVersion="0.1.0" />, {
      repo: repoAt(EVENING, true),
      now: EVENING,
    });
    expect(await screen.findByTestId('buffer-learning-text')).toHaveTextContent(
      'Wir planen 10 Min. Puffer für dich ein – gelernt aus 10 Mal Losgehen. Du kannst das jederzeit ändern.',
    );
    expect(screen.getByTestId('punctuality-summary')).toHaveTextContent(/^Diesen Monat \d+ von \d+ Mal pünktlich 💪$/);
    await fireEvent.press(screen.getByTestId('tone-firm'));
    expect(screen.getByTestId('tone-example')).toHaveTextContent('JETZT los! 🏃');
  });

  it('deletes the history after asking', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _b, buttons) => {
      buttons?.find((b) => b.style === 'destructive')?.onPress?.();
    });
    const repo = repoAt(EVENING, true);
    await renderApp(<SettingsScreen clientConfig={clientConfig} appVersion="0.1.0" />, { repo, now: EVENING });
    await fireEvent.press(await screen.findByTestId('history-delete'));
    await waitFor(async () => expect((await repo.load()).journeys).toHaveLength(0));
    expect(screen.getByTestId('buffer-learning-text')).toHaveTextContent(
      'Noch zu wenig Daten – bis dahin gilt dein fester Puffer.',
    );
  });
});
