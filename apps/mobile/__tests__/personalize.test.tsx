import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useTheme } from '@nowish/ui';
import { Text } from 'react-native';

import { PersonalizeScreen } from '@/features/personalize/PersonalizeScreen';
import { createMemorySettingsStore } from '@/storage/memory-settings-store';

import { renderApp } from './test-utils';

function AccentProbe() {
  const { colors, accent } = useTheme();
  return <Text testID="probe">{`${accent} ${colors.accentFill}`}</Text>;
}

describe('PersonalizeScreen', () => {
  it('changes the accent colour everywhere and remembers it', async () => {
    const store = createMemorySettingsStore();
    await renderApp(
      <>
        <PersonalizeScreen />
        <AccentProbe />
      </>,
      { store },
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('lime #C8F031');
    await fireEvent.press(await screen.findByTestId('accent-ocean'));
    expect(screen.getByTestId('probe')).toHaveTextContent('ocean #8EDBEA');
    await waitFor(async () => expect(await store.get('settings.accent')).toBe('ocean'));
  });

  it('reorders and hides the blocks of Today', async () => {
    const store = createMemorySettingsStore();
    await renderApp(<PersonalizeScreen />, { store });
    await fireEvent.press(await screen.findByTestId('home-up-day'));
    await waitFor(async () => expect(await store.get('settings.homeOrder')).toBe('summary,leave,day,helper,week'));
    expect(screen.getByTestId('home-up-summary')).toBeDisabled();
    await fireEvent(screen.getByTestId('home-show-week'), 'valueChange', false);
    await waitFor(async () => expect(await store.get('settings.homeHidden')).toBe('week'));
  });

  it('sets density and start view', async () => {
    const store = createMemorySettingsStore();
    await renderApp(<PersonalizeScreen />, { store });
    await fireEvent.press(await screen.findByTestId('density-compact'));
    await fireEvent.press(screen.getByTestId('start-calendar'));
    await waitFor(async () => expect(await store.get('settings.density')).toBe('compact'));
    expect(await store.get('settings.startTab')).toBe('calendar');
    expect(screen.getByText('Mehr auf einen Blick, gleiche Schriftgröße.')).toBeTruthy();
  });
});
