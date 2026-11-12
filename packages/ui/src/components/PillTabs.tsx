import { ScrollView, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface PillTab<T extends string> {
  value: T;
  label: string;
  /** Small count, e.g. unread messages. */
  badge?: number;
}

/**
 * Pill tabs (Phase 8): split a long page into short parts (Plan · People · Chat · Costs).
 * Scrolls sideways when the labels are long or the text is large.
 */
export function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  accessibilityLabel,
  testIDPrefix,
}: {
  tabs: readonly PillTab<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
  testIDPrefix?: string;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={{ gap: space[2], paddingHorizontal: space[5] }}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        const label = tab.badge ? `${tab.label}, ${tab.badge}` : tab.label;
        return (
          <PressableScale
            key={tab.value}
            onPress={() => onChange(tab.value)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            {...(testIDPrefix ? { testID: `${testIDPrefix}-${tab.value}` } : {})}
            style={{
              minHeight: touch.min,
              paddingHorizontal: space[5],
              borderRadius: radii.pill,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[2],
              borderWidth: 1.5,
              borderColor: selected ? colors.textPrimary : colors.border,
              backgroundColor: selected ? colors.textPrimary : colors.elevated,
            }}
          >
            <Text variant="label" color={selected ? 'canvas' : 'textPrimary'}>
              {tab.label}
            </Text>
            {tab.badge ? (
              <View
                style={{
                  minWidth: space[5],
                  height: space[5],
                  paddingHorizontal: space[1],
                  borderRadius: radii.pill,
                  backgroundColor: colors.accentFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="label" color="onAccentFill" maxFontSizeMultiplier={1.3}>
                  {String(tab.badge)}
                </Text>
              </View>
            ) : null}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
