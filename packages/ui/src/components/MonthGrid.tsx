import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch, withAlpha } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface MonthCell {
  key: string;
  dayNumber: string;
  inMonth: boolean;
  isToday: boolean;
  /** Up to three category colours – the spoken label carries the count as text. */
  dots: readonly string[];
  /** Zoom calendar (Phase 12): how full the day is, 0 = free … 4 = packed. With it the cell is a heat tile. */
  load?: HeatLevel;
  accessibilityLabel: string;
}

export type HeatLevel = 0 | 1 | 2 | 3 | 4;
/** Share of the calm colour per heat level; the spoken label always carries the count. */
export const HEAT_ALPHA = { 0: 0, 1: 0.14, 2: 0.3, 3: 0.55, 4: 1 } as const;

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
            const heat = c.load !== undefined && c.inMonth;
            const fill = selected
              ? colors.tabActiveFill
              : heat && c.load
                ? withAlpha(colors.secondaryFill, HEAT_ALPHA[c.load])
                : heat || c.isToday
                  ? colors.elevated
                  : 'transparent';
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
                    backgroundColor: fill,
                    ...(c.isToday ? { borderWidth: 2, borderColor: colors.accentFill } : {}),
                  }}
                >
                  <Text
                    variant="label"
                    color={
                      selected
                        ? 'onTabActiveFill'
                        : heat && c.load === 4
                          ? 'onSecondaryFill'
                          : c.inMonth
                            ? 'textPrimary'
                            : 'textSecondary'
                    }
                    tabular
                  >
                    {c.dayNumber}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: space[0.5], height: heat ? 0 : space[1] + space[0.5] }}>
                    {(heat ? [] : c.dots.slice(0, 3)).map((d, i) => (
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
