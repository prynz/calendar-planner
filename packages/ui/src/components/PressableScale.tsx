import type { ReactNode } from 'react';
import {
  Pressable,
  type AccessibilityRole,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '../tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps {
  children: ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks while pressed (0.94–0.99). */
  pressedScale?: number;
  hitSlop?: number;
}

/**
 * Tactile press feedback: a quick spring squeeze and release (design-system.md §5, `spring.snappy`).
 * With Reduced Motion it only dims slightly – no movement.
 */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  disabled,
  testID,
  style,
  pressedScale = 0.97,
  hitSlop,
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);
  const animated = useAnimatedStyle(() => {
    const p = pressed.get();
    return reduceMotion ? { opacity: 1 - p * 0.15 } : { transform: [{ scale: 1 - p * (1 - pressedScale) }] };
  });
  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      {...(onLongPress ? { onLongPress } : {})}
      disabled={disabled}
      {...(hitSlop !== undefined ? { hitSlop } : {})}
      onPressIn={() => pressed.set(withSpring(1, motion.spring.snappy))}
      onPressOut={() => pressed.set(withSpring(0, motion.spring.gentle))}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      {...(accessibilityHint ? { accessibilityHint } : {})}
      {...(accessibilityState ? { accessibilityState } : {})}
      style={[style, animated, disabled ? { opacity: 0.5 } : null]}
    >
      {children}
    </AnimatedPressable>
  );
}
