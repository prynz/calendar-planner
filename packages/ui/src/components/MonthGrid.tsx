import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface MonthCell {
  key: string;
  dayNumber: string;
  inMonth: boolean;
  isToday: boolean;
  /** Up to three category colours – the spoken label carries the count as text. */
  dots: readonly string[];
  accessibilityLabel: string;
}

/** 7-column month grid, Monday first (DACH). Rows are passed in so the caller owns the date maths. */
export function MonthGrid({
  weekdayLabels,
  rows,
  selectedKey,
  onSelect,
}: {
  weekdayLabels: readonly string[];
  rows: readonly (readonly MonthCell[])[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space[1] }}>
      <View
        style={{ flexDirection: 'row' }}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {weekdayLabels.map((w) => (
          <View key={w} style={{ flex: 1, alignItems: 'center', paddingVertical: space[1] }}>
            <Text variant="label" color="textSecondary">
              {w}
            </Text>
          </View>
        ))}
      </View>
      {rows.map((row) => (
        <View key={row[0]?.key ?? 'row'} style={{ flexDirection: 'row' }}>
          {row.map((c) => {
            const selected = c.key === selectedKey;
            return (
              <PressableScale
                key={c.key}
                testID={`month-${c.key}`}
                onPress={() => onSelect(c.key)}
                accessibilityLabel={c.accessibilityLabel}
                accessibilityState={{ selected }}
                pressedScale={0.9}
                style={{ flex: 1, alignItems: 'center', paddingVertical: space[0.5] }}
              >
                <View
                  style={{
                    width: touch.min - space[1],
                    height: touch.min,
                    borderRadius: radii.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: space[0.5],
                    backgroundColor: selected ? colors.tabActiveFill : c.isToday ? colors.elevated : 'transparent',
                  }}
                >
                  <Text
                    variant="label"
                    color={selected ? 'onTabActiveFill' : c.inMonth ? 'textPrimary' : 'textSecondary'}
                    tabular
                  >
                    {c.dayNumber}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: space[0.5], height: space[1] + space[0.5] }}>
                    {c.dots.slice(0, 3).map((d, i) => (
                      <View
                        key={i}
                        style={{
                          width: space[1] + space[0.5],
                          height: space[1] + space[0.5],
                          borderRadius: radii.pill,
                          backgroundColor: selected ? colors.onTabActiveFill : d,
                        }}
                      />
                    ))}
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </View>
      ))}
    </View>
  );
}
