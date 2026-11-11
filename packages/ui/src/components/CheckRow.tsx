import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

/** A labelled checkbox row (consents, confirmations). The whole row is the touch target. */
export function CheckRow({
  label,
  checked,
  onToggle,
  testID,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      pressedScale={0.98}
      {...(testID ? { testID } : {})}
      style={{
        minHeight: touch.cta,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingHorizontal: space[4],
        borderRadius: radii.md,
        backgroundColor: colors.surface,
      }}
    >
      <View
        style={{
          width: space[8],
          height: space[8],
          borderRadius: radii.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: checked ? colors.accentFill : colors.elevated,
        }}
      >
        {checked ? (
          <Text variant="titleM" color="onAccentFill">
            ✓
          </Text>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyL">{label}</Text>
      </View>
    </PressableScale>
  );
}
