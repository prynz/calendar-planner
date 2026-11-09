import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { typography, type ThemeColors, type TypographyVariant } from '../tokens';

type TextColor =
  | 'textPrimary'
  | 'textSecondary'
  | 'accentText'
  | 'secondaryText'
  | 'dangerText'
  | 'onAccentFill'
  | 'onSecondaryFill'
  | 'onCategoryFill'
  | 'onTabActiveFill'
  | 'tabInactiveText';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TypographyVariant;
  color?: TextColor & keyof ThemeColors;
  align?: 'auto' | 'center';
  /** Only for numbers that must align (times, amounts). */
  tabular?: boolean;
}

export function Text({ variant = 'bodyL', color = 'textPrimary', align = 'auto', tabular, ...rest }: TextProps) {
  const { colors } = useTheme();
  const t = typography[variant];
  return (
    <RNText
      maxFontSizeMultiplier={t.maxScale}
      style={{
        fontFamily: t.fontFamily,
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        color: colors[color],
        textAlign: align,
        ...(tabular ? { fontVariant: ['tabular-nums'] as const } : {}),
      }}
      {...rest}
    />
  );
}
