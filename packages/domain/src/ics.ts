import { displayLocation, displayTitle, type CalendarEvent } from './calendar-event';
import { LIMITS } from './event';
import { NTH_WEEKS, type NthWeek, type Recurrence, type RecurrenceFrequency, type Weekday } from './recurrence';
import { addDays, dayKeyOf, parseDayKey, wallParts, zonedWallTimeToInstant, type DayKey } from './time';

/**
 * ICS import/export (RFC 5545, calendar.md CAL-09). Pure text in, text out – reading and sharing files is
 * the app's job. Only the subset the calendar can represent is imported; everything else is reported per
 * entry instead of silently changing meaning.
 *
 * Export writes `TZID=<IANA zone>` without VTIMEZONE blocks. Google, Apple and Outlook resolve IANA names;
 * full VTIMEZONE output follows with calendar sync in block B3 (ADR 0014).
 */

export const ICS_LIMITS = { bytes: 2_000_000, entries: 2000 } as const;
const UID_DOMAIN = 'nowish.app';

const WEEKDAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const;
const FREQS: Record<string, RecurrenceFrequency> = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

/** Common Windows zone names (Outlook exports) → IANA. Unknown zones fall back to the default zone. */
const WINDOWS_ZONES: Record<string, string> = {
  'W. Europe Standard Time': 'Europe/Berlin',
  'Central Europe Standard Time': 'Europe/Budapest',
  'Central European Standard Time': 'Europe/Warsaw',
  'Romance Standard Time': 'Europe/Paris',
  'GMT Standard Time': 'Europe/London',
  UTC: 'UTC',
};

// ---------------------------------------------------------------------------------------------- export

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
const compactDay = (d: DayKey) => d.replaceAll('-', '');

function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes(),
  )}${pad(d.getUTCSeconds())}Z`;
}

function localStamp(d: Date, timeZone: string): string {
  const w = wallParts(d, timeZone);
  return `${compactDay(dayKeyOf(d, timeZone))}T${pad(w.hour)}${pad(w.minute)}00`;
}

export const escapeIcsText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Lines longer than 75 octets are folded (RFC 5545 §3.1), never inside a UTF-8 character. */
export function foldIcsLine(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let current = '';
  let bytes = 0;
  for (const ch of line) {
    const size = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with one space
    if (bytes + size > limit) {
      out.push(current);
      current = '';
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join('\r\n ');
}

function rruleOf(e: CalendarEvent, r: Recurrence): string {
  const parts = [`FREQ=${r.freq.toUpperCase()}`, `INTERVAL=${r.interval}`];
  if (r.freq === 'weekly' && r.byWeekday && r.byWeekday.length > 0)
    parts.push(`BYDAY=${r.byWeekday.map((d) => WEEKDAY_CODES[d]).join(',')}`);
  if (r.freq === 'monthly' && r.byNthWeekday)
    parts.push(`BYDAY=${r.byNthWeekday.nth}${WEEKDAY_CODES[r.byNthWeekday.weekday]}`);
  if (r.count !== undefined) parts.push(`COUNT=${r.count}`);
  if (r.until !== undefined)
    parts.push(
      `UNTIL=${e.allDay ? compactDay(r.until) : utcStamp(zonedWallTimeToInstant(r.until, 23, 59, e.timeZone))}`,
    );
  return `RRULE:${parts.join(';')}`;
}

function eventLines(e: CalendarEvent, now: Date, locale: 'de' | 'en'): string[] {
  const lines = ['BEGIN:VEVENT', `UID:${e.id}@${UID_DOMAIN}`, `DTSTAMP:${utcStamp(now)}`];
  lines.push(`SUMMARY:${escapeIcsText(displayTitle(e, locale))}`);
  const location = displayLocation(e, locale);
  if (location) lines.push(`LOCATION:${escapeIcsText(location)}`);
  if (e.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${compactDay(dayKeyOf(e.start, e.timeZone))}`);
    lines.push(`DTEND;VALUE=DATE:${compactDay(dayKeyOf(e.end, e.timeZone))}`);
  } else {
    lines.push(`DTSTART;TZID=${e.timeZone}:${localStamp(e.start, e.timeZone)}`);
    lines.push(`DTEND;TZID=${e.timeZone}:${localStamp(e.end, e.timeZone)}`);
  }
  const r = e.recurrence;
  if (r) {
    lines.push(rruleOf(e, r));
    const w = wallParts(e.start, e.timeZone);
    for (const day of r.exdates ?? [])
      lines.push(
        e.allDay
          ? `EXDATE;VALUE=DATE:${compactDay(day)}`
          : `EXDATE;TZID=${e.timeZone}:${compactDay(day)}T${pad(w.hour)}${pad(w.minute)}00`,
      );
  }
  lines.push(`LAST-MODIFIED:${utcStamp(e.updatedAt)}`, 'END:VEVENT');
  return lines;
}

