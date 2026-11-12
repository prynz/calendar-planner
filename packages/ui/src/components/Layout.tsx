import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { space } from '../tokens';
import { FLOATING_TAB_BAR_CLEARANCE } from './FloatingTabBar';
import { Text } from './Text';

/** Scrollable screen on the theme canvas, respecting safe areas and the floating tab bar. */
export function Screen({
  children,
  testID,
  withTabBar = true,
  gap = 5,
}: {
  children: ReactNode;
  testID?: string;
  withTabBar?: boolean;
  /** Space between sections; Phase 8 uses 6 (airy) or 4 (compact). */
  gap?: 4 | 5 | 6 | 8;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      testID={testID}
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{
        paddingTop: insets.top + space[4],
        paddingBottom: (withTabBar ? FLOATING_TAB_BAR_CLEARANCE : 0) + insets.bottom + space[4],
        gap: space[gap],
      }}
    >
      {children}
    </ScrollView>
  );
}

/** Horizontal page gutter. */
export function Gutter({ children, gap = 3 }: { children: ReactNode; gap?: 2 | 3 | 4 | 5 }) {
  return <View style={{ paddingHorizontal: space[5], gap: space[gap] }}>{children}</View>;
}

export function ScreenHeader({ eyebrow, title, trailing }: { eyebrow?: string; title: string; trailing?: ReactNode }) {
  return (
    <Gutter gap={2}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] }}>
        <View style={{ flex: 1, gap: space[1] }}>
          {eyebrow ? (
            <Text variant="label" color="textSecondary">
              {eyebrow}
            </Text>
          ) : null}
          <Text variant="titleL" accessibilityRole="header">
            {title}
          </Text>
        </View>
        {trailing}
      </View>
    </Gutter>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="label" color="textSecondary" accessibilityRole="header">
      {children}
    </Text>
  );
}
