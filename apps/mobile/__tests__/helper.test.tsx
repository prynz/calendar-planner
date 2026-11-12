import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';

import { zonedWallTimeToInstant, type CalendarEvent } from '@nowish/domain';

import { createMemoryEventRepository } from '@/data/memory-event-repository';
import { TodayScreen } from '@/features/today/TodayScreen';
import { createMemorySettingsStore } from '@/storage/memory-settings-store';

import { NOW, renderApp } from './test-utils';

const TZ = 'Europe/Berlin';
const DAY = '2026-11-09';
const at = (h: number, m = 0) => zonedWallTimeToInstant(DAY, h, m, TZ);

function appointment(
  id: string,
  title: string,
  from: [number, number],
  to: [number, number],
  extra: Partial<CalendarEvent> = {},
): CalendarEvent {
  return {
    id,
    kind: 'appointment',
    title,
    location: '',
    category: 'health',
    start: at(...from),
    end: at(...to),
    allDay: false,
    timeZone: TZ,
    prepMinutes: 0,
    arrivalMarginMinutes: 0,
    participantIds: ['chris'],
    isDemo: false,
    createdAt: NOW,
    updatedAt: NOW,
    ...extra,
  };
}

/**
 * Dentist until 10:00; the meeting at 10:15 needs 20 min by bike + the learned 10 min buffer (demo journeys)
 * → leave 09:45, 15 min late.
 */
function tightDay() {
  return createMemoryEventRepository(
    [
      appointment('dentist', 'Zahnarzt', [9, 0], [10, 0]),
      appointment('meeting', 'Teammeeting', [10, 15], [11, 0], {
        category: 'work',
        travel: { mode: 'bike', minutes: 20 },
      }),
    ],
    true,
  );
}

describe('helper on Today', () => {
  it('spots the tight transition and moves my own appointment', async () => {
    const { repo } = await renderApp(<TodayScreen />, { repo: tightDay() });
    const card = await screen.findByTestId('helper-card');
    expect(within(card).getByText('Zahnarzt → Teammeeting wird knapp')).toBeTruthy();
    expect(within(card).getByText('15 Minuten zu spät, wenn nichts passiert.')).toBeTruthy();
    // The row is marked too – with text, not colour alone.
    expect(within(screen.getByTestId('event-meeting')).getByText('knapp')).toBeTruthy();

    await fireEvent.press(within(card).getByTestId('helper-shift'));
    expect(await screen.findByText('Teammeeting beginnt jetzt um 10:30.')).toBeTruthy();
    const saved = (await repo.load()).events.find((e) => e.id === 'meeting');
    expect(saved?.start).toEqual(at(10, 30));
    expect(saved?.end).toEqual(at(11, 15));
    expect(screen.queryByTestId('helper-card')).toBeNull();
  });

  it('only offers to ask when the event belongs to someone else (demo), and can be dismissed', async () => {
    const repo = createMemoryEventRepository(
      [
        appointment('dentist', 'Zahnarzt', [9, 0], [10, 0]),
        appointment('lunch', 'Mittagessen', [10, 15], [11, 0], {
          kind: 'social',
          hostId: 'olivia',
          travel: { mode: 'walk', minutes: 20 },
        }),
      ],
      true,
    );
    await renderApp(<TodayScreen />, { repo });
    const card = await screen.findByTestId('helper-card');
    expect(within(card).queryByTestId('helper-shift')).toBeNull();
    await fireEvent.press(within(card).getByTestId('helper-ask'));
    expect(await screen.findByText('Olivia ist gefragt (Demo). Ich sage dir Bescheid.')).toBeTruthy();
  });

  it('stays quiet when the day fits', async () => {
    const repo = createMemoryEventRepository([appointment('a', 'Zahnarzt', [9, 0], [10, 0])], true);
    await renderApp(<TodayScreen />, { repo });
    await screen.findByTestId('event-a');
    expect(screen.queryByTestId('helper-card')).toBeNull();
  });

  it('shows free time between plans with a way to plan it', async () => {
    const repo = createMemoryEventRepository([appointment('a', 'Zahnarzt', [9, 0], [10, 0])], true);
    await renderApp(<TodayScreen />, { repo });
    // 08:00 (now) → 09:00, then 10:00 → 22:00.
    expect(await screen.findByTestId('gap-0800')).toBeTruthy();
    expect(within(screen.getByTestId('gap-1000')).getByText('12 Std. frei')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('gap-plan-1000'));
    expect(await screen.findByTestId('quick-sheet')).toBeTruthy();
  });
});

