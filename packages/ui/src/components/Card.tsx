import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { cardShadow, radii, space } from '../tokens';

/** Phase 9: every card is the same calm white card with a soft shadow (light) – see SoftCard. */
export function Card({ children, testID }: { children: ReactNode; testID?: string }) {
  const { colors, name } = useTheme();
  return (
    <View
      testID={testID}
      style={{
        backgroundColor: colors.elevated,
        borderRadius: radii.lg,
        padding: space[5],
        gap: space[3],
        ...cardShadow(name),
      }}
    >
      {children}
    </View>
  );
}
