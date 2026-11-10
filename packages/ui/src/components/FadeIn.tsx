import { useEffect, type ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '../tokens';

/**
 * Gentle entrance (fade + 8 dp rise) driven by shared values – not Reanimated layout animations, which can
 * stay invisible when system animations are disabled. Reduced Motion: shown immediately.
 */
export function FadeIn({ children, delay = 0, testID }: { children: ReactNode; delay?: number; testID?: string }) {
  const reduceMotion = useReducedMotion();
  const p = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      p.set(1);
      return;
    }
    p.set(withDelay(delay, withTiming(1, { duration: motion.duration.base })));
  }, [delay, p, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: p.get(), transform: [{ translateY: (1 - p.get()) * 8 }] }));
  return (
    <Animated.View testID={testID} style={style}>
      {children}
    </Animated.View>
  );
}

/** A value that springs to its target – for progress bars and rings. */
export function useSpringTo(target: number) {
  const reduceMotion = useReducedMotion();
  const v = useSharedValue(target);
  useEffect(() => {
    v.set(reduceMotion ? target : withSpring(target, motion.spring.gentle));
  }, [reduceMotion, target, v]);
  return v;
}
