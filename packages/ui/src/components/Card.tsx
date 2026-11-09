import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space } from '../tokens';

export function Card({ children, testID }: { children: ReactNode; testID?: string }) {
  const { colors } = useTheme();
  return (
    <View
      testID={testID}
      style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: space[5], gap: space[3] }}
    >
      {children}
    </View>
  );
}
