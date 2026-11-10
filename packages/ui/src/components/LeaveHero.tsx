import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, withAlpha } from '../tokens';
import { useSpringTo } from './FadeIn';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface LeaveHeroProps {
  /** Big line, e.g. "18:30 los". */
  headline: string;
  /** "Spieleabend bei Olivia · 19:00" */
  label: string;
  /** "22 Min. Rad + 8 Min. Puffer" */
  breakdown: string;
  /** "Noch 47 Min. bis zum Losgehen" */
  status: string;
  /** 0–1: how much of the 3-hour run-up has passed. */
  progress: number;
  onPress: () => void;
  openHint: string;
  testID?: string;
}

/**
 * The anti-chaos signature: one big lime card with the leave time (design-system.md §12).
 * Shown only in the 3 hours before leaving, so it keeps its signal value.
 */
export function LeaveHero({ headline, label, breakdown, status, progress, onPress, openHint, testID }: LeaveHeroProps) {
  const { colors } = useTheme();
  const p = useSpringTo(Math.min(1, Math.max(0, progress)));
  const bar = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  const ink = colors.onAccentFill;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`${headline}. ${label}. ${breakdown}. ${status}`}
      accessibilityHint={openHint}
      {...(testID ? { testID } : {})}
      pressedScale={0.98}
      style={{ backgroundColor: colors.accentFill, borderRadius: radii.xl, padding: space[5], gap: space[2] }}
    >
      <Text variant="label" color="onAccentFill">
        {label}
      </Text>
      <Text
        variant="displayXl"
        color="onAccentFill"
        tabular
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {headline}
      </Text>
      <Text variant="bodyM" color="onAccentFill">
        {breakdown}
      </Text>
      <View
        style={{
          height: space[2] + space[0.5],
          borderRadius: radii.pill,
          backgroundColor: withAlpha(ink, 0.15),
          overflow: 'hidden',
          marginTop: space[2],
        }}
      >
        <Animated.View style={[{ height: '100%', borderRadius: radii.pill, backgroundColor: ink }, bar]} />
      </View>
      <Text variant="label" color="onAccentFill">
        {status}
      </Text>
    </PressableScale>
  );
}
