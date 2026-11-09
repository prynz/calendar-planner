import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { motion, radii, space } from '../tokens';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  title: string;
  body: string;
  action?: { label: string; onPress: () => void; testID?: string };
  testID?: string;
}

export function EmptyState({ title, body, action, testID }: EmptyStateProps) {
  return (
    <View
      testID={testID}
      style={{ alignItems: 'center', gap: space[3], paddingVertical: space[10], paddingHorizontal: space[6] }}
    >
      <Text variant="titleM" align="center">
        {title}
      </Text>
      <Text variant="bodyM" color="textSecondary" align="center">
        {body}
      </Text>
      {action ? (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="secondary"
          {...(action.testID ? { testID: action.testID } : {})}
        />
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
  testID?: string;
}

export function ErrorState({ title, body, retryLabel, onRetry, testID }: ErrorStateProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      style={{ alignItems: 'center', gap: space[3], paddingVertical: space[10], paddingHorizontal: space[6] }}
    >
      <Text variant="titleM" color="dangerText" align="center">
        {title}
      </Text>
      <Text variant="bodyM" color="textSecondary" align="center">
        {body}
      </Text>
      <Button label={retryLabel} onPress={onRetry} />
    </View>
  );
}

/** Loading placeholder. Pulses gently; static when Reduced Motion is on. */
export function Skeleton({
  height,
  width = '100%',
  accessibilityLabel,
}: {
  height: number;
  width?: number | `${number}%`;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    if (reduceMotion) return;
    opacity.set(withRepeat(withTiming(1, { duration: motion.duration.slow * 2 }), -1, true));
  }, [opacity, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View
      accessibilityRole="progressbar"
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      style={[{ height, width, borderRadius: radii.md, backgroundColor: colors.surface }, style]}
    />
  );
}
