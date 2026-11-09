import { describe, expect, it } from 'vitest';

import { brand, claims, identifiers, logoMarkSvg, markGeometry, markPaths } from '../src';

describe('brand', () => {
  it('keeps the working name and the alternative', () => {
    expect(brand.name).toBe('Nowish');
    expect(brand.alternativeName).toBe('Gleichda');
  });

  it('has claims for both locales', () => {
    expect(claims.de.length).toBeGreaterThan(0);
    expect(claims.en.length).toBeGreaterThan(0);
  });

  it('keeps store identifiers neutral until trademark clearance (ADR 0007)', () => {
    expect(identifiers.bundleIdBase.toLowerCase()).not.toContain('nowish');
    expect(identifiers.urlScheme.toLowerCase()).not.toContain('nowish');
  });
});

describe('logo mark', () => {
  it('produces arc, hour hand, arrow shaft and arrow head', () => {
    expect(markPaths()).toHaveLength(4);
  });

  it('leaves a gap on the right side of the circle where the arrow exits', () => {
    const [arc] = markPaths();
    const nums = (arc ?? '').match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    const [sx, sy] = nums;
    const ex = nums.at(-2);
    const ey = nums.at(-1);
    expect(sx).toBeGreaterThan(markGeometry.center.x);
    expect(ex).toBe(sx);
    expect((sy ?? 0) + (ey ?? 0)).toBeCloseTo(2 * markGeometry.center.y, 5);
  });

  it('arrow tip stays inside the canvas so stroke caps are not clipped', () => {
    expect(markGeometry.arrowTip.x + markGeometry.stroke / 2).toBeLessThanOrEqual(100);
  });

  it('is optically centred: stroke bounding box is centred horizontally', () => {
    const { center, radius, stroke, arrowTip } = markGeometry;
    const left = center.x - radius - stroke / 2;
    const right = arrowTip.x + stroke / 2;
    expect((left + right) / 2).toBeCloseTo(50, 0);
  });

  it('renders a valid standalone svg with optional background and padding', () => {
    const svg = logoMarkSvg({ fg: '#C8F031', bg: '#0D0E12' }, 0.18);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('fill="#0D0E12"');
    expect(svg).toContain('stroke="#C8F031"');
    expect(svg).toContain('scale(0.64)');
    expect(() => logoMarkSvg({ fg: '#000000' }, 0.5)).toThrow();
  });
});
