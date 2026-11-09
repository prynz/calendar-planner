/**
 * Time-zone helpers built on Intl only (works in Hermes, Node, browsers, Deno).
 * Instants are `Date` (UTC); wall-clock values are interpreted in an IANA zone.
 */

const MINUTE = 60_000;
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A calendar day in a zone, formatted `YYYY-MM-DD`. */
export type DayKey = string;

interface WallParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = partsFormatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    partsFormatterCache.set(timeZone, f);
  }
  return f;
}

/** Wall-clock parts of an instant in a zone. */
export function wallParts(instant: Date, timeZone: string): WallParts {
  const map: Record<string, number> = {};
  for (const p of partsFormatter(timeZone).formatToParts(instant)) {
    if (p.type !== 'literal') map[p.type] = Number(p.value);
  }
  const get = (k: string) => {
    const v = map[k];
    if (v === undefined || Number.isNaN(v)) throw new Error(`Intl did not return "${k}" for ${timeZone}`);
    return v;
  };
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') % 24, minute: get('minute') };
}

/** Offset of `timeZone` from UTC at `instant`, in minutes (Berlin summer: +120). */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const p = wallParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  const truncated = Math.floor(instant.getTime() / MINUTE) * MINUTE;
  return Math.round((asUtc - truncated) / MINUTE);
}

/**
 * Converts a wall-clock time in `timeZone` to an instant. For times skipped by a DST jump the
 * result moves forward by the gap; for repeated times the earlier instant is returned.
 */
export function zonedWallTimeToInstant(day: DayKey, hour: number, minute: number, timeZone: string): Date {
  const { year, month, dayOfMonth } = parseDayKey(day);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error(`Invalid time ${hour}:${minute}`);
  const naive = Date.UTC(year, month - 1, dayOfMonth, hour, minute);
  // Offsets a day before/after bracket any DST transition on this day.
  const before = zoneOffsetMinutes(new Date(naive - 86_400_000), timeZone);
  const after = zoneOffsetMinutes(new Date(naive + 86_400_000), timeZone);
  const valid = [...new Set([before, after])]
    .map((offset) => naive - offset * MINUTE)
    .filter((candidate) => naive - zoneOffsetMinutes(new Date(candidate), timeZone) * MINUTE === candidate);
  // Repeated wall time → earlier instant. Skipped wall time (gap) → shift forward by the gap.
  return new Date(valid.length > 0 ? Math.min(...valid) : naive - before * MINUTE);
}

export function parseDayKey(day: DayKey): { year: number; month: number; dayOfMonth: number } {
  const m = DAY_RE.exec(day);
  if (!m) throw new Error(`Invalid day key "${day}"`);
  const year = Number(m[1]);
  const month = Number(m[2]);
  const dayOfMonth = Number(m[3]);
  const check = new Date(Date.UTC(year, month - 1, dayOfMonth));
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== dayOfMonth) throw new Error(`Invalid date "${day}"`);
  return { year, month, dayOfMonth };
}

/** Calendar day of an instant in a zone. */
export function dayKeyOf(instant: Date, timeZone: string): DayKey {
  const p = wallParts(instant, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Adds whole calendar days to a day key (zone independent). */
export function addDays(day: DayKey, days: number): DayKey {
  const { year, month, dayOfMonth } = parseDayKey(day);
  const d = new Date(Date.UTC(year, month - 1, dayOfMonth + days));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Instant of local midnight starting `day` in `timeZone`. */
export function startOfDay(day: DayKey, timeZone: string): Date {
  return zonedWallTimeToInstant(day, 0, 0, timeZone);
}

/** Representative instant (local noon) – safe for formatting a day's weekday/date in its zone. */
export function noonOf(day: DayKey, timeZone: string): Date {
  return zonedWallTimeToInstant(day, 12, 0, timeZone);
}

const pad = (n: number) => String(n).padStart(2, '0');
