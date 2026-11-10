import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { addDays } from '@nowish/domain';

import { createMemoryEventRepository } from '@/data/memory-event-repository';
import { CalendarScreen } from '@/features/calendar/CalendarScreen';
import { EventDetailScreen } from '@/features/detail/EventDetailScreen';
import { EditorScreen } from '@/features/editor/EditorScreen';
import { EventsScreen } from '@/features/events/EventsScreen';
import { TodayScreen } from '@/features/today/TodayScreen';

import { renderApp, router } from './test-utils';

beforeEach(() => {
  router.push.mockClear();
  router.back.mockClear();
});

describe('TodayScreen', () => {
  it('shows the leave hero, demo label and today’s plans', async () => {
    await renderApp(<TodayScreen />);
    expect(await screen.findByText('Dein Tag')).toBeTruthy();
    expect(screen.getByTestId('demo-badge')).toBeTruthy();
    expect(screen.getByTestId('leave-hero')).toBeTruthy();
    expect(screen.getByText('08:00 los')).toBeTruthy();
    expect(screen.getByTestId('today-count')).toHaveTextContent('3 Termine');
    expect(screen.getByText('→ los um 18:33')).toBeTruthy();
  });

  it('opens the detail of a tapped plan', async () => {
    await renderApp(<TodayScreen />);
    await fireEvent.press(await screen.findByTestId('event-demo-games'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/event/[id]',
      params: { id: 'demo-games', occurrence: '2026-11-09' },
    });
  });

  it('offers to add a plan on a free day', async () => {
    await renderApp(<TodayScreen />);
    await fireEvent.press(await screen.findByTestId(`day-${addDays('2026-11-09', 4)}`));
    expect(screen.getByTestId('today-empty')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('today-add'));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/editor', params: { day: '2026-11-13' } });
  });

  it('follows the system language', async () => {
    await renderApp(<TodayScreen />, { systemLanguageTags: ['en-AT'] });
    expect(await screen.findByText('Your day')).toBeTruthy();
    expect(screen.getByText('Go at 08:00')).toBeTruthy();
  });
});

describe('CalendarScreen', () => {
  it('shows the month grid and the selected day, then switches views', async () => {
    await renderApp(<CalendarScreen />);
    expect(await screen.findByText('November 2026')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('month-2026-11-10'));
    expect(screen.getByText('Fußballtraining')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('cal-next'));
    expect(screen.getByText('Dezember 2026')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('cal-view-week'));
    expect(screen.getByTestId('cal-label')).toHaveTextContent('9. Nov. – 15. Nov.');
    await fireEvent.press(screen.getByTestId('cal-view-list'));
    expect(screen.getAllByText('Fußballtraining').length).toBeGreaterThanOrEqual(4); // weekly series over 30 days
  });
});

describe('EditorScreen', () => {
  it('validates, previews the leave time and saves a new plan', async () => {
    const { repo } = await renderApp(<EditorScreen initialDay="2026-11-12" />, {
      repo: createMemoryEventRepository([], true),
    });
    await fireEvent.press(await screen.findByTestId('editor-save'));
    expect(await screen.findByText('Bitte gib einen Titel ein.')).toBeTruthy();
    expect(router.back).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId('editor-title'), 'Bewerbungsgespräch');
    await fireEvent.press(screen.getByTestId('editor-travel-transit'));
    await fireEvent.press(screen.getByTestId('editor-travel-min-inc')); // 15 → 20
    expect(screen.getByTestId('editor-preview')).toHaveTextContent('Du musst um 08:35 los.'); // 09:00 − 20 min transit − 5 min buffer
    await fireEvent.press(screen.getByTestId('editor-repeat-weekly'));
    await fireEvent.press(screen.getByTestId('editor-save'));
    await waitFor(() => expect(router.back).toHaveBeenCalled());
    const saved = (await repo.load()).events[0];
    expect(saved).toMatchObject({
      title: 'Bewerbungsgespräch',
      travel: { mode: 'transit', minutes: 20 },
      recurrence: { freq: 'weekly', byWeekday: [3] },
    });
  });

  it('asks before discarding changes', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderApp(<EditorScreen />, { repo: createMemoryEventRepository([], true) });
    await fireEvent.changeText(await screen.findByTestId('editor-title'), 'Etwas');
    await fireEvent.press(screen.getByTestId('editor-cancel'));
    expect(alert).toHaveBeenCalledWith('Änderungen verwerfen?', expect.any(String), expect.any(Array));
    expect(router.back).not.toHaveBeenCalled();
  });
});

describe('EventDetailScreen', () => {
  it('shows the backwards plan and scheduled reminders', async () => {
    await renderApp(<EventDetailScreen eventId="demo-games" occurrence="2026-11-09" />);
    const plan = await screen.findByTestId('detail-plan');
    expect(within(plan).getByText('18:03')).toBeTruthy(); // get ready = 18:33 − 30 min prep
    expect(within(plan).getByText('18:33')).toBeTruthy();
    expect(within(plan).getByText('Jetzt los')).toBeTruthy();
    expect(await screen.findByText('3 Erinnerungen auf diesem Gerät geplant')).toBeTruthy();
  });

  it('deletes a single occurrence of a series', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_t, _b, buttons) => {
      buttons?.find((b) => b.text === 'Nur diesen Termin')?.onPress?.();
    });
    const { repo } = await renderApp(<EventDetailScreen eventId="demo-football" occurrence="2026-11-10" />);
    await fireEvent.press(await screen.findByTestId('detail-delete'));
    expect(alert).toHaveBeenCalled();
    await waitFor(async () =>
      expect((await repo.load()).events.find((e) => e.id === 'demo-football')?.recurrence?.exdates).toEqual([
        '2026-11-10',
      ]),
    );
    expect(router.back).toHaveBeenCalled();
  });

  it('handles a missing event', async () => {
    await renderApp(<EventDetailScreen eventId="nope" occurrence={undefined} />);
    expect(await screen.findByTestId('detail-not-found')).toBeTruthy();
  });
});

describe('EventsScreen', () => {
  it('lists upcoming social events with RSVP summary, but not past ones', async () => {
    await renderApp(<EventsScreen />);
    expect(await screen.findByText('Grillabend am See')).toBeTruthy();
    expect(screen.getByTestId('rsvp-demo-games')).toHaveTextContent('Zugesagt · 3 dabei · 1 vielleicht · 0 offen');
    // Tom's party waits for an answer → listed under open invitations; the movie night is hosted by the viewer.
    expect(within(screen.getByTestId('events-invitations')).getByText('Geburtstagsfeier von Tom')).toBeTruthy();
    expect(screen.getByTestId('rsvp-demo-movie-night')).toHaveTextContent(/^Du lädst ein · /);
    expect(screen.queryByText('Kino mit Mia')).toBeNull();
    expect(screen.queryByText('Zahnarzt')).toBeNull();
  });
});
