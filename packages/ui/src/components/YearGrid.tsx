import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { cardShadow, radii, space, withAlpha } from '../tokens';
import { HEAT_ALPHA, type HeatLevel } from './MonthGrid';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface YearMonth {
  key: string;
  /** "Nov" */
  label: string;
  /** Weeks of the month, Monday first; `null` pads days outside the month. */
  weeks: readonly (readonly (HeatLevel | null)[])[];
  isCurrent: boolean;
  /** "November 2026, 23 Termine" – the tiny heat cells are decoration. */
  accessibilityLabel: string;
}

/** Year level of the zoom calendar (Phase 12): twelve mini months as heat maps, three per row. */
export function YearGrid({ months, onSelect }: { months: readonly YearMonth[]; onSelect: (key: string) => void }) {
  const { colors, name } = useTheme();
  const rows = [0, 3, 6, 9].map((i) => months.slice(i, i + 3));
  return (
    <View style={{ gap: space[2] }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: space[2] }}>
          {row.map((m) => (
            <PressableScale
              key={m.key}
              testID={`year-${m.key}`}
              onPress={() => onSelect(m.key)}
              accessibilityRole="button"
              accessibilityLabel={m.accessibilityLabel}
              pressedScale={0.95}
              style={{
                flex: 1,
                backgroundColor: colors.elevated,
                borderRadius: radii.md,
                padding: space[2],
                gap: space[1],
                ...cardShadow(name),
                ...(m.isCurrent ? { borderWidth: 2, borderColor: colors.accentFill } : {}),
              }}
            >
              <Text variant="label" maxFontSizeMultiplier={1.3}>
                {m.label}
              </Text>
              <View style={{ gap: space[0.5] }} importantForAccessibility="no-hide-descendants">
                {m.weeks.map((week, w) => (
                  <View key={w} style={{ flexDirection: 'row', gap: space[0.5] }}>
                    {week.map((level, d) => (
                      <View
                        key={d}
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          borderRadius: space[0.5],
                          backgroundColor:
                            level === null
                              ? 'transparent'
                              : level === 0
                                ? colors.surface
                                : withAlpha(colors.secondaryFill, HEAT_ALPHA[level]),
                        }}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </PressableScale>
          ))}
        </View>
      ))}
    </View>
  );
}
