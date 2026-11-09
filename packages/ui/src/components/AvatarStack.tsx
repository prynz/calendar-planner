import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space } from '../tokens';
import { Text } from './Text';

export interface AvatarStackProps {
  /** Display names; initials are derived. */
  names: readonly string[];
  max?: number;
  /** Accessible summary, e.g. "Mia, Tom und 3 weitere". */
  accessibilityLabel: string;
}

const SIZE = 32;

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function AvatarStack({ names, max = 3, accessibilityLabel }: AvatarStackProps) {
  const { colors } = useTheme();
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const circle = {
    width: SIZE,
    height: SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  } as const;
  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row' }}>
      {shown.map((n, i) => (
        <View
          key={`${n}-${i}`}
          style={[circle, { backgroundColor: colors.elevated, marginStart: i === 0 ? 0 : -space[2] }]}
        >
          <Text variant="label" color="textPrimary">
            {initialsOf(n)}
          </Text>
        </View>
      ))}
      {rest > 0 ? (
        <View style={[circle, { backgroundColor: colors.accentFill, marginStart: -space[2] }]}>
          <Text variant="label" color="onAccentFill">{`+${rest}`}</Text>
        </View>
      ) : null}
    </View>
  );
}
