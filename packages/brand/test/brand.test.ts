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

  // Phase 7 minimum-size check: at 16 px (favicon, notification icon) strokes need ~1 px of air between them,
  // otherwise the hand merges with the ring and the arrow head touches the circle.
  describe('stays legible at 16 px', () => {
    const PX = 16 / 100;
    const { center, radius, stroke, gapHalfAngle, hourHandEnd, arrowTip, arrowHead } = markGeometry;
    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

    it('stroke is at least 1.5 px wide', () => {
      expect(stroke * PX).toBeGreaterThanOrEqual(1.5);
    });

    it('hour hand ends clear of the ring', () => {
      const ringInner = center.y - radius + stroke / 2;
      const handTop = hourHandEnd.y - stroke / 2;
      expect((handTop - ringInner) * PX).toBeGreaterThanOrEqual(1);
    });

    it('arrow head stays clear of the ring ends', () => {
      const a = (gapHalfAngle * Math.PI) / 180;
      const ringEnd = { x: center.x + radius * Math.cos(a), y: center.y - radius * Math.sin(a) };
      const headEnd = { x: arrowTip.x - arrowHead, y: arrowTip.y - arrowHead };
      expect((dist(ringEnd, headEnd) - stroke) * PX).toBeGreaterThanOrEqual(1);
    });
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