/** One VCALENDAR with all given events; demo titles in `locale`. CRLF line ends as required. */
export function exportIcs(events: readonly CalendarEvent[], now: Date, locale: 'de' | 'en'): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nowish//Prototype//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events.flatMap((e) => eventLines(e, now, locale)),
    'END:VCALENDAR',
  ];
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

// ---------------------------------------------------------------------------------------------- import

export type IcsEntryError = 'no-start' | 'bad-date' | 'end-before-start' | 'no-title' | 'too-long';
export type IcsWarning = 'timezone-assumed' | 'recurrence-simplified' | 'no-end' | 'shortened';
export type IcsFileError = 'too-large' | 'not-calendar' | 'empty' | 'too-many';

/** What becomes a calendar entry; the app adds id, category and bookkeeping. */
export interface ImportedEvent {
  uid: string;
  title: string;
  location: string;
  start: Date;
  end: Date;
  allDay: boolean;
  timeZone: string;
  recurrence?: Recurrence;
}

export type IcsEntry =
  | { index: number; uid: string; ok: true; event: ImportedEvent; warnings: IcsWarning[] }
  | { index: number; uid: string; ok: false; error: IcsEntryError; title?: string };

export type IcsParseResult =
  { ok: true; entries: IcsEntry[]; skippedCancelled: number } | { ok: false; error: IcsFileError };

interface Property {
  name: string;
  params: Record<string, string>;
  value: string;
}

function parseProperty(line: string): Property | null {
  // Name and parameters end at the first ':' outside double quotes.
  let inQuotes = false;
  let split = -1;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ':' && !inQuotes) {
      split = i;
      break;
    }
  }
  if (split <= 0) return null;
  const [name = '', ...rawParams] = line.slice(0, split).split(';');
  const params: Record<string, string> = {};
  for (const p of rawParams) {
    const eq = p.indexOf('=');
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, '');
  }
  return { name: name.toUpperCase(), params, value: line.slice(split + 1) };
}

export const unescapeIcsText = (s: string) =>
  s.replace(/\\(n|N|,|;|\\)/g, (_, c: string) => (c === 'n' || c === 'N' ? '\n' : c));

function validZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
}

interface ParsedTime {
  allDay: boolean;
  day: DayKey;
  hour: number;
  minute: number;
  /** `Z` suffix: an absolute instant. */
  utc: boolean;
  tzid?: string;
}

function parseTime(p: Property): ParsedTime | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(p.value.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, , z] = m;
  const day = `${y}-${mo}-${d}`;
  try {
    parseDayKey(day);
  } catch (error) {
    if (error instanceof Error) return null;
    throw error;
  }
  if (h === undefined || p.params.VALUE === 'DATE') return { allDay: true, day, hour: 0, minute: 0, utc: false };
  const hour = Number(h);
  const minute = Number(mi);
  if (hour > 23 || minute > 59) return null;
  return { allDay: false, day, hour, minute, utc: z === 'Z', ...(p.params.TZID ? { tzid: p.params.TZID } : {}) };
}

function resolveZone(tzid: string | undefined, fallback: string): { zone: string; assumed: boolean } {
  if (!tzid) return { zone: fallback, assumed: false };
  const cleaned = tzid.replace(/^\//, '');
  if (validZone(cleaned)) return { zone: cleaned, assumed: false };
  const mapped = WINDOWS_ZONES[cleaned];
  if (mapped) return { zone: mapped, assumed: false };
  return { zone: fallback, assumed: true };
}

function toInstant(t: ParsedTime, zone: string): Date {
  if (t.allDay) return zonedWallTimeToInstant(t.day, 0, 0, zone);
  if (t.utc) {
    const { year, month, dayOfMonth } = parseDayKey(t.day);
    return new Date(Date.UTC(year, month - 1, dayOfMonth, t.hour, t.minute));
  }
  return zonedWallTimeToInstant(t.day, t.hour, t.minute, zone);
}

/** ISO 8601 durations as used by DURATION (P1D, PT1H30M, P1W). */
function durationMinutes(v: string): number | null {
  const m = /^\+?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v.trim());
  if (!m || v.trim() === 'P' || v.trim() === 'PT') return null;
  const [, w, d, h, mi] = m;
  return (Number(w ?? 0) * 7 + Number(d ?? 0)) * 1440 + Number(h ?? 0) * 60 + Number(mi ?? 0);
}

