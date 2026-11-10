import {
  EVENT_CATEGORIES,
  RECURRENCE_FREQUENCIES,
  TRAVEL_MODES,
  type CalendarEvent,
  type Recurrence,
  type Weekday,
} from '@nowish/domain';

/** JSON shape on disk: dates as ISO strings. Version bump = migration in sqlite-event-repository.ts. */
export const EVENT_JSON_VERSION = 1;

export function serializeEvent(e: CalendarEvent): string {
  return JSON.stringify({
    ...e,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  });
}

class CorruptEventError extends Error {
  constructor(field: string) {
    super(`Stored event has an invalid "${field}"`);
    this.name = 'CorruptEventError';
  }
}

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (o: Json, k: string): string => {
  const v = o[k];
  if (typeof v !== 'string') throw new CorruptEventError(k);
  return v;
};
const num = (o: Json, k: string): number => {
  const v = o[k];
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new CorruptEventError(k);
  return v;
};
const date = (o: Json, k: string): Date => {
  const d = new Date(str(o, k));
  if (Number.isNaN(d.getTime())) throw new CorruptEventError(k);
  return d;
};
const oneOf = <T extends string>(o: Json, k: string, values: readonly T[]): T => {
  const v = str(o, k);
  if (!(values as readonly string[]).includes(v)) throw new CorruptEventError(k);
  return v as T; // narrowed by the includes() check above
};
const i18n = (o: Json, k: string) => {
  const v = o[k];
  if (v === undefined) return undefined;
  if (!isObj(v)) throw new CorruptEventError(k);
  return { de: str(v, 'de'), en: str(v, 'en') };
};

function recurrence(v: unknown): Recurrence | undefined {
  if (v === undefined) return undefined;
  if (!isObj(v)) throw new CorruptEventError('recurrence');
  const byWeekday = v.byWeekday;
  const exdates = v.exdates;
  return {
    freq: oneOf(v, 'freq', RECURRENCE_FREQUENCIES),
    interval: num(v, 'interval'),
    ...(Array.isArray(byWeekday)
      ? { byWeekday: byWeekday.filter((d): d is Weekday => Number.isInteger(d) && d >= 0 && d <= 6) }
      : {}),
    ...(typeof v.until === 'string' ? { until: v.until } : {}),
    ...(typeof v.count === 'number' ? { count: v.count } : {}),
    ...(Array.isArray(exdates) ? { exdates: exdates.filter((d): d is string => typeof d === 'string') } : {}),
  };
}

/** Parses and validates one stored event; throws `CorruptEventError` instead of returning bad data. */
export function deserializeEvent(json: string): CalendarEvent {
  const raw: unknown = JSON.parse(json);
  if (!isObj(raw)) throw new CorruptEventError('(root)');
  const travel = raw.travel;
  const participantIds = raw.participantIds;
  if (!Array.isArray(participantIds) || !participantIds.every((p) => typeof p === 'string'))
    throw new CorruptEventError('participantIds');
  const titleI18n = i18n(raw, 'titleI18n');
  const locationI18n = i18n(raw, 'locationI18n');
  const rec = recurrence(raw.recurrence);
  return {
    id: str(raw, 'id'),
    kind: oneOf(raw, 'kind', ['appointment', 'social'] as const),
    title: str(raw, 'title'),
    location: str(raw, 'location'),
    category: oneOf(raw, 'category', EVENT_CATEGORIES),
    start: date(raw, 'start'),
    end: date(raw, 'end'),
    allDay: raw.allDay === true,
    timeZone: str(raw, 'timeZone'),
    prepMinutes: num(raw, 'prepMinutes'),
    arrivalMarginMinutes: num(raw, 'arrivalMarginMinutes'),
    participantIds,
    isDemo: raw.isDemo === true,
    createdAt: date(raw, 'createdAt'),
    updatedAt: date(raw, 'updatedAt'),
    ...(titleI18n ? { titleI18n } : {}),
    ...(locationI18n ? { locationI18n } : {}),
    ...(rec ? { recurrence: rec } : {}),
    ...(isObj(travel)
      ? { travel: { mode: oneOf(travel, 'mode', TRAVEL_MODES), minutes: num(travel, 'minutes') } }
      : {}),
    ...(typeof raw.hostId === 'string' ? { hostId: raw.hostId } : {}),
  };
}
