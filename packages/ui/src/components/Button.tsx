import { ActivityIndicator, Pressable, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { Text } from './Text';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  testID,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const inactive = disabled === true || loading === true;
  const fill = variant === 'primary' ? colors.accentFill : 'transparent';
  const textColor = variant === 'primary' ? 'onAccentFill' : 'textPrimary';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading === true }}
      {...(accessibilityHint ? { accessibilityHint } : {})}
      style={({ pressed }) => ({
        minHeight: size === 'lg' ? touch.cta : touch.min,
        paddingHorizontal: space[6],
        borderRadius: radii.pill,
        backgroundColor: fill,
        borderWidth: variant === 'secondary' ? 1.5 : 0,
        borderColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        {loading ? <ActivityIndicator color={colors[textColor]} /> : null}
        <Text variant="label" color={textColor}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
