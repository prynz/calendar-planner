import { Redirect, Tabs, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ArrowUp, CalendarDays, Sun, UsersRound } from 'lucide-react-native';

import { FloatingTabBar, useTheme, type FloatingTab } from '@nowish/ui';

import { QuickAddProvider, useQuickAdd } from '@/features/quick-add/QuickAddProvider';
import { useAccount } from '@/providers/account';
import { useSettings, type StartTab } from '@/providers/settings';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

/** Kompass (ADR 0017): three tabs. "Me" lives behind the avatar in each tab's header. */
const ICONS = { index: Sun, calendar: CalendarDays, events: UsersRound } as const;
type TabRoute = keyof typeof ICONS;
const isTabRoute = (name: string): name is TabRoute => name in ICONS;
const START_ROUTES: Record<StartTab, '/' | '/calendar' | '/events'> = {
  today: '/',
  calendar: '/calendar',
  together: '/events',
};

/** The dock with its tabs and the writing field; the field opens the one-line entry (Phase 8 sheet). */
function Dock({ tabs }: { tabs: readonly FloatingTab[] }) {
  const quick = useQuickAdd();
  const { t } = useI18n();
  return (
    <FloatingTabBar
      tabs={tabs}
      composer={{
        label: t('composer.ask'),
        accessibilityLabel: t('composer.a11y'),
        onPress: () => {
          haptic('light');
          quick.open();
        },
        renderIcon: (c) => <ArrowUp color={c} size={20} strokeWidth={2.5} />,
        testID: 'fab-add',
      }}
    />
  );
}

export default function TabsLayout() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const router = useRouter();
  const account = useAccount();
  const { settings, state: settingsState } = useSettings();
  const started = useRef(false);
  const ready = account.state !== 'loading' && account.account.onboarded && settingsState !== 'loading';
  // Start view (Phase 8): once per app start, after settings are loaded.
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    if (settings.startTab !== 'today') router.navigate(START_ROUTES[settings.startTab]);
  }, [ready, router, settings.startTab]);
  const labels: Record<TabRoute, string> = {
    index: t('tabs.today'),
    calendar: t('tabs.calendar'),
    events: t('tabs.together'),
  };

  // First start: onboarding before anything else (no ads, no paywall in the first session).
  if (account.state === 'loading') return null;
  if (!account.account.onboarded) return <Redirect href="/onboarding" />;

  return (
    <QuickAddProvider>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }}
        tabBar={({ state, navigateToTab }) => (
          <Dock
            tabs={state.routes
              .filter((r) => isTabRoute(r.name))
              .map((route) => {
                const name = route.name as TabRoute; // narrowed by the filter above
                const focused = state.routes[state.index]?.key === route.key;
                const Icon = ICONS[name];
                return {
                  key: route.key,
                  label: labels[name],
                  focused,
                  testID: `tab-${name}`,
                  renderIcon: (color: string) => <Icon color={color} size={20} strokeWidth={2.25} />,
                  onPress: () => {
                    if (focused) return;
                    haptic('selection');
                    navigateToTab(route.key);
                  },
                };
              })}
          />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="calendar" />
        <Tabs.Screen name="events" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </QuickAddProvider>
  );
}
