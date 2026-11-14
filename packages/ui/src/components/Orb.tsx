import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '../theme/ThemeProvider';
import { palette, space, withAlpha } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface OrbProps {
  /** Big figure, e.g. "25" or "1:40". */
  value: string;
  /** Small line above, e.g. "los in". */
  top: string;
  /** Small line below, e.g. "Min. · 07:55". */
  bottom: string;
  /** `now` = sunrise (time to go), `calm` = periwinkle (there is time). Colour is never the only signal: the text says it. */
  tone: 'now' | 'calm';
  size?: number;
  onPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * The "now" orb (Kompass, ADR 0017): time as a shape. Calm periwinkle while there is time, sunrise when it is
 * time to leave. It breathes slowly; with Reduce Motion it stays still.
 */
export function Orb({
  value,
  top,
  bottom,
  tone,
  size = 184,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: OrbProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const breath = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) {
      breath.set(1);
      return;
    }
    breath.set(withRepeat(withTiming(1.03, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(breath);
  }, [breath, reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: breath.get() }] }));

  const [inner, mid, outer] =
    tone === 'now'
      ? ([palette.sunriseGlow, palette.sunriseB, palette.sunriseA] as const)
      : ([palette.fogDeep, palette.periwinkleSoft, palette.periwinkleLight] as const);
  const ring = withAlpha(tone === 'now' ? palette.sunriseA : palette.periwinkle, 0.35);
  const id = `orb-${tone}`;
  const body = (
    <Animated.View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id={id} cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor={inner} />
            <Stop offset="0.4" stopColor={mid} />
            <Stop offset="1" stopColor={outer} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="49.5" fill="none" stroke={ring} strokeWidth="0.6" />
        <Circle cx="50" cy="50" r="45" fill={`url(#${id})`} />
      </Svg>
      <View style={{ alignItems: 'center', paddingHorizontal: space[4] }}>
        <Text variant="label" color="onAccentFill" maxFontSizeMultiplier={1.3}>
          {top}
        </Text>
        <Text
          variant="displayXl"
          color="onAccentFill"
          tabular
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          maxFontSizeMultiplier={1.2}
        >
          {value}
        </Text>
        <Text variant="label" color="onAccentFill" maxFontSizeMultiplier={1.3}>
          {bottom}
        </Text>
      </View>
    </Animated.View>
  );
  const shadow = {
    alignSelf: 'center' as const,
    borderRadius: size / 2,
    shadowColor: tone === 'now' ? palette.sunriseA : colors.secondaryFill,
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  };
  if (!onPress) {
    return (
      <View accessible accessibilityLabel={accessibilityLabel} style={shadow} {...(testID ? { testID } : {})}>
        {body}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...(accessibilityHint ? { accessibilityHint } : {})}
      {...(testID ? { testID } : {})}
      pressedScale={0.97}
      style={shadow}
    >
      {body}
    </PressableScale>
  );
}
