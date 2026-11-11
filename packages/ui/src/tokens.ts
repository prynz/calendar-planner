/**
 * Nowish design tokens – single source of truth (docs/design/design-system.md).
 * Pure module: no React / React Native imports, so tests, mockup renderers and
 * future web apps can use it too.
 */

/** Primitive palette. Never use these directly in screens – use the semantic theme. */
export const palette = {
  ink900: '#0D0E12',
  ink800: '#16181E',
  ink700: '#1F222A',
  ink600: '#2A2E38',
  ink400: '#5C6270',
  ink300: '#8A90A0',
  cream50: '#F7F3EA',
  cream100: '#EFE9DC',
  cream200: '#DDD5C4',
  white: '#FFFFFF',
  lime400: '#C8F031',
  limeInk: '#4A5E00',
  violet500: '#7C5CFF',
  violet300: '#B9A8FF',
  violet700: '#4B2FD6',
  mint: '#BDEBC8',
  cyan: '#8EDBEA',
  lilac: '#D3C6EE',
  peach: '#FFCFAE',
  sun: '#FFE38A',
  coral: '#FF8A7A',
  red400: '#FF5A5F',
  red700: '#B3261E',
  textOnDark: '#F3F4F6',
  textMutedOnDark: '#A3A9B7',
  textMutedOnLight: '#5B5F69',
} as const;

export type PaletteKey = keyof typeof palette;

/** Event categories → pastel fill. Text on a category fill is always `ink900`. */
export const categoryColors = {
  social: palette.lilac,
  family: palette.mint,
  health: palette.cyan,
  work: palette.sun,
  sport: palette.peach,
  celebration: palette.coral,
} as const;

export type EventCategory = keyof typeof categoryColors;

/**
 * Event cover themes (Phase 6). Two colours each (gradient) and an optional pattern drawn on top. Text on a
 * cover is never placed directly on it – covers are decorative bands. `category` uses the category pastel.
 */
export const coverThemes = {
  stripes: { from: palette.cream100, to: palette.cream200, pattern: 'stripes' },
  sunset: { from: palette.sun, to: palette.coral, pattern: 'none' },
  night: { from: palette.violet700, to: palette.ink800, pattern: 'dots' },
  confetti: { from: palette.lilac, to: palette.peach, pattern: 'confetti' },
  forest: { from: palette.mint, to: palette.cyan, pattern: 'none' },
} as const;
export type CoverTheme = keyof typeof coverThemes;
export const EVENT_CATEGORIES = Object.keys(categoryColors) as EventCategory[];

export type ThemeName = 'dark' | 'light';

/** Semantic colors per theme. Foreground/background pairs are checked in test/contrast.test.ts. */
export interface ThemeColors {
  canvas: string;
  surface: string;
  elevated: string;
  /** Decorative separators only – never the sole boundary of an interactive element. */
  border: string;
  textPrimary: string;
  textSecondary: string;
  accentFill: string;
  onAccentFill: string;
  accentText: string;
  secondaryFill: string;
  onSecondaryFill: string;
  secondaryText: string;
  dangerText: string;
  onCategoryFill: string;
  tabBar: string;
  tabActiveFill: string;
  onTabActiveFill: string;
  tabInactiveText: string;
  scrim: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  dark: {
    canvas: palette.ink900,
    surface: palette.ink800,
    elevated: palette.ink700,
    border: palette.ink600,
    textPrimary: palette.textOnDark,
    textSecondary: palette.textMutedOnDark,
    accentFill: palette.lime400,
    onAccentFill: palette.ink900,
    accentText: palette.lime400,
    secondaryFill: palette.violet700,
    onSecondaryFill: palette.white,
    secondaryText: palette.violet300,
    dangerText: palette.red400,
    onCategoryFill: palette.ink900,
    tabBar: palette.ink700,
    tabActiveFill: palette.lime400,
    onTabActiveFill: palette.ink900,
    tabInactiveText: palette.textMutedOnDark,
    scrim: 'rgba(13, 14, 18, 0.6)',
  },
  light: {
    canvas: palette.cream50,
    surface: palette.cream100,
    elevated: palette.white,
    border: palette.cream200,
    textPrimary: palette.ink900,
    textSecondary: palette.textMutedOnLight,
    accentFill: palette.lime400,
    onAccentFill: palette.ink900,
    accentText: palette.limeInk,
    secondaryFill: palette.violet700,
    onSecondaryFill: palette.white,
    secondaryText: palette.violet700,
    dangerText: palette.red700,
    onCategoryFill: palette.ink900,
    tabBar: palette.ink900,
    tabActiveFill: palette.lime400,
    onTabActiveFill: palette.ink900,
    tabInactiveText: palette.textMutedOnDark,
    scrim: 'rgba(13, 14, 18, 0.6)',
  },
};

