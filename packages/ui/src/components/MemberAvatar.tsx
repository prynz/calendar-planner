import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { categoryColors, radii, space, type EventCategory } from '../tokens';
import { initialsOf } from './AvatarStack';
import { Text } from './Text';

const SIZES = { sm: space[6], md: space[8] + space[2], lg: space[8] * 2 } as const;

/**
 * A person in the family or a group: pastel circle with an emoji or initials. Without `color` it uses the
 * neutral elevated fill. Decorative by default – the surrounding row carries the name for screen readers.
 */
export function MemberAvatar({
  name,
  color,
  emoji,
  size = 'md',
  testID,
}: {
  name: string;
  color?: EventCategory | undefined;
  emoji?: string | undefined;
  size?: keyof typeof SIZES;
  testID?: string;
}) {
  const { colors } = useTheme();
  const d = SIZES[size];
  return (
    <View
      testID={testID}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width: d,
        height: d,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color ? categoryColors[color] : colors.elevated,
      }}
    >
      <Text
        variant={size === 'lg' ? 'titleL' : size === 'md' ? 'titleM' : 'label'}
        color={color ? 'onCategoryFill' : 'textPrimary'}
      >
        {emoji ?? initialsOf(name)}
      </Text>
    </View>
  );
}
