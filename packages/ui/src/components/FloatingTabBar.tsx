import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { cardShadow, radii, space, touch } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface FloatingTab {
  key: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  renderIcon: (color: string) => ReactNode;
  testID: string;
}

export interface DockComposer {
  /** Placeholder shown in the field, e.g. "What's coming up?". */
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  renderIcon: (color: string) => ReactNode;
  testID: string;
}

/**
 * The Kompass dock (ADR 0017): three icon tabs and one writing field instead of a "+" button. The active tab is
 * an ink square; tab labels stay available to screen readers. The field opens the one-line entry.
 */
export function FloatingTabBar({ tabs, composer }: { tabs: readonly FloatingTab[]; composer?: DockComposer }) {
  const { colors, name } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        start: space[4],
        end: space[4],
        bottom: Math.max(insets.bottom, space[3]),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[1],
          backgroundColor: colors.tabBar,
          borderRadius: radii.lg,
          padding: space[1] + space[0.5],
          ...cardShadow(name),
        }}
      >
        <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: space[1] }}>
          {tabs.map((tab) => (
            <PressableScale
              key={tab.key}
              testID={tab.testID}
              onPress={tab.onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab.focused }}
              accessibilityLabel={tab.label}
              pressedScale={0.92}
              style={{
                width: touch.min,
                height: touch.min,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radii.md,
                backgroundColor: tab.focused ? colors.tabActiveFill : 'transparent',
              }}
            >
              {tab.renderIcon(tab.focused ? colors.onTabActiveFill : colors.tabInactiveText)}
            </PressableScale>
          ))}
        </View>
        {composer ? (
          <PressableScale
            testID={composer.testID}
            onPress={composer.onPress}
            accessibilityRole="button"
            accessibilityLabel={composer.accessibilityLabel}
            pressedScale={0.98}
            style={{
              flex: 1,
              minHeight: touch.min,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: space[2],
              borderRadius: radii.md,
              backgroundColor: colors.surface,
              paddingStart: space[3],
              paddingEnd: space[1] + space[0.5],
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="bodyM" color="textSecondary" numberOfLines={1} maxFontSizeMultiplier={1.3}>
                {composer.label}
              </Text>
            </View>
            <View
              style={{
                width: space[8] + space[1],
                height: space[8] + space[1],
                borderRadius: radii.sm,
                backgroundColor: colors.accentFill,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {composer.renderIcon(colors.onAccentFill)}
            </View>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

/** Bottom padding screens need so content is not hidden behind the dock. */
export const FLOATING_TAB_BAR_CLEARANCE = touch.min + space[3] + space[6];
