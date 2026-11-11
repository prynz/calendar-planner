import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { categoryColors, radii, space, type EventCategory } from '../tokens';
import { Text } from './Text';

export interface WeekBarDay {
  key: string;
  /** Short weekday, e.g. "Mo". */
  label: string;
  /** One dot per appointment, coloured by member. */
  dots: readonly EventCategory[];
  /** Spoken summary, e.g. "Monday: 3 appointments, busy day". */
  accessibilityLabel: string;
  full: boolean;
  today: boolean;
}

/**
 * Family week at a glance (family.md FAM-09): one column per day with a dot per appointment in the member's
 * colour. Busy days get the accent fill – the number is always spoken, colour is never the only signal.
 */
export function WeekBars({ days, testID }: { days: readonly WeekBarDay[]; testID?: string }) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={{ flexDirection: 'row', gap: space[1] }}>
      {days.map((d) => (
        <View
          key={d.key}
          accessible
          accessibilityLabel={d.accessibilityLabel}
          style={{
            flex: 1,
            alignItems: 'center',
            gap: space[2],
            paddingVertical: space[3],
            borderRadius: radii.md,
            backgroundColor: d.full ? colors.accentFill : colors.elevated,
            borderWidth: d.today ? 2 : 0,
            borderColor: colors.textPrimary,
          }}
        >
          <Text variant="label" color={d.full ? 'onAccentFill' : 'textSecondary'}>
            {d.label}
          </Text>
          <View style={{ minHeight: space[8], gap: space[1], alignItems: 'center', justifyContent: 'flex-end' }}>
            {d.dots.slice(0, 5).map((c, i) => (
              <View
                key={i}
                style={{
                  width: space[3],
                  height: space[3],
                  borderRadius: radii.pill,
                  backgroundColor: categoryColors[c],
                }}
              />
            ))}
          </View>
          <Text variant="label" color={d.full ? 'onAccentFill' : 'textPrimary'} tabular>
            {String(d.dots.length)}
          </Text>
        </View>
      ))}
    </View>
  );
}
