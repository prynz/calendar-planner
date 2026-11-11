import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, withAlpha } from '../tokens';
import { Text } from './Text';

export interface HeatmapCell {
  key: string;
  /** 0 = no data, 1 = later, 2 = partly, 3 = on time. */
  level: 0 | 1 | 2 | 3;
  /** Spoken label (date + meaning) – colour is never the only carrier of information. */
  label: string;
}

const ALPHA = { 0: 0, 1: 0.25, 2: 0.55, 3: 1 } as const;

/** Month heatmap in lime intensities (anti-chaos-engine.md §5). Rows are weeks, `null` pads outside the month. */
export function Heatmap({
  weeks,
  weekdays,
  testID,
}: {
  weeks: readonly (HeatmapCell | null)[][];
  weekdays: readonly string[];
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space[1] }} {...(testID ? { testID } : {})}>
      <View style={{ flexDirection: 'row', gap: space[1] }} importantForAccessibility="no-hide-descendants">
        {weekdays.map((w, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="label" color="textSecondary">
              {w}
            </Text>
          </View>
        ))}
      </View>
      {weeks.map((week, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: space[1] }}>
          {week.map((cell, c) => (
            <View
              key={cell?.key ?? `pad-${r}-${c}`}
              accessible={!!cell}
              {...(cell ? { accessibilityLabel: cell.label } : {})}
              style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: radii.sm,
                backgroundColor: cell
                  ? cell.level === 0
                    ? colors.elevated
                    : withAlpha(colors.accentFill, ALPHA[cell.level])
                  : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
