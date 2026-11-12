import type { ReactNode } from 'react';
import { View, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { motion, radii, space } from '../tokens';
import { Text } from './Text';

/** How far a row must travel before letting go triggers the action. */
const THRESHOLD = 88;

export interface SwipeAction {
  label: string;
  onAction: () => void;
}

/**
 * Swipe a row (Phase 9): right = primary action (done), left = secondary (later). Swiping is only a shortcut –
 * the same actions are buttons in the row and screen-reader actions on the row itself (accessibilityActions).
 * Vertical scrolling keeps working: the gesture only starts after a clear sideways movement.
 */
export function SwipeRow({
  children,
  right,
  left,
  onThreshold,
  testID,
}: {
  children: ReactNode;
  /** Revealed when swiping to the right (shown on the start side). */
  right?: SwipeAction;
  /** Revealed when swiping to the left (shown on the end side). */
  left?: SwipeAction;
  /** Crossing the threshold – for a haptic tick. */
  onThreshold?: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  const armed = useSharedValue(0);

  const settle = () => {
    'worklet';
    x.set(reduceMotion ? withTiming(0, { duration: motion.duration.instant }) : withSpring(0, motion.spring.snappy));
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      const dx = e.translationX;
      const allowed = (dx > 0 && right) || (dx < 0 && left) ? dx : dx / 6;
      x.set(allowed);
      const now = Math.abs(allowed) >= THRESHOLD ? Math.sign(allowed) : 0;
      if (now !== armed.get()) {
        armed.set(now);
        if (now !== 0 && onThreshold) runOnJS(onThreshold)();
      }
    })
    .onEnd(() => {
      const dir = armed.get();
      armed.set(0);
      if (dir > 0 && right) runOnJS(right.onAction)();
      if (dir < 0 && left) runOnJS(left.onAction)();
      settle();
    })
    .onFinalize(() => {
      if (x.get() !== 0) settle();
    });

  const row = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const startBg = useAnimatedStyle(() => ({ opacity: x.get() > 0 ? Math.min(1, x.get() / THRESHOLD) : 0 }));
  const endBg = useAnimatedStyle(() => ({ opacity: x.get() < 0 ? Math.min(1, -x.get() / THRESHOLD) : 0 }));

  const actions = [
    ...(right ? [{ name: 'right', label: right.label }] : []),
    ...(left ? [{ name: 'left', label: left.label }] : []),
  ];
  const onAccessibilityAction = (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === 'right') right?.onAction();
    if (e.nativeEvent.actionName === 'left') left?.onAction();
  };

  const background = (side: 'start' | 'end', action: SwipeAction | undefined) =>
    action ? (
      <Animated.View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            start: 0,
            end: 0,
            borderRadius: radii.md,
            paddingHorizontal: space[5],
            justifyContent: 'center',
            alignItems: side === 'start' ? 'flex-start' : 'flex-end',
            backgroundColor: side === 'start' ? colors.accentFill : colors.surface,
          },
          side === 'start' ? startBg : endBg,
        ]}
      >
        <Text variant="label" color={side === 'start' ? 'onAccentFill' : 'textPrimary'}>
          {action.label}
        </Text>
      </Animated.View>
    ) : null;

  return (
    <View {...(testID ? { testID } : {})} accessibilityActions={actions} onAccessibilityAction={onAccessibilityAction}>
      {background('start', right)}
      {background('end', left)}
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ backgroundColor: colors.elevated }, row]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
