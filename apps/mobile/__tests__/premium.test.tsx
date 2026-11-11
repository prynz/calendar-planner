import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { buildDemoEvents } from '@nowish/demo';
import { demoPurchase, FREE, trialDaysLeft } from '@nowish/entitlements';
import { createTranslator } from '@nowish/i18n';

import { EditorScreen } from '@/features/editor/EditorScreen';
import { CollabRoute } from '@/features/collab/CollabRoute';
import { EventDetailScreen } from '@/features/detail/EventDetailScreen';
import { GroupsSection } from '@/features/groups/GroupsSection';
import { ReadyCheckScreen } from '@/features/leave/ReadyCheckScreen';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { PaywallScreen } from '@/features/premium/PaywallScreen';
import { PrivacyScreen } from '@/features/privacy/PrivacyScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { planReminders } from '@/features/reminders/plan';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { AccountProvider, DEFAULT_ACCOUNT, onboardedAccount, useAccount, type Account } from '@/providers/account';
import { ClockProvider } from '@/providers/clock';
import { createMemorySettingsStore } from '@/storage/memory-settings-store';

import { NOW, renderApp, routeParams, router } from './test-utils';

const TZ = 'Europe/Berlin';
const press = async (id: string) => fireEvent.press(await screen.findByTestId(id));
const free: Account = { ...onboardedAccount(NOW, TZ), subscription: FREE };
const config = { ok: true as const, config: { backend: 'demo' as const, variant: 'development' as const } };

describe('account storage', () => {
  const setup = async (store = createMemorySettingsStore()) => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AccountProvider store={store} now={() => NOW} timeZone={TZ}>
        {children}
      </AccountProvider>
    );
    const r = await renderHook(() => useAccount(), { wrapper });
    await waitFor(() => expect(r.result.current.state).toBe('ready'));
    return { store, ...r };
  };

  it('starts un-onboarded on Free; onboarding starts the 14-day Plus trial and persists', async () => {
    const { result, store } = await setup();
    expect(result.current.account).toEqual(DEFAULT_ACCOUNT);
    expect(result.current.tier).toBe('free');
    await act(() => result.current.completeOnboarding({ displayName: '  Chris  ' }));
    expect(result.current.tier).toBe('plus');
    expect(result.current.account).toMatchObject({ onboarded: true, ageConfirmed: true, displayName: 'Chris' });
    const stored = JSON.parse((await store.get('account.v1')) ?? '{}') as Record<string, unknown>;
    expect(stored).not.toHaveProperty('birthDate');
    const again = await setup(store);
    expect(again.result.current.account.subscription).toMatchObject({ source: 'trial', tier: 'plus' });
  });

  it('uses the app clock, so a fresh trial reads exactly 14 days', async () => {
    const store = createMemorySettingsStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ClockProvider now={NOW}>
        <AccountProvider store={store} timeZone={TZ}>
          {children}
        </AccountProvider>
      </ClockProvider>
    );
    const { result } = await renderHook(() => useAccount(), { wrapper });
    await waitFor(() => expect(result.current.state).toBe('ready'));
    await act(() => result.current.completeOnboarding({ displayName: '' }));
    expect(trialDaysLeft(result.current.account.subscription, NOW)).toBe(14);
  });

  it('falls back to a fresh start on corrupt data instead of crashing', async () => {
    const { result } = await setup(createMemorySettingsStore({ 'account.v1': '{"onboarded":"yes"}' }));
    expect(result.current.account).toEqual(DEFAULT_ACCOUNT);
  });

  it('demo purchase, cancel (runs to period end) and switching to Free', async () => {
    const { result } = await setup();
    await act(() => result.current.purchase('pro', 'monthly'));
    expect(result.current.tier).toBe('pro');
    await act(() => result.current.cancelPlan());
    expect(result.current.account.subscription).toMatchObject({ cancelled: true });
    expect(result.current.tier).toBe('pro');
    await act(() => result.current.switchToFree());
    expect(result.current.tier).toBe('free');
  });
});

describe('onboarding', () => {
  it('requires the 16+ confirmation, never a birth date, then starts the trial', async () => {
    await renderApp(<OnboardingScreen />, { account: DEFAULT_ACCOUNT });
    await press('onb-next');
    await fireEvent.changeText(await screen.findByTestId('onb-name'), 'Kim');
    await press('onb-next');
    expect(await screen.findByText('Bitte bestätige, dass du mindestens 16 bist.')).toBeTruthy();
    await press('onb-age');
    await press('onb-next');
    await press('onb-next');
    expect(await screen.findByText('14 Tage Plus – geschenkt')).toBeTruthy();
    await press('onb-finish');
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
  });
});

