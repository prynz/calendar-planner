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
  /** Phase 8: warm white page and quiet sand for chips and tracks (light theme). */
  paper: '#FBF9F4',
  sand: '#F1ECE2',
  cream100: '#EFE9DC',
  cream200: '#DDD5C4',
  white: '#FFFFFF',
  lime400: '#C8F031',
  limeInk: '#4A5E00',
  /** Phase 8 accent palettes: a light fill (ink text on it) and an ink shade for text on light backgrounds. */
  oceanFill: '#8EDBEA',
  oceanInk: '#0B5D6E',
  coralFill: '#FFB59E',
  coralInk: '#A13A17',
  lavenderFill: '#C9B8FF',
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
  /** Kompass (Phase 11, ADR 0017): cool fog page, indigo ink, periwinkle for calm, sunrise for "now". */
  fog: '#F3F4F8',
  fogDeep: '#E6E7EF',
  fogLine: '#D3D5E2',
  indigoInk: '#17163A',
  indigoMuted: '#55576F',
  periwinkle: '#4F5BE0',
  periwinkleInk: '#3B48C9',
  periwinkleLight: '#A5ACFF',
  periwinkleSoft: '#C9CEFF',
  sunriseA: '#FF6B4A',
  sunriseB: '#FFB547',
  sunriseGlow: '#FFD9A0',
  sunriseInk: '#A3350C',
  night900: '#0F0F1E',
  night800: '#18182C',
  night700: '#22223A',
  night600: '#2A2A42',
  nightText: '#ECECF6',
  nightMuted: '#A3A4BC',
  red300: '#FF7A7E',
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

/**
 * Personal accent colour (Phase 8, ADR 0016). `fill` carries ink text and is the only strong colour on a screen;
 * `ink` is the same hue dark enough for text on the light theme. All combinations are contrast-tested.
 */
export const ACCENTS = {
  /** Kompass default: the sunrise that only ever means "now". */
  sunrise: { fill: palette.sunriseB, ink: palette.sunriseInk },
  lime: { fill: palette.lime400, ink: palette.limeInk },
  ocean: { fill: palette.oceanFill, ink: palette.oceanInk },
  coral: { fill: palette.coralFill, ink: palette.coralInk },
  lavender: { fill: palette.lavenderFill, ink: palette.violet700 },
} as const;
export type AccentName = keyof typeof ACCENTS;
export const ACCENT_NAMES = Object.keys(ACCENTS) as AccentName[];

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
    canvas: palette.night900,
    surface: palette.night800,
    elevated: palette.night700,
    border: palette.night600,
    textPrimary: palette.nightText,
    textSecondary: palette.nightMuted,
    accentFill: palette.sunriseB,
    onAccentFill: palette.indigoInk,
    accentText: palette.sunriseB,
    secondaryFill: palette.periwinkle,
    onSecondaryFill: palette.white,
    secondaryText: palette.periwinkleLight,
    dangerText: palette.red300,
    onCategoryFill: palette.indigoInk,
    tabBar: palette.night700,
    tabActiveFill: palette.nightText,
    onTabActiveFill: palette.indigoInk,
    tabInactiveText: palette.nightMuted,
    scrim: 'rgba(15, 15, 30, 0.6)',
  },
  light: {
    canvas: palette.fog,
    surface: palette.fogDeep,
    elevated: palette.white,
    border: palette.fogLine,
    textPrimary: palette.indigoInk,
    textSecondary: palette.indigoMuted,
    accentFill: palette.sunriseB,
    onAccentFill: palette.indigoInk,
    accentText: palette.sunriseInk,
    secondaryFill: palette.periwinkle,
    onSecondaryFill: palette.white,
    secondaryText: palette.periwinkleInk,
    dangerText: palette.red700,
    onCategoryFill: palette.indigoInk,
    tabBar: palette.white,
    tabActiveFill: palette.indigoInk,
    onTabActiveFill: palette.white,
    tabInactiveText: palette.indigoMuted,
    scrim: 'rgba(23, 22, 58, 0.45)',
  },
};

/** Theme colours with a personal accent applied (fill for buttons/active tabs, readable text shade per theme). */
export function themeColors(name: ThemeName, accent: AccentName = 'sunrise'): ThemeColors {
  const a = ACCENTS[accent];
  // Kompass: the dock stays ink/white – the accent is reserved for "now" and the main action.
  return { ...themes[name], accentFill: a.fill, accentText: name === 'dark' ? a.fill : a.ink };
}

/** Soft card shadow for white cards on the light page (Phase 8). Flat on dark, where surfaces carry depth. */
export function cardShadow(name: ThemeName) {
  return name === 'light'
    ? {
        shadowColor: palette.indigoInk,
        shadowOpacity: 0.07,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }
    : {};
}

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
  /** Phase 8: row titles – semibold body size. */
  bodyStrong: { fontFamily: fontFamilies.textSemiBold, fontSize: 16, lineHeight: 22, maxScale: 2 },
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
