import { Redirect, Tabs, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { CalendarDays, Plus, Sun, UserRound, UsersRound } from 'lucide-react-native';

import { Fab, FloatingTabBar, useTheme } from '@nowish/ui';

import { QuickAddProvider, useQuickAdd } from '@/features/quick-add/QuickAddProvider';
import { useAccount } from '@/providers/account';
import { useSettings, type StartTab } from '@/providers/settings';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

const ICONS = { index: Sun, calendar: CalendarDays, events: UsersRound, settings: UserRound } as const;
type TabRoute = keyof typeof ICONS;
const isTabRoute = (name: string): name is TabRoute => name in ICONS;
const START_ROUTES: Record<StartTab, '/' | '/calendar' | '/events'> = {
  today: '/',
  calendar: '/calendar',
  together: '/events',
};

/** The "+" opens the quick entry sheet (Phase 8); "More details" there leads to the full editor. */
function QuickAddFab({ label }: { label: string }) {
  const quick = useQuickAdd();
  return (
    <Fab
      icon={(c) => <Plus color={c} size={26} strokeWidth={2.5} />}
      onPress={() => quick.open()}
      accessibilityLabel={label}
      testID="fab-add"
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
    settings: t('tabs.settings'),
  };

  // First start: onboarding before anything else (no ads, no paywall in the first session).
  if (account.state === 'loading') return null;
  if (!account.account.onboarded) return <Redirect href="/onboarding" />;

  return (
    <QuickAddProvider>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }}
        tabBar={({ state, navigateToTab }) => (
          <FloatingTabBar
            trailing={<QuickAddFab label={t('fab.add')} />}
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