describe('plans', () => {
  it('shows all plans with prices incl. VAT and buys a demo plan without payment data', async () => {
    routeParams.reason = 'ready-check';
    await renderApp(<PaywallScreen />, { account: free });
    expect(await screen.findByTestId('paywall-demo')).toHaveTextContent(/Es wird nichts berechnet/);
    expect(screen.getByTestId('paywall-reason')).toHaveTextContent('Der Bereit-Check gehört zu Plus.');
    expect(screen.getByTestId('plan-plus-price')).toHaveTextContent('24,99 € / Jahr');
    await press('paywall-period-monthly');
    expect(screen.getByTestId('plan-family-price')).toHaveTextContent('6,99 € / Monat');
    expect(screen.getByTestId('paywall-legal')).toHaveTextContent(/inkl\. MwSt/);
    await press('plan-plus-choose');
    expect(await screen.findByTestId('paywall-done')).toHaveTextContent(/Fertig – Plus ist aktiv \(Demo\)\. 🎉/);
  });

  it('settings show the trial and let you try Free; Free shows the plan limits', async () => {
    await renderApp(<SettingsScreen clientConfig={config} appVersion="0.1.0" />);
    expect(await screen.findByTestId('subscription-status')).toHaveTextContent(/Testphase \(Demo\): noch 13 Tage/);
    await press('subscription-free');
    await waitFor(() => expect(screen.getByTestId('subscription-tier')).toHaveTextContent('Dein Tarif: Free'));
    expect(await screen.findByTestId('limit-reminders')).toBeTruthy();
  });

  it('cancelling a demo plan keeps it until the end of the period', async () => {
    const paid = { ...onboardedAccount(NOW, TZ), subscription: demoPurchase('plus', 'yearly', NOW) };
    await renderApp(<SettingsScreen clientConfig={config} appVersion="0.1.0" />, { account: paid });
    expect(await screen.findByTestId('subscription-status')).toHaveTextContent(/verlängert sich am .*9\. November/);
    expect(screen.getByTestId('subscription-cancel')).toBeTruthy();
  });
});

describe('free limits', () => {
  it('on Free the ready check explains Plus instead of opening', async () => {
    await renderApp(<ReadyCheckScreen eventId="demo-games" occurrence={undefined} />, { account: free });
    expect(await screen.findByTestId('limit-ready')).toHaveTextContent(/Der Bereit-Check ist Teil von Plus\./);
  });

  it('Free keeps one group and explains the limit', async () => {
    await renderApp(<GroupsSection />, { account: free });
    expect(await screen.findByTestId('limit-groups')).toHaveTextContent(/In Free ist 1 Gruppe dabei/);
    expect(screen.queryByTestId('groups-create')).toBeNull();
  });

  it('Free plans only the "leave now" reminder', () => {
    const t = createTranslator('de');
    const events = buildDemoEvents(NOW, TZ);
    const base = {
      events,
      journeys: [],
      now: NOW,
      timeZone: TZ,
      intensity: 'firm' as const,
      tone: 'casual' as const,
      bufferMinutes: 5,
      locale: 'de' as const,
      t,
    };
    const all = planReminders({ ...base, stages: 'all' });
    const one = planReminders({ ...base, stages: 'one' });
    expect(new Set(all.map((r) => r.stage)).size).toBeGreaterThan(1);
    expect(new Set(one.map((r) => r.stage))).toEqual(new Set(['leave-now']));
  });

  it('premium covers lead to the plans on Free', async () => {
    await renderApp(<EditorScreen />, { account: free });
    await press('editor-cover-confetti');
    expect(router.push).toHaveBeenCalledWith({ pathname: '/paywall', params: { reason: 'covers' } });
  });
});

