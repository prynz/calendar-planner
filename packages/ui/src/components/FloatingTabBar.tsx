import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { Text } from './Text';

export interface FloatingTab {
  key: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  renderIcon: (color: string) => ReactNode;
  testID: string;
}

/** Floating pill tab bar (reference R3). Always shows labels – icons are never the only information. */
export function FloatingTabBar({ tabs }: { tabs: readonly FloatingTab[] }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        start: 0,
        end: 0,
        bottom: Math.max(insets.bottom, space[3]),
        alignItems: 'center',
      }}
    >
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: 'row',
          backgroundColor: colors.tabBar,
          borderRadius: radii.pill,
          padding: space[1],
          gap: space[1],
        }}
      >
        {tabs.map((tab) => {
          const fg = tab.focused ? colors.onTabActiveFill : colors.tabInactiveText;
          return (
            <Pressable
              key={tab.key}
              testID={tab.testID}
              onPress={tab.onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab.focused }}
              accessibilityLabel={tab.label}
              style={{
                minHeight: touch.cta,
                minWidth: touch.cta,
                paddingHorizontal: space[4],
                borderRadius: radii.pill,
                flexDirection: 'row',
                alignItems: 'center',
                gap: space[2],
                backgroundColor: tab.focused ? colors.tabActiveFill : 'transparent',
              }}
            >
              {tab.renderIcon(fg)}
              <Text variant="label" color={tab.focused ? 'onTabActiveFill' : 'tabInactiveText'}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Bottom padding screens need so content is not hidden behind the floating bar. */
export const FLOATING_TAB_BAR_CLEARANCE = touch.cta + space[1] * 2 + space[6];
