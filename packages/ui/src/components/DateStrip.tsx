import { Pressable, ScrollView } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { Text } from './Text';

export interface DateStripDay {
  key: string;
  dayNumber: string;
  weekday: string;
  /** Full spoken label, e.g. "Montag, 9. November, heute". */
  accessibilityLabel: string;
  hasEvents: boolean;
}

export interface DateStripProps {
  days: readonly DateStripDay[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

/** Horizontal day pills (reference R2). */
export function DateStrip({ days, selectedKey, onSelect }: DateStripProps) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
    >
      {days.map((d) => {
        const selected = d.key === selectedKey;
        return (
          <Pressable
            key={d.key}
            testID={`day-${d.key}`}
            onPress={() => onSelect(d.key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={d.accessibilityLabel}
            style={{
              minWidth: touch.cta,
              minHeight: 76,
              paddingVertical: space[3],
              borderRadius: radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              gap: space[1],
              backgroundColor: selected ? colors.accentFill : colors.surface,
            }}
          >
            <Text variant="titleM" color={selected ? 'onAccentFill' : 'textPrimary'} tabular>
              {d.dayNumber}
            </Text>
            <Text variant="label" color={selected ? 'onAccentFill' : 'textSecondary'}>
              {d.weekday}
            </Text>
            <Text variant="label" color={selected ? 'onAccentFill' : 'accentText'} importantForAccessibility="no">
              {d.hasEvents ? '•' : ' '}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
