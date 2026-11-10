import type { ReactNode } from 'react';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { PressableScale } from './PressableScale';

/** Round primary action (“+ Termin”) that sits beside the floating tab bar. */
export function Fab({
  icon,
  onPress,
  accessibilityLabel,
  testID,
}: {
  icon: (color: string) => ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      {...(testID ? { testID } : {})}
      pressedScale={0.9}
      style={{
        width: touch.cta + space[2],
        height: touch.cta + space[2],
        borderRadius: radii.pill,
        backgroundColor: colors.accentFill,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon(colors.onAccentFill)}
    </PressableScale>
  );
}