describe('quick entry', () => {
  it('adds a plan from one line', async () => {
    const repo = createMemoryEventRepository([], true);
    await renderApp(<TodayScreen />, { repo });
    await fireEvent.press(await screen.findByTestId('today-add'));
    await fireEvent.press(await screen.findByTestId('quick-example-1'));
    expect(screen.getByLabelText('Wann: Freitag, 13. November, 19:00')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('quick-save'));
    await waitFor(async () => expect((await repo.load()).events).toHaveLength(1));
    const [e] = (await repo.load()).events;
    expect(e?.title).toBe('Grillen');
    expect(e?.location).toBe('bei Tom');
    expect(e?.start).toEqual(zonedWallTimeToInstant('2026-11-13', 19, 0, TZ));
  });

  it('asks for a title instead of saving an empty plan', async () => {
    const repo = createMemoryEventRepository([], true);
    await renderApp(<TodayScreen />, { repo });
    await fireEvent.press(await screen.findByTestId('today-add'));
    await fireEvent.changeText(await screen.findByTestId('quick-input'), 'morgen 9 Uhr');
    await fireEvent.press(screen.getByTestId('quick-save'));
    expect(await screen.findByText('Was soll es sein? Schreib mindestens einen Titel.')).toBeTruthy();
    expect((await repo.load()).events).toHaveLength(0);
  });
});

describe('Today personalisation', () => {
  it('follows the stored block order and hides blocks', async () => {
    const store = createMemorySettingsStore();
    await store.set('settings.homeOrder', 'week,day');
    await store.set('settings.homeHidden', 'summary,helper');
    await renderApp(<TodayScreen />, { store });
    await screen.findByTestId('home-week');
    const ids = screen.getAllByTestId(/^home-/).map((n) => n.props.testID as string);
    expect(ids).toEqual(['home-week', 'home-day', 'home-leave']);
  });

  it('lets me pick up to three week tiles', async () => {
    const store = createMemorySettingsStore();
    await renderApp(<TodayScreen />, { store });
    expect(await screen.findByTestId('week-tile-events')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('week-customize'));
    // Full: a fourth tile cannot be added.
    await fireEvent.press(await screen.findByTestId('week-option-rides'));
    expect(screen.queryByTestId('week-tile-rides')).toBeNull();
    await fireEvent.press(screen.getByTestId('week-option-free'));
    await fireEvent.press(screen.getByTestId('week-option-rides'));
    expect(screen.getByTestId('week-tile-rides')).toBeTruthy();
    expect(screen.queryByTestId('week-tile-free')).toBeNull();
    await waitFor(async () => expect(await store.get('settings.weekTiles')).toBe('events,punctual,rides'));
  });
});

describe('ticking off and moving (Phase 9)', () => {
  it('ticks a plan off, remembers it, and undoes it', async () => {
    const store = createMemorySettingsStore();
    const repo = createMemoryEventRepository([appointment('a', 'Zahnarzt', [9, 0], [10, 0])], true);
    await renderApp(<TodayScreen />, { repo, store });
    await fireEvent.press(await screen.findByTestId('done-a'));
    expect(screen.getByTestId('done-a')).toBeChecked();
    expect(screen.getByLabelText('Zahnarzt wieder offen setzen')).toBeTruthy();
    await waitFor(async () => expect(await store.get('today.done')).toBe('a@2026-11-09'));
    await fireEvent.press(screen.getByTestId('done-a'));
    expect(screen.getByTestId('done-a')).not.toBeChecked();
    await waitFor(async () => expect(await store.get('today.done')).toBe(''));
  });

  it('offers the same actions to screen readers as the swipe', async () => {
    const repo = createMemoryEventRepository([appointment('a', 'Zahnarzt', [9, 0], [10, 0])], true);
    await renderApp(<TodayScreen />, { repo });
    const row = await screen.findByTestId('swipe-a');
    expect(row.props.accessibilityActions.map((a: { label: string }) => a.label)).toEqual(['Erledigt', 'Später']);
    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'right' } });
    expect(screen.getByTestId('done-a')).toBeChecked();
    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'left' } });
    expect(await screen.findByTestId('later-sheet')).toBeTruthy();
  });

  it('moves my own plan by an hour', async () => {
    const repo = createMemoryEventRepository([appointment('a', 'Zahnarzt', [9, 0], [10, 0])], true);
    await renderApp(<TodayScreen />, { repo });
    await fireEvent(await screen.findByTestId('swipe-a'), 'accessibilityAction', {
      nativeEvent: { actionName: 'left' },
    });
    await fireEvent.press(await screen.findByTestId('later-by60'));
    await waitFor(async () => expect((await repo.load()).events[0]?.start).toEqual(at(10, 0)));
    expect((await repo.load()).events[0]?.end).toEqual(at(11, 0));
  });

  it('does not move someone else’s event, but opens it', async () => {
    const repo = createMemoryEventRepository(
      [appointment('x', 'Brunch', [11, 0], [12, 0], { kind: 'social', hostId: 'olivia' })],
      true,
    );
    await renderApp(<TodayScreen />, { repo });
    await fireEvent(await screen.findByTestId('swipe-x'), 'accessibilityAction', {
      nativeEvent: { actionName: 'left' },
    });
    expect(
      await screen.findByText('Olivia plant diesen Termin. Öffne ihn, um zu antworten oder zu fragen.'),
    ).toBeTruthy();
    expect(screen.queryByTestId('later-by15')).toBeNull();
    expect(screen.getByTestId('later-open')).toBeTruthy();
  });
});
