import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { categoryColors, coverThemes, palette, radii, type CoverTheme, type EventCategory } from '../tokens';

const CONFETTI = [
  [12, 30, palette.violet500],
  [30, 70, palette.coral],
  [52, 22, palette.lime400],
  [70, 60, palette.violet500],
  [86, 28, palette.coral],
  [94, 76, palette.lime400],
] as const;

/**
 * A decorative cover band for an event (events.md: cover as colour or theme). Purely visual – hidden from
 * screen readers; the event title next to it carries the meaning.
 */
export function CoverBand({
  cover,
  category,
  height = 72,
  testID,
}: {
  cover: CoverTheme | 'category';
  category: EventCategory;
  height?: number;
  testID?: string;
}) {
  const theme = cover === 'category' ? null : coverThemes[cover];
  const from = theme?.from ?? categoryColors[category];
  const to = theme?.to ?? categoryColors[category];
  const id = `cover-${cover}-${category}`;
  return (
    <View
      testID={testID}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ height, borderRadius: radii.lg, overflow: 'hidden' }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
        {theme?.pattern === 'stripes'
          ? Array.from({ length: 10 }, (_, i) => (
              <Rect key={i} x={i * 10} y="0" width="4" height="100" fill={palette.cream50} opacity={0.6} />
            ))
          : null}
        {theme?.pattern === 'dots'
          ? Array.from({ length: 24 }, (_, i) => (
              <Circle key={i} cx={(i * 37) % 100} cy={(i * 53) % 100} r="1.2" fill={palette.cream50} opacity={0.8} />
            ))
          : null}
        {theme?.pattern === 'confetti'
          ? CONFETTI.map(([x, y, c], i) => <Circle key={i} cx={x} cy={y} r="4" fill={c} />)
          : null}
      </Svg>
    </View>
  );
}
