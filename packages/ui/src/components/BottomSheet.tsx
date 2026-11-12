import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../theme/ThemeProvider';
import { motion, radii, space, withAlpha } from '../tokens';
import { IconButton } from './Controls';
import { Text } from './Text';

const OFFSCREEN = 600;

/**
 * Sheet that slides up from the bottom (Phase 8): quick actions stay in context instead of opening a new page.
 * Closes with the ✕ button, a tap on the dimmed page, or the system back gesture. Reduced Motion: no slide.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  closeLabel,
  children,
  testID,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
  testID?: string;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(reduceMotion ? 0 : OFFSCREEN);
  // Stays mounted until the slide-out finished (set during render, React's pattern for derived state).
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      y.set(reduceMotion ? 0 : withTiming(0, { duration: motion.duration.base }));
      return;
    }
    if (reduceMotion) return;
    y.set(
      withTiming(OFFSCREEN, { duration: motion.duration.fast }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      }),
    );
  }, [reduceMotion, visible, y]);

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  const backdrop = useAnimatedStyle(() => ({ opacity: 1 - y.get() / OFFSCREEN }));

  if (!visible && (!mounted || reduceMotion)) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, backdrop]}>
          <Pressable
            style={{ flex: 1, backgroundColor: colors.scrim }}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            {...(testID ? { testID: `${testID}-backdrop` } : {})}
          />
        </Animated.View>
        <View style={{ flex: 1 }} pointerEvents="box-none" />
        <Animated.View
          {...(testID ? { testID } : {})}
          accessibilityViewIsModal
          style={[
            {
              backgroundColor: colors.canvas,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              paddingTop: space[2],
              paddingHorizontal: space[5],
              paddingBottom: insets.bottom + space[6],
              gap: space[4],
              maxHeight: '90%',
            },
            sheet,
          ]}
        >
          <View
            style={{
              alignSelf: 'center',
              width: space[10],
              height: space[1] + 1,
              borderRadius: radii.pill,
              backgroundColor: withAlpha(colors.textSecondary, 0.35),
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] }}>
            <View style={{ flex: 1 }}>
              <Text variant="titleM" accessibilityRole="header">
                {title}
              </Text>
            </View>
            <IconButton
              icon={(c) => (
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path d="M6 6l12 12M18 6 6 18" stroke={c} strokeWidth={2.6} strokeLinecap="round" />
                </Svg>
              )}
              onPress={onClose}
              accessibilityLabel={closeLabel}
              {...(testID ? { testID: `${testID}-close` } : {})}
            />
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
