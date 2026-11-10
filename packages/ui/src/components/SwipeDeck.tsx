import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '../theme/ThemeProvider';
import { motion, radii, space } from '../tokens';
import { Button } from './Button';
import { Text } from './Text';

export type SwipeChoice = 'yes' | 'if-needed' | 'no';

export interface SwipeDeckProps {
  cards: readonly { key: string; title: string; detail?: string }[];
  onChoose: (key: string, choice: SwipeChoice) => void;
  labels: Record<SwipeChoice, string>;
  /** Explains the gestures, e.g. "Wische nach rechts, wenn es passt …". */
  gestureHint: string;
  testID: string;
}

/** Swipe distance that counts as a decision. */
const THRESHOLD = 110;
const FLY = 600;

/**
 * Card stack for votes (polls.md POL-02): right = works, left = doesn't, up = if needed. Every gesture
 * has an equal button below (screen readers, motor impairments); Reduced Motion drops the fly-out.
 */
export function SwipeDeck({ cards, onChoose, labels, gestureHint, testID }: SwipeDeckProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const top = cards[0];
  const next = cards[1];

  // A new top card starts centred.
  useEffect(() => {
    x.set(0);
    y.set(0);
  }, [top?.key, x, y]);

  const choose = (choice: SwipeChoice) => {
    if (top) onChoose(top.key, choice);
  };

  const pan = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      x.set(e.translationX);
      y.set(Math.min(0, e.translationY));
    },
    onDeactivate: () => {
      'worklet';
      const dx = x.get();
      const dy = y.get();
      const choice: SwipeChoice | null =
        dx > THRESHOLD ? 'yes' : dx < -THRESHOLD ? 'no' : dy < -THRESHOLD ? 'if-needed' : null;
      if (!choice) {
        x.set(withSpring(0, motion.spring.snappy));
        y.set(withSpring(0, motion.spring.snappy));
        return;
      }
      if (reduceMotion) {
        scheduleOnRN(choose, choice);
        return;
      }
      const tx = choice === 'yes' ? FLY : choice === 'no' ? -FLY : 0;
      const ty = choice === 'if-needed' ? -FLY : dy;
      y.set(withTiming(ty, { duration: motion.duration.fast }));
      x.set(
        withTiming(tx, { duration: motion.duration.fast }, (finished) => {
          if (finished) scheduleOnRN(choose, choice);
        }),
      );
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.get() },
      { translateY: y.get() },
      { rotate: `${reduceMotion ? 0 : interpolate(x.get(), [-200, 0, 200], [-10, 0, 10])}deg` },
    ],
  }));
  const yesStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [0, THRESHOLD], [0, 1], 'clamp') }));
  const noStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [-THRESHOLD, 0], [1, 0], 'clamp') }));
  const maybeStamp = useAnimatedStyle(() => ({ opacity: interpolate(y.get(), [-THRESHOLD, 0], [1, 0], 'clamp') }));

  if (!top) return null;

  const face = (card: { title: string; detail?: string }) => (
    <>
      <Text variant="titleL" align="center">
        {card.title}
      </Text>
      {card.detail ? (
        <Text variant="bodyL" color="textSecondary" align="center">
          {card.detail}
        </Text>
      ) : null}
    </>
  );
  const cardBox = {
    minHeight: 200,
    borderRadius: radii.xl,
    padding: space[6],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: space[2],
  };
  const stamp = (
    label: string,
    color: 'accentText' | 'dangerText' | 'secondaryText',
    style: object,
    position: object,
  ) => (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', padding: space[2], borderRadius: radii.sm, borderWidth: 2, borderColor: colors[color] },
        position,
        style,
      ]}
    >
      <Text variant="label" color={color}>
        {label}
      </Text>
    </Animated.View>
  );

  return (
    <View style={{ gap: space[4] }} testID={testID}>
      <View>
        {next ? (
          <View
            style={[
              cardBox,
              {
                position: 'absolute',
                start: 0,
                end: 0,
                top: space[2],
                backgroundColor: colors.surface,
                transform: [{ scale: 0.95 }],
              },
            ]}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            {face(next)}
          </View>
        ) : null}
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[cardBox, { backgroundColor: colors.elevated }, cardStyle]}
            accessible
            accessibilityLabel={[top.title, top.detail].filter(Boolean).join(', ')}
            accessibilityHint={gestureHint}
            testID={`${testID}-card`}
          >
            {face(top)}
            {stamp(labels.yes, 'accentText', yesStamp, { top: space[4], start: space[4] })}
            {stamp(labels.no, 'dangerText', noStamp, { top: space[4], end: space[4] })}
            {stamp(labels['if-needed'], 'secondaryText', maybeStamp, { bottom: space[4] })}
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={{ flexDirection: 'row', gap: space[2] }}>
        <View style={{ flex: 1 }}>
          <Button label={labels.no} variant="secondary" onPress={() => choose('no')} testID={`${testID}-no`} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label={labels['if-needed']}
            variant="secondary"
            onPress={() => choose('if-needed')}
            testID={`${testID}-if-needed`}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={labels.yes} onPress={() => choose('yes')} testID={`${testID}-yes`} />
        </View>
      </View>
    </View>
  );
}
