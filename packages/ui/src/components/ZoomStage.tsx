import { useEffect, useRef, type ReactNode } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '../tokens';

/** How far two fingers must spread (or pinch) before the level changes. */
const SPREAD = 1.18;
const PINCH = 0.85;

/**
 * Zoom calendar (Phase 12): two fingers apart = one level deeper, together = one level up. The level snaps – there
 * is no free zoom. The new level grows (or shrinks) into place; with Reduce Motion it only fades.
 * Zooming is a shortcut: the caller must offer the same steps as buttons.
 */
export function ZoomStage({
  level,
  onZoom,
  children,
}: {
  /** Current depth, 0 = widest. Changing it plays the transition. */
  level: number;
  onZoom: (direction: 1 | -1) => void;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const previous = useRef(level);

  useEffect(() => {
    if (previous.current === level) return;
    const deeper = level > previous.current;
    previous.current = level;
    opacity.set(0);
    opacity.set(withTiming(1, { duration: motion.duration.base }));
    if (reduceMotion) return;
    scale.set(deeper ? 0.9 : 1.1);
    scale.set(withSpring(1, motion.spring.gentle));
  }, [level, opacity, reduceMotion, scale]);

  const pinch = Gesture.Pinch().onEnd((e) => {
    if (e.scale >= SPREAD) runOnJS(onZoom)(1);
    else if (e.scale <= PINCH) runOnJS(onZoom)(-1);
  });
  const style = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ scale: scale.get() }] }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
