import { categoryColors, themeColors, type AccentName, type ThemeColors, type ThemeName } from './tokens';

/** WCAG 2.x relative luminance of a #RRGGBB color. */
export function relativeLuminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) throw new Error(`Expected #RRGGBB, got "${hex}"`);
  const n = Number.parseInt(m[1], 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio (1–21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ColorPair {
  name: string;
  fg: string;
  bg: string;
  /** 'text' = normal text (≥ 4.5), 'large' = large text / UI (≥ 3). */
  kind: 'text' | 'large';
}

/** Every foreground/background combination the components are allowed to render. */
export function themePairs(name: ThemeName, accent: AccentName = 'lime'): ColorPair[] {
  const t: ThemeColors = themeColors(name, accent);
  const textOn = (bgName: keyof ThemeColors) =>
    (['textPrimary', 'textSecondary', 'accentText', 'secondaryText', 'dangerText'] as const).map((fg): ColorPair => ({
      name: `${name}.${fg} on ${bgName}`,
      fg: t[fg],
      bg: t[bgName],
      kind: 'text',
    }));
  return [
    ...textOn('canvas'),
    ...textOn('surface'),
    ...textOn('elevated'),
    { name: `${name}.onAccentFill on accentFill`, fg: t.onAccentFill, bg: t.accentFill, kind: 'text' },
    { name: `${name}.canvas on textPrimary (inverse chips)`, fg: t.canvas, bg: t.textPrimary, kind: 'text' },
    { name: `${name}.onSecondaryFill on secondaryFill`, fg: t.onSecondaryFill, bg: t.secondaryFill, kind: 'text' },
    { name: `${name}.onTabActiveFill on tabActiveFill`, fg: t.onTabActiveFill, bg: t.tabActiveFill, kind: 'text' },
    { name: `${name}.tabInactiveText on tabBar`, fg: t.tabInactiveText, bg: t.tabBar, kind: 'text' },
    ...Object.entries(categoryColors).map(([cat, fill]): ColorPair => ({
      name: `${name}.onCategoryFill on ${cat}`,
      fg: t.onCategoryFill,
      bg: fill,
      kind: 'text',
    })),
  ];
}

export const MIN_RATIO = { text: 4.5, large: 3 } as const;
