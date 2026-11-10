import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface TileProps {
  title: string;
  /** Big value line, e.g. "4 dabei". */
  value: string;
  detail?: string;
  icon?: (color: string) => ReactNode;
  onPress: () => void;
  /** Screen reader hint, e.g. "Öffnet die Gästeliste". */
  hint: string;
  children?: ReactNode;
  testID?: string;
}

/** Bento tile for the event overview (EVT-08). Always tappable – it opens the full section. */
export function Tile({ title, value, detail, icon, onPress, hint, children, testID }: TileProps) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, value, detail].filter(Boolean).join('. ')}
      accessibilityHint={hint}
      {...(testID ? { testID } : {})}
      pressedScale={0.97}
      style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, padding: space[4], gap: space[2] }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        {icon ? icon(colors.textSecondary) : null}
        <Text variant="label" color="textSecondary">
          {title}
        </Text>
      </View>
      <Text variant="titleM">{value}</Text>
      {detail ? (
        <Text variant="bodyM" color="textSecondary" numberOfLines={2}>
          {detail}
        </Text>
      ) : null}
      {children}
    </PressableScale>
  );
}
