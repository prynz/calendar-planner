import { describe, expect, it } from 'vitest';

import { contrastRatio, MIN_RATIO, relativeLuminance, themePairs } from '../src/contrast';
import { ACCENT_NAMES, palette, withAlpha } from '../src/tokens';

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('reproduces the values documented in design-system.md §2.3', () => {
    expect(contrastRatio(palette.lime400, palette.ink900)).toBeCloseTo(14.66, 1);
    expect(contrastRatio(palette.lime400, palette.cream50)).toBeCloseTo(1.19, 1);
    expect(contrastRatio(palette.violet500, palette.ink900)).toBeCloseTo(4.44, 1);
    expect(contrastRatio(palette.white, palette.violet700)).toBeCloseTo(7.85, 1);
  });

  it('rejects malformed colors', () => {
    expect(() => relativeLuminance('lime')).toThrow();
  });
});

describe.each(
  (['dark', 'light'] as const).flatMap((name) =>
    ACCENT_NAMES.map((accent) => [`${name} + ${accent}`, name, accent] as const),
  ),
)('%s', (_label, name, accent) => {
  it.each(themePairs(name, accent).map((p) => [p.name, p] as const))('%s meets WCAG AA', (_l, pair) => {
    expect(contrastRatio(pair.fg, pair.bg)).toBeGreaterThanOrEqual(MIN_RATIO[pair.kind]);
  });
});

describe('forbidden combinations stay forbidden', () => {
  it('lime as text on cream fails AA – the light theme must use limeInk instead', () => {
    expect(contrastRatio(palette.lime400, palette.cream50)).toBeLessThan(MIN_RATIO.large);
    expect(contrastRatio(palette.limeInk, palette.cream50)).toBeGreaterThanOrEqual(MIN_RATIO.text);
  });

  it('violet500 is not a text color', () => {
    expect(contrastRatio(palette.violet500, palette.ink900)).toBeLessThan(MIN_RATIO.text);
  });
});

describe('withAlpha', () => {
  it('converts hex + alpha to rgba', () => {
    expect(withAlpha('#0D0E12', 0.6)).toBe('rgba(13, 14, 18, 0.6)');
  });
  it('rejects bad input', () => {
    expect(() => withAlpha('#FFF', 0.5)).toThrow();
    expect(() => withAlpha('#FFFFFF', 2)).toThrow();
  });
});
