import { Tabs, useRouter } from 'expo-router';
import { CalendarDays, Plus, Sun, UserRound, UsersRound } from 'lucide-react-native';

import { Fab, FloatingTabBar, useTheme } from '@nowish/ui';

import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

const ICONS = { index: Sun, calendar: CalendarDays, events: UsersRound, settings: UserRound } as const;
type TabRoute = keyof typeof ICONS;
const isTabRoute = (name: string): name is TabRoute => name in ICONS;

export default function TabsLayout() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const router = useRouter();
  const labels: Record<TabRoute, string> = {
    index: t('tabs.today'),
    calendar: t('tabs.calendar'),
    events: t('tabs.together'),
    settings: t('tabs.settings'),
  };

  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }}
      tabBar={({ state, navigateToTab }) => (
        <FloatingTabBar
          trailing={
            <Fab
              icon={(c) => <Plus color={c} size={26} strokeWidth={2.5} />}
              onPress={() => {
                haptic('light');
                router.push('/editor');
              }}
              accessibilityLabel={t('fab.add')}
              testID="fab-add"
            />
          }
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
  );
}
