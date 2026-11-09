import { Tabs } from 'expo-router';
import { PartyPopper, Settings, Sun } from 'lucide-react-native';

import { FloatingTabBar, useTheme } from '@nowish/ui';

import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

const ICONS = { index: Sun, events: PartyPopper, settings: Settings } as const;
type TabRoute = keyof typeof ICONS;
const isTabRoute = (name: string): name is TabRoute => name in ICONS;

export default function TabsLayout() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const labels: Record<TabRoute, string> = {
    index: t('tabs.today'),
    events: t('tabs.events'),
    settings: t('tabs.settings'),
  };

  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }}
      tabBar={({ state, navigateToTab }) => (
        <FloatingTabBar
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
      <Tabs.Screen name="events" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
