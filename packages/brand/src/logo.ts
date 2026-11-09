/**
 * Logo drafts (docs/brand/brand-foundation.md §5). Mark: a clock face that opens on the right –
 * the minute hand becomes an arrow stepping out of the circle ("time to leave").
 * Single-colour by construction, so it works as monochrome / Android themed icon.
 */

export interface MarkColors {
  /** Mark colour. */
  fg: string;
  /** Optional background square (app icon). Omit for transparent. */
  bg?: string;
}

const VIEWBOX = 100;

/** Geometry shared by all renderings (unit square 0..100). */
export const markGeometry = {
  /** Shifted left so the stroke bounding box (circle + arrow) is optically centred. */
  center: { x: 46.5, y: 50 },
  radius: 36,
  stroke: 11,
  /** Half-angle (deg) of the gap on the right where the arrow leaves the circle. */
  gapHalfAngle: 45,
  hourHandEnd: { x: 46.5, y: 28 },
  arrowTip: { x: 89.5, y: 50 },
  arrowHead: 10,
} as const;

function point(angleDeg: number): { x: number; y: number } {
  const { center, radius } = markGeometry;
  const a = (angleDeg * Math.PI) / 180;
  return { x: round(center.x + radius * Math.cos(a)), y: round(center.y + radius * Math.sin(a)) };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** SVG path data of the mark (strokes only). */
export function markPaths(): string[] {
  const { center, radius, gapHalfAngle, hourHandEnd, arrowTip, arrowHead } = markGeometry;
  const start = point(gapHalfAngle);
  const end = point(360 - gapHalfAngle);
  return [
    `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`,
    `M ${center.x} ${center.y} L ${hourHandEnd.x} ${hourHandEnd.y}`,
    `M ${center.x} ${center.y} L ${arrowTip.x} ${arrowTip.y}`,
    `M ${arrowTip.x - arrowHead} ${arrowTip.y - arrowHead} L ${arrowTip.x} ${arrowTip.y} L ${arrowTip.x - arrowHead} ${arrowTip.y + arrowHead}`,
  ];
}

/**
 * Standalone SVG of the mark. `padding` (0..0.4) shrinks the mark inside the canvas, e.g. 0.18 for
 * Android adaptive-icon safe zones.
 */
export function logoMarkSvg({ fg, bg }: MarkColors, padding = 0): string {
  if (padding < 0 || padding > 0.4) throw new Error(`padding must be within 0..0.4, got ${padding}`);
  const scale = round(1 - padding * 2);
  const offset = round(VIEWBOX * padding);
  const paths = markPaths()
    .map((d) => `<path d="${d}"/>`)
    .join('');
  const background = bg ? `<rect width="${VIEWBOX}" height="${VIEWBOX}" fill="${bg}"/>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">${background}` +
    `<g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="${fg}" stroke-width="${markGeometry.stroke}" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`
  );
}
