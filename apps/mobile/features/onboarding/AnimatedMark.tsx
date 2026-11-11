import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { markGeometry, markPaths } from '@nowish/brand';
import { motion, useTheme } from '@nowish/ui';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Path lengths in the 100-unit mark grid (arc spans 360° minus the gap on the right). */
const { radius, gapHalfAngle, center, hourHandEnd, arrowTip, arrowHead } = markGeometry;
const LENGTHS = [
  (2 * Math.PI * radius * (360 - 2 * gapHalfAngle)) / 360,
  center.y - hourHandEnd.y,
  arrowTip.x - center.x,
  2 * Math.SQRT2 * arrowHead,
];

function DrawnPath({
  d,
  length,
  progress,
  color,
}: {
  d: string;
  length: number;
  progress: SharedValue<number>;
  color: string;
}) {
  // The gap is one stroke longer than the path, so no round cap peeks out before the stroke starts drawing.
  const gap = length + markGeometry.stroke;
  const props = useAnimatedProps(() => ({ strokeDashoffset: gap * (1 - progress.get()) }));
  return (
    <AnimatedPath
      d={d}
      stroke={color}
      strokeWidth={markGeometry.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={[length, gap]}
      animatedProps={props}
    />
  );
}

/**
 * The logo mark drawing itself (brand-foundation.md §5): the clock face appears, then the minute hand steps out
 * of the circle as an arrow – "time to leave". Decorative: the brand name is shown as text next to it.
 * Reduced Motion: drawn complete from the start.
 */
export function AnimatedMark({ size = 72 }: { size?: number }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const ring = useSharedValue(reduceMotion ? 1 : 0);
  const hand = useSharedValue(reduceMotion ? 1 : 0);
  const arrow = useSharedValue(reduceMotion ? 1 : 0);
  const head = useSharedValue(reduceMotion ? 1 : 0);
  // Dashed strokes lose the pointed arrow join on some renderers, so the finished mark is drawn without dashes.
  const [finished, setFinished] = useState(false);
  const done = reduceMotion || finished;

  useEffect(() => {
    if (reduceMotion) return;
    const { slow, base, fast } = motion.duration;
    ring.set(withTiming(1, { duration: slow * 2 }));
    hand.set(withDelay(slow, withTiming(1, { duration: base })));
    arrow.set(withDelay(slow * 2, withTiming(1, { duration: base })));
    head.set(withDelay(slow * 2 + base, withTiming(1, { duration: fast })));
    const timer = setTimeout(() => setFinished(true), slow * 2 + base + fast + 50);
    return () => clearTimeout(timer);
  }, [arrow, hand, head, reduceMotion, ring]);

  const progress = [ring, hand, arrow, head];
  return (
    <View
      testID="onb-mark"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {markPaths().map((d, i) =>
          done ? (
            <Path
              key={d}
              d={d}
              stroke={colors.accentText}
              strokeWidth={markGeometry.stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : (
            <DrawnPath
              key={d}
              d={d}
              length={LENGTHS[i] ?? 0}
              progress={progress[i] ?? ring}
              color={colors.accentText}
            />
          ),
        )}
      </Svg>
    </View>
  );
}
