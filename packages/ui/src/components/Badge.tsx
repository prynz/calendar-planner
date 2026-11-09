import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space } from '../tokens';
import { Text } from './Text';

export interface BadgeProps {
  label: string;
  /** `demo` marks example data / simulations (ADR 0008). */
  tone?: 'demo' | 'accent' | 'neutral';
  testID?: string;
}

export function Badge({ label, tone = 'neutral', testID }: BadgeProps) {
  const { colors } = useTheme();
  const bg = tone === 'demo' ? colors.secondaryFill : tone === 'accent' ? colors.accentFill : colors.elevated;
  const fg = tone === 'demo' ? 'onSecondaryFill' : tone === 'accent' ? 'onAccentFill' : 'textPrimary';
  return (
    <View
      testID={testID}
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg,
        borderRadius: radii.pill,
        paddingHorizontal: space[3],
        paddingVertical: space[1],
      }}
    >
      <Text variant="label" color={fg}>
        {label}
      </Text>
    </View>
  );
}
