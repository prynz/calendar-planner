import { weekdayOf } from '../recurrence';
import { addDays, type DayKey } from '../time';

/**
 * One-line quick entry (Phase 8): "Freitag 19 Uhr Grillen bei Tom" → title, day, time, place.
 * Rule-based for German and English; anything not recognised stays in the title, nothing is guessed silently.
 */
export interface QuickEntry {
  title: string;
  day?: DayKey;
  /** Minutes after local midnight. */
  startMinute?: number;
  location?: string;
}

const WEEKDAYS: Record<string, number> = {
  montag: 0,
  monday: 0,
  mo: 0,
  mon: 0,
  dienstag: 1,
  tuesday: 1,
  di: 1,
  tue: 1,
  mittwoch: 2,
  wednesday: 2,
  mi: 2,
  wed: 2,
  donnerstag: 3,
  thursday: 3,
  do: 3,
  thu: 3,
  freitag: 4,
  friday: 4,
  fr: 4,
  fri: 4,
  samstag: 5,
  saturday: 5,
  sa: 5,
  sat: 5,
  sonntag: 6,
  sunday: 6,
  so: 6,
  sun: 6,
};
const RELATIVE: Record<string, number> = { heute: 0, today: 0, morgen: 1, tomorrow: 1, übermorgen: 2 };

// Lookarounds instead of \b so that umlauts ("übermorgen") count as letters.
/** A day word plus the little words that belong to it ("am Freitag", "on Friday", "nächsten Montag"). */
const dayWord = (w: string) =>
  new RegExp(`(?<![\\p{L}\\d])(?:(?:am|on|nächsten|next|this|diesen)\\s+)?${w}(?![\\p{L}\\d])\\.?`, 'iu');

function takeDay(text: string, today: DayKey): { day?: DayKey; rest: string } {
  for (const [w, offset] of Object.entries(RELATIVE).sort((a, b) => b[0].length - a[0].length)) {
    const re = dayWord(w);
    if (re.test(text)) return { day: addDays(today, offset), rest: text.replace(re, ' ') };
  }
  // Long names first, then the short forms – "so" and "do" only count next to a time to avoid
  // eating words like "so" in "so 20 Uhr".
  const names = Object.keys(WEEKDAYS).sort((a, b) => b.length - a.length);
  for (const w of names) {
    const re = dayWord(w);
    if (!re.test(text)) continue;
    if (w.length <= 3 && !/\d/.test(text)) continue;
    const target = WEEKDAYS[w] ?? 0;
    // The next such weekday, today included.
    const delta = (target - weekdayOf(today) + 7) % 7;
    return { day: addDays(today, delta), rest: text.replace(re, ' ') };
  }
  const date = /(?<![\d.])(\d{1,2})\.(\d{1,2})\.(\d{4})?(?![\d])/.exec(text);
  if (date) {
    const [all, d, m, y] = date;
    const year = y ? Number(y) : Number(today.slice(0, 4));
    let key = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    // Without a year: the next such date, never one in the past.
    if (!y && key < today) key = `${year + 1}${key.slice(4)}`;
    if (isValidDay(key)) return { day: key, rest: text.replace(all, ' ') };
  }
  return { rest: text };
}

function isValidDay(key: string): boolean {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function takeTime(text: string): { minute?: number; rest: string } {
  const patterns: [RegExp, (m: RegExpExecArray) => number | null][] = [
    // 19:30, 8.15 (German style), optionally followed by "Uhr"/"h"
    [
      /(?<![\d.])(?:(?:um|at|ab|from)\s+)?([01]?\d|2[0-3])[:.]([0-5]\d)(?:\s*(?:uhr|h))?(?![\d])/i,
      (m) => Number(m[1]) * 60 + Number(m[2]),
    ],
    // 7pm, 7:30am
    [
      /(?<!\d)(?:(?:at|from)\s+)?(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)(?![\p{L}])/iu,
      (m) => ((Number(m[1]) % 12) + (m[3]?.toLowerCase() === 'pm' ? 12 : 0)) * 60 + Number(m[2] ?? 0),
    ],
    // 19 Uhr, 19h, um 7
    [/(?<![\d.])(?:(?:um|ab)\s+)?([01]?\d|2[0-3])\s*(?:uhr|h)(?![\p{L}])/iu, (m) => Number(m[1]) * 60],
    [/(?<![\p{L}])(?:um|at)\s+([01]?\d|2[0-3])(?![\d:.])/iu, (m) => Number(m[1]) * 60],
  ];
  for (const [re, toMinute] of patterns) {
    const m = re.exec(text);
    if (!m) continue;
    const minute = toMinute(m);
    if (minute === null) continue;
    return { minute, rest: text.replace(m[0], ' ') };
  }
  return { rest: text };
}

function takeLocation(text: string): { location?: string; rest: string } {
  const m = /(?:^|\s)(bei|im|in der|in|am|at|@)\s+(.+)$/iu.exec(text);
  if (!m || !m[2]) return { rest: text };
  const location = `${m[1] === '@' ? '' : `${m[1]} `}${m[2].trim()}`.trim();
  return { location, rest: text.slice(0, m.index) };
}

export function parseQuickEntry(input: string, today: DayKey): QuickEntry {
  const day = takeDay(input, today);
  const time = takeTime(day.rest);
  const place = takeLocation(time.rest);
  const title = place.rest
    .replace(/(?<![\p{L}])(um|at|on|am)\s*$/iu, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,–-]+|[\s,–-]+$/g, '');
  return {
    title,
    ...(day.day ? { day: day.day } : {}),
    ...(time.minute !== undefined ? { startMinute: time.minute } : {}),
    ...(place.location ? { location: place.location } : {}),
  };
}