function parseRrule(value: string, zone: string): { recurrence?: Recurrence; simplified: boolean } {
  const parts = new Map(
    value.split(';').map((kv) => {
      const [k = '', v = ''] = kv.split('=');
      return [k.toUpperCase(), v.toUpperCase()] as const;
    }),
  );
  const freq = FREQS[parts.get('FREQ') ?? ''];
  if (!freq) return { simplified: true };
  const known = new Set(['FREQ', 'INTERVAL', 'COUNT', 'UNTIL', 'BYDAY', 'WKST']);
  if ([...parts.keys()].some((k) => !known.has(k))) return { simplified: true };
  const interval = Number(parts.get('INTERVAL') ?? '1');
  if (!Number.isInteger(interval) || interval < 1 || interval > LIMITS.interval) return { simplified: true };
  const r: { -readonly [K in keyof Recurrence]: Recurrence[K] } = { freq, interval };
  const count = parts.get('COUNT');
  if (count !== undefined) {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1 || n > LIMITS.count) return { simplified: true };
    r.count = n;
  }
  const until = parts.get('UNTIL');
  if (until !== undefined) {
    const t = parseTime({ name: 'UNTIL', params: {}, value: until });
    if (!t) return { simplified: true };
    r.until = t.allDay ? t.day : dayKeyOf(toInstant(t, 'UTC'), zone);
  }
  const byday = parts.get('BYDAY');
  if (byday !== undefined) {
    const codes = byday.split(',');
    if (freq === 'weekly') {
      const days = codes.map((c) => WEEKDAY_CODES.indexOf(c as (typeof WEEKDAY_CODES)[number]));
      if (days.some((d) => d < 0)) return { simplified: true };
      r.byWeekday = days as Weekday[]; // indices 0–6 checked above
    } else if (freq === 'monthly' && codes.length === 1) {
      const m = /^([+-]?\d)(MO|TU|WE|TH|FR|SA|SU)$/.exec(codes[0] ?? '');
      const nth = NTH_WEEKS.find((n) => n === Number(m?.[1]));
      if (!m || nth === undefined) return { simplified: true };
      r.byNthWeekday = {
        weekday: WEEKDAY_CODES.indexOf(m[2] as (typeof WEEKDAY_CODES)[number]) as Weekday,
        nth: nth as NthWeek,
      };
    } else return { simplified: true };
  }
  return { recurrence: r, simplified: false };
}

function buildEntry(index: number, props: Property[], defaultZone: string): IcsEntry {
  const get = (n: string) => props.find((p) => p.name === n);
  const uid = get('UID')?.value.trim() || `no-uid-${index}`;
  const rawTitle = unescapeIcsText(get('SUMMARY')?.value ?? '').trim();
  const fail = (error: IcsEntryError): IcsEntry => ({
    index,
    uid,
    ok: false,
    error,
    ...(rawTitle ? { title: rawTitle } : {}),
  });
  if (!rawTitle) return fail('no-title');
  const warnings: IcsWarning[] = [];
  const startProp = get('DTSTART');
  if (!startProp) return fail('no-start');
  const start = parseTime(startProp);
  if (!start) return fail('bad-date');
  const { zone, assumed } = start.utc ? { zone: defaultZone, assumed: false } : resolveZone(start.tzid, defaultZone);
  if (assumed) warnings.push('timezone-assumed');
  const startAt = toInstant(start, zone);

  let endAt: Date;
  const endProp = get('DTEND');
  const durProp = get('DURATION');
  if (endProp) {
    const end = parseTime(endProp);
    if (!end || end.allDay !== start.allDay) return fail('bad-date');
    endAt = toInstant(end, end.utc ? zone : resolveZone(end.tzid ?? start.tzid, defaultZone).zone);
  } else if (durProp) {
    const min = durationMinutes(durProp.value);
    if (min === null) return fail('bad-date');
    endAt = start.allDay
      ? zonedWallTimeToInstant(addDays(start.day, Math.max(1, Math.round(min / 1440))), 0, 0, zone)
      : new Date(startAt.getTime() + min * 60_000);
  } else {
    // RFC 5545: no end means one day (dates) or a point in time; a point is shown as one hour.
    if (!start.allDay) warnings.push('no-end');
    endAt = start.allDay
      ? zonedWallTimeToInstant(addDays(start.day, 1), 0, 0, zone)
      : new Date(startAt.getTime() + 3_600_000);
  }
  if (endAt.getTime() <= startAt.getTime()) return fail('end-before-start');
  if (start.allDay && Math.round((endAt.getTime() - startAt.getTime()) / 86_400_000) > LIMITS.days)
    return fail('too-long');

  let title = rawTitle;
  if (title.length > LIMITS.title) {
    title = title.slice(0, LIMITS.title);
    warnings.push('shortened');
  }
  let location = unescapeIcsText(get('LOCATION')?.value ?? '').trim();
  if (location.length > LIMITS.location) {
    location = location.slice(0, LIMITS.location);
    if (!warnings.includes('shortened')) warnings.push('shortened');
  }

  let recurrence: Recurrence | undefined;
  const rrule = get('RRULE');
  if (rrule) {
    const parsed = parseRrule(rrule.value, zone);
    if (parsed.simplified) warnings.push('recurrence-simplified');
    if (parsed.recurrence) {
      const exdates = props
        .filter((p) => p.name === 'EXDATE')
        .flatMap((p) => p.value.split(',').map((v) => parseTime({ ...p, value: v })))
        .filter((t): t is ParsedTime => t !== null)
        .map((t) => (t.allDay ? t.day : dayKeyOf(toInstant(t, t.utc ? 'UTC' : zone), zone)));
      recurrence = { ...parsed.recurrence, ...(exdates.length > 0 ? { exdates: [...new Set(exdates)] } : {}) };
    }
  }

  return {
    index,
    uid,
    ok: true,
    warnings,
    event: {
      uid,
      title,
      location,
      start: startAt,
      end: endAt,
      allDay: start.allDay,
      timeZone: zone,
      ...(recurrence ? { recurrence } : {}),
    },
  };
}

