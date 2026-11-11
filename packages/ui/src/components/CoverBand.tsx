import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { categoryColors, coverThemes, palette, radii, type CoverTheme, type EventCategory } from '../tokens';

// Drawn on a fixed 400 × 80 canvas that is cropped (never stretched), so dots stay round on any width.
const W = 400;
const H = 80;
const CONFETTI = [
  [40, 22, palette.violet500],
  [110, 58, palette.coral],
  [190, 18, palette.lime400],
  [250, 50, palette.violet500],
  [320, 24, palette.coral],
  [370, 62, palette.lime400],
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
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={W} height={H} fill={`url(#${id})`} />
        {theme?.pattern === 'stripes'
          ? Array.from({ length: 20 }, (_, i) => (
              <Rect key={i} x={i * 20} y="0" width="8" height={H} fill={palette.cream50} opacity={0.6} />
            ))
          : null}
        {theme?.pattern === 'dots'
          ? Array.from({ length: 30 }, (_, i) => (
              <Circle key={i} cx={(i * 137) % W} cy={(i * 53) % H} r="1.6" fill={palette.cream50} opacity={0.85} />
            ))
          : null}
        {theme?.pattern === 'confetti'
          ? CONFETTI.map(([x, y, c], i) => <Circle key={i} cx={x} cy={y} r="7" fill={c} />)
          : null}
      </Svg>
    </View>
  );
}