describe('house ads', () => {
  it('Free sees one labelled, closable ad – never in the first session or on Plus', async () => {
    await renderApp(<SettingsScreen clientConfig={config} appVersion="0.1.0" />, { account: free });
    expect(await screen.findByTestId('ad-settings_card')).toHaveTextContent(/Anzeige/);
    await press('ad-settings_card-close');
    await waitFor(() => expect(screen.queryByTestId('ad-settings_card')).toBeNull());
  });

  it('no ad on the onboarding day or with Plus', async () => {
    await renderApp(<SettingsScreen clientConfig={config} appVersion="0.1.0" />, {
      account: { ...free, firstDay: '2026-11-09' },
    });
    expect(await screen.findByTestId('subscription')).toBeTruthy();
    expect(screen.queryByTestId('ad-settings_card')).toBeNull();
    await renderApp(<SettingsScreen clientConfig={config} appVersion="0.1.0" />);
    expect(await screen.findByTestId('subscription')).toBeTruthy();
    expect(screen.queryByTestId('ad-settings_card')).toBeNull();
  });
});

describe('costs and plan B', () => {
  it('shows balances and a settle-up list; marking paid waits for the other side', async () => {
    routeParams.id = 'demo-bbq';
    routeParams.section = 'costs';
    await renderApp(<CollabRoute />);
    expect(await screen.findByTestId('costs-total')).toHaveTextContent('Insgesamt 80,49 €');
    const settle = screen.getByTestId('costs-settle');
    expect(settle).toHaveTextContent(/Du → Olivia/);
    await press('transfer-mark-chris-olivia');
    expect(await screen.findByTestId('transfer-pending-chris-olivia')).toHaveTextContent(
      'Wartet auf Bestätigung von Olivia …',
    );
  });

  it('adds an expense split equally (Free) and validates the amount', async () => {
    routeParams.id = 'demo-movie-night';
    routeParams.section = 'costs';
    await renderApp(<CollabRoute />, { account: free });
    expect(await screen.findByTestId('limit-costs')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('expense-title'), 'Popcorn');
    await fireEvent.changeText(screen.getByTestId('expense-amount'), 'abc');
    await press('expense-save');
    expect(await screen.findByTestId('expense-problem')).toHaveTextContent('Bitte gib einen Betrag über 0 ein.');
    await fireEvent.changeText(screen.getByTestId('expense-amount'), '12,50');
    await press('expense-save');
    expect(await screen.findByTestId('costs-total')).toHaveTextContent('Insgesamt 12,50 €');
  });

  it('shows the demo forecast and lets the host switch to plan B', async () => {
    await renderApp(<EventDetailScreen eventId="demo-bbq" occurrence="2026-11-14" />);
    expect(await screen.findByTestId('weather-line')).toHaveTextContent('Regen 🌧️ · 14 °C · Regen 70 %');
    expect(screen.getByTestId('plan-b-suggest')).toBeTruthy();
    expect(screen.queryByTestId('plan-b-toggle')).toBeNull(); // Olivia hosts
    await renderApp(<EventDetailScreen eventId="demo-run" occurrence="2026-11-14" />);
    await press('plan-b-toggle');
    expect(await screen.findByTestId('plan-b-active')).toHaveTextContent('Plan B ist aktiv: Halle Nord');
  });
});

describe('profile and privacy', () => {
  it('validates the PayPal.me name and saves the profile', async () => {
    await renderApp(<ProfileScreen />);
    await fireEvent.changeText(await screen.findByTestId('profile-paypal'), 'chris m');
    expect(await screen.findByText('Nur Buchstaben und Ziffern, höchstens 20 Zeichen.')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('profile-paypal'), 'ChrisM');
    await press('profile-save');
    expect(await screen.findByText('Gespeichert ✓')).toBeTruthy();
  });

  it('lists what is stored and exports everything as JSON', async () => {
    const sharing = jest.requireMock('expo-sharing') as { shareAsync: jest.Mock };
    const fs = jest.requireMock('expo-file-system') as { __files: Map<string, string> };
    await renderApp(<PrivacyScreen />);
    expect(await screen.findByTestId('privacy-stored')).toHaveTextContent(/Familienbereich mit 4 Personen/);
    await press('privacy-export');
    await waitFor(() => expect(sharing.shareAsync).toHaveBeenCalled());
    const [uri] = sharing.shareAsync.mock.calls.at(-1) as [string];
    const data = JSON.parse(fs.__files.get(uri) ?? '{}') as Record<string, unknown>;
    expect(Object.keys(data)).toEqual(
      expect.arrayContaining(['profile', 'events', 'collaboration', 'departureHistory', 'family', 'groups']),
    );
  });
});