/** Parses a calendar file. Errors are reported per entry; one bad entry never stops the import. */
export function parseIcs(text: string, defaultZone: string): IcsParseResult {
  if (new TextEncoder().encode(text).length > ICS_LIMITS.bytes) return { ok: false, error: 'too-large' };
  const lines = text
    .replace(/^\uFEFF/, '')
    .replace(/\r?\n[ \t]/g, '')
    .split(/\r?\n/);
  if (!lines.some((l) => l.trim().toUpperCase() === 'BEGIN:VCALENDAR')) return { ok: false, error: 'not-calendar' };
  const entries: IcsEntry[] = [];
  let skippedCancelled = 0;
  let current: Property[] | null = null;
  let nested = 0;
  const overrides: { seriesUid: string; recurrenceId: Property }[] = [];
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) continue;
    const upper = line.toUpperCase();
    if (upper === 'BEGIN:VEVENT') {
      current = [];
      nested = 0;
      continue;
    }
    if (current === null) continue;
    if (upper.startsWith('BEGIN:')) {
      nested += 1; // e.g. VALARM inside an event – not imported
      continue;
    }
    if (upper.startsWith('END:') && nested > 0) {
      nested -= 1;
      continue;
    }
    if (upper === 'END:VEVENT') {
      const props: Property[] = current;
      current = null;
      if (props.find((p) => p.name === 'STATUS')?.value.toUpperCase() === 'CANCELLED') {
        skippedCancelled += 1;
        continue;
      }
      const recurrenceId = props.find((p) => p.name === 'RECURRENCE-ID');
      if (entries.length >= ICS_LIMITS.entries) return { ok: false, error: 'too-many' };
      if (recurrenceId) {
        // A changed occurrence of a series: imported as its own single entry, the series skips that day.
        const seriesUid = props.find((p) => p.name === 'UID')?.value.trim() ?? '';
        overrides.push({ seriesUid, recurrenceId });
        const single = props
          .filter((p) => p.name !== 'RRULE' && p.name !== 'EXDATE')
          .map((p) => (p.name === 'UID' ? { ...p, value: `${p.value.trim()}#${recurrenceId.value.trim()}` } : p));
        entries.push(buildEntry(entries.length, single, defaultZone));
      } else entries.push(buildEntry(entries.length, props, defaultZone));
      continue;
    }
    if (nested > 0) continue;
    const p = parseProperty(line);
    if (p) current.push(p);
  }
  if (entries.length === 0 && skippedCancelled === 0) return { ok: false, error: 'empty' };
  return { ok: true, entries: entries.map((e) => withOverrides(e, overrides)), skippedCancelled };
}

function withOverrides(e: IcsEntry, overrides: readonly { seriesUid: string; recurrenceId: Property }[]): IcsEntry {
  if (!e.ok || !e.event.recurrence) return e;
  const { event } = e;
  const days = overrides
    .filter((o) => o.seriesUid === e.uid)
    .map((o) => parseTime(o.recurrenceId))
    .filter((t): t is ParsedTime => t !== null)
    .map((t) => (t.allDay ? t.day : dayKeyOf(toInstant(t, t.utc ? 'UTC' : event.timeZone), event.timeZone)));
  if (days.length === 0) return e;
  const r = event.recurrence;
  if (!r) return e;
  return { ...e, event: { ...event, recurrence: { ...r, exdates: [...new Set([...(r.exdates ?? []), ...days])] } } };
}

/** Stable event id for an imported UID: our own exports map back to the original event (no duplicates). */
export function icsEventId(uid: string): string {
  const own = new RegExp(`^(.+)@${UID_DOMAIN.replace('.', '\\.')}$`).exec(uid);
  if (own?.[1]) return own[1];
  let h = 0x811c9dc5; // FNV-1a, 32 bit
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `ics-${h.toString(36)}-${uid.length.toString(36)}`;
}
