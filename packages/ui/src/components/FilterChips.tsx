import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  /** Icon or avatar, drawn in the given colour. */
  icon: (color: string) => ReactNode;
}

/**
 * Round icon chips (Phase 8): only the active chip shows its label, so a row of filters stays calm.
 * Each chip still carries its full label for screen readers.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testIDPrefix,
}: {
  options: readonly FilterChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
  testIDPrefix?: string;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={{ gap: space[2], paddingHorizontal: space[5] }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        const fg = selected ? colors.canvas : colors.textPrimary;
        return (
          <Animated.View key={o.value} {...(reduceMotion ? {} : { layout: LinearTransition.springify().damping(18) })}>
            <PressableScale
              onPress={() => onChange(o.value)}
              accessibilityRole="button"
              accessibilityLabel={o.label}
              accessibilityState={{ selected }}
              {...(testIDPrefix ? { testID: `${testIDPrefix}-${o.value}` } : {})}
              style={{
                height: touch.min,
                minWidth: touch.min,
                paddingHorizontal: selected ? space[4] : 0,
                borderRadius: radii.pill,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: space[2],
                borderWidth: 1.5,
                borderColor: selected ? colors.textPrimary : colors.border,
                backgroundColor: selected ? colors.textPrimary : colors.elevated,
              }}
            >
              <View>{o.icon(fg)}</View>
              {selected ? (
                <Text variant="label" color={selected ? 'canvas' : 'textPrimary'} accessibilityElementsHidden>
                  {o.label}
                </Text>
              ) : null}
            </PressableScale>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}