/** 4-pt spacing scale. */
export const space = { 0: 0, 0.5: 2, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;
export type SpaceKey = keyof typeof space;

export const radii = { sm: 12, md: 16, lg: 24, xl: 32, pill: 999 } as const;

/** Minimum touch target (dp) and primary CTA height. */
export const touch = { min: 48, cta: 56 } as const;

/** Font family names as registered by @expo-google-fonts (loaded in the app root). */
export const fontFamilies = {
  displayBold: 'BricolageGrotesque_700Bold',
  displaySemiBold: 'BricolageGrotesque_600SemiBold',
  textRegular: 'Inter_400Regular',
  textSemiBold: 'Inter_600SemiBold',
} as const;

export interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  /** Max multiplier for dynamic type (display styles are capped so layouts don't break). */
  maxScale: number;
}

export const typography = {
  displayXl: { fontFamily: fontFamilies.displayBold, fontSize: 56, lineHeight: 60, maxScale: 1.4 },
  displayL: { fontFamily: fontFamilies.displayBold, fontSize: 40, lineHeight: 44, maxScale: 1.4 },
  titleL: { fontFamily: fontFamilies.displaySemiBold, fontSize: 28, lineHeight: 34, maxScale: 1.6 },
  titleM: { fontFamily: fontFamilies.textSemiBold, fontSize: 20, lineHeight: 26, maxScale: 2 },
  bodyL: { fontFamily: fontFamilies.textRegular, fontSize: 17, lineHeight: 24, maxScale: 2 },
  bodyM: { fontFamily: fontFamilies.textRegular, fontSize: 15, lineHeight: 22, maxScale: 2 },
  label: { fontFamily: fontFamilies.textSemiBold, fontSize: 13, lineHeight: 18, maxScale: 2 },
} as const satisfies Record<string, TypeStyle>;

export type TypographyVariant = keyof typeof typography;

/** Motion tokens (ms / spring configs for Reanimated `withSpring`). */
/**
 * Text scale cap inside fixed-size shapes (avatars, date pills). They also carry a full spoken label, so the
 * text may stay smaller there instead of spilling out of the shape at 200 % (Phase 7 CI screenshots 43–46).
 */
export const FIXED_SIZE_TEXT_SCALE = 1.3;

export const motion = {
  duration: { instant: 100, fast: 180, base: 260, slow: 420 },
  easing: {
    standard: [0.2, 0, 0, 1] as const,
    exit: [0.3, 0, 1, 1] as const,
  },
  spring: {
    snappy: { damping: 18, stiffness: 260, mass: 1 },
    gentle: { damping: 22, stiffness: 140, mass: 1 },
    bouncy: { damping: 12, stiffness: 180, mass: 1 },
  },
} as const;

/** Haptic intents; mapped to expo-haptics in the app. */
export const HAPTIC_INTENTS = ['selection', 'light', 'success', 'warning', 'heavy'] as const;
export type HapticIntent = (typeof HAPTIC_INTENTS)[number];

/** Hex color with alpha (0–1) → rgba() string. For translucent surfaces derived from tokens. */
export function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) throw new Error(`withAlpha expects #RRGGBB, got "${hex}"`);
  if (alpha < 0 || alpha > 1) throw new Error(`alpha must be within 0..1, got ${alpha}`);
  const n = Number.parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
