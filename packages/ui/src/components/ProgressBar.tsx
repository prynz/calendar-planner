import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, withAlpha } from '../tokens';
import { useSpringTo } from './FadeIn';

/**
 * Springing progress bar. Purely visual – the caller always shows the same value as text too
 * (colour/length is never the only carrier of information).
 */
export function ProgressBar({ value, testID }: { value: number; testID?: string }) {
  const { colors } = useTheme();
  const p = useSpringTo(Math.min(1, Math.max(0, value)));
  const bar = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  return (
    <View
      {...(testID ? { testID } : {})}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        height: space[2],
        borderRadius: radii.pill,
        backgroundColor: withAlpha(colors.textSecondary, 0.2),
        overflow: 'hidden',
      }}
    >
      <Animated.View style={[{ height: '100%', borderRadius: radii.pill, backgroundColor: colors.accentFill }, bar]} />
    </View>
  );
}
