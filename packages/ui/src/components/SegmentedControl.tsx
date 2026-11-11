import { Pressable, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  testIDPrefix: string;
}

/** Pill tabs (design-system.md §7 `PillTabs`). Exposed to screen readers as a radio group. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testIDPrefix,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        backgroundColor: colors.elevated,
        borderRadius: radii.pill,
        padding: space[1],
        gap: space[1],
      }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={`${testIDPrefix}-${o.value}`}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            hitSlop={{ top: space[1], bottom: space[1] }}
            style={{
              flex: 1,
              minHeight: touch.min - space[2],
              borderRadius: radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: space[2],
              backgroundColor: selected ? colors.accentFill : 'transparent',
            }}
          >
            {/* One line that shrinks instead of breaking a word ("Gruppe-n") at 200 % text size. */}
            <Text
              variant="label"
              color={selected ? 'onAccentFill' : 'textSecondary'}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
