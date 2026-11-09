import { fireEvent, screen } from '@testing-library/react-native';

import { addDays } from '@nowish/domain';

import { EventsScreen } from '@/features/events/EventsScreen';
import { TodayScreen } from '@/features/today/TodayScreen';

import { renderApp } from './test-utils';

describe('TodayScreen', () => {
  it('shows the demo label, banner and today’s three plans', async () => {
    await renderApp(<TodayScreen />);
    expect(await screen.findByText('Dein Tag')).toBeTruthy();
    expect(screen.getByTestId('demo-badge')).toBeTruthy();
    expect(screen.getByTestId('demo-banner')).toBeTruthy();
    expect(screen.getByTestId('today-count')).toHaveTextContent('3 Termine');
    expect(screen.getByText('Zahnarzt')).toBeTruthy();
    expect(screen.getByText('Spieleabend bei Olivia')).toBeTruthy();
  });

  it('switches day via the date strip and offers a way back to today', async () => {
    await renderApp(<TodayScreen />);
    await fireEvent.press(await screen.findByTestId(`day-${addDays('2026-11-09', 4)}`));
    expect(screen.getByTestId('today-empty')).toBeTruthy();
    expect(screen.getByText('Nichts geplant')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('back-to-today'));
    expect(screen.getByText('Dein Tag')).toBeTruthy();
  });

  it('follows the system language when set to "system"', async () => {
    await renderApp(<TodayScreen />, { systemLanguageTags: ['en-AT'] });
    expect(await screen.findByText('Your day')).toBeTruthy();
    expect(screen.getByText('Dentist')).toBeTruthy();
  });
});

describe('EventsScreen', () => {
  it('lists upcoming social events with RSVP summary, but not past ones', async () => {
    await renderApp(<EventsScreen />);
    expect(await screen.findByText('Grillabend am See')).toBeTruthy();
    expect(screen.getByTestId('rsvp-demo-games')).toHaveTextContent('4 dabei · 1 vielleicht · 0 offen');
    expect(screen.queryByText('Kino mit Mia')).toBeNull();
    expect(screen.queryByText('Zahnarzt')).toBeNull();
  });
});
