import { addDays, dayKeyOf, type DayKey } from './time';

/**
 * The viewer's own way to one appointment occurrence (anti-chaos-engine.md §1, §4, §5): when they
 * planned to leave, when they actually tapped "on my way", and whether they announced being late.
 * Private by design – only the owner ever sees it; it can be deleted at any time.
 */
export interface Journey {
  /** `${eventId}|${occurrenceKey}` */
  id: string;
  eventId: string;
  occurrenceKey: DayKey;
  plannedLeaveAt: Date;
  /** "On my way" tapped (in the app or from the reminder). */
  leftAt?: Date;
  /** "I'm running late" – announced extra minutes. */
  lateMinutes?: number;
  lateAnnouncedAt?: Date;
  /** Ready-check items ticked off (ids from `readyItems`). */
  checked: string[];
}

export const LATE_OPTIONS = [5, 10, 15, 30] as const;
export type LateOption = (typeof LATE_OPTIONS)[number];

const MINUTE = 60_000;

export const journeyId = (eventId: string, occurrenceKey: DayKey) => `${eventId}|${occurrenceKey}`;

export function newJourney(eventId: string, occurrenceKey: DayKey, plannedLeaveAt: Date): Journey {
  return { id: journeyId(eventId, occurrenceKey), eventId, occurrenceKey, plannedLeaveAt, checked: [] };
}

/** "On my way". Repeated taps keep the first time – that is the signal buffer learning uses. */
export function markLeft(j: Journey, at: Date): Journey {
  return j.leftAt ? j : { ...j, leftAt: at };
}

export function announceLate(j: Journey, minutes: number, at: Date): Journey {
  if (!(LATE_OPTIONS as readonly number[]).includes(minutes)) throw new Error(`Unsupported late option ${minutes}`);
  return { ...j, lateMinutes: minutes, lateAnnouncedAt: at };
}

export function toggleChecked(j: Journey, itemId: string): Journey {
  return {
    ...j,
    checked: j.checked.includes(itemId) ? j.checked.filter((x) => x !== itemId) : [...j.checked, itemId],
  };
}

/** Minutes the viewer left after the plan (negative = early); undefined until "on my way". */
export function departureDelay(j: Journey): number | undefined {
  return j.leftAt ? Math.round((j.leftAt.getTime() - j.plannedLeaveAt.getTime()) / MINUTE) : undefined;
}

/** Up to 2 minutes after the planned time still counts as on time – nobody leaves to the second. */
export const ON_TIME_TOLERANCE_MIN = 2;

export function wasOnTime(j: Journey): boolean | undefined {
  if (j.lateMinutes !== undefined) return false;
  const d = departureDelay(j);
  return d === undefined ? undefined : d <= ON_TIME_TOLERANCE_MIN;
}

// ------------------------------------------------------------------------------------- buffer learning

export const BUFFER_LEARNING = {
  /** EWMA smoothing (anti-chaos-engine.md §1). */
  alpha: 0.3,
  max: 20,
  step: 5,
  /** Below this many departures the fixed buffer is used. */
  minSamples: 3,
  /** Outliers (forgot to tap, left an hour late) are capped so one day cannot dominate. */
  sampleCap: 30,
} as const;

export interface LearnedBuffer {
  /** Buffer to plan with, in minutes (multiple of 5, 0–20). */
  minutes: number;
  samples: number;
}

/**
 * dawdle_buffer = clamp(EWMA(delay when leaving, α = 0.3), 0, 20), rounded to 5 minutes. The current buffer is
 * already included in the plan, so the learned value is `currentBuffer + EWMA(delay)`. Returns null with too
 * few departures – the fixed buffer applies then.
 */
export function learnBuffer(journeys: readonly Journey[], currentBuffer: number): LearnedBuffer | null {
  const delays = journeys
    .filter((j) => j.leftAt)
    .sort((a, b) => a.plannedLeaveAt.getTime() - b.plannedLeaveAt.getTime())
    .map((j) => Math.max(-BUFFER_LEARNING.sampleCap, Math.min(BUFFER_LEARNING.sampleCap, departureDelay(j) ?? 0)));
  if (delays.length < BUFFER_LEARNING.minSamples) return null;
  let ewma = delays[0] ?? 0;
  for (const d of delays.slice(1)) ewma = BUFFER_LEARNING.alpha * d + (1 - BUFFER_LEARNING.alpha) * ewma;
  const raw = Math.min(BUFFER_LEARNING.max, Math.max(0, currentBuffer + ewma));
  return { minutes: Math.round(raw / BUFFER_LEARNING.step) * BUFFER_LEARNING.step, samples: delays.length };
}

// ------------------------------------------------------------------------------------ punctuality

export type DayPunctuality = 'on-time' | 'late' | 'mixed';

export interface PunctualityReport {
  onTime: number;
  total: number;
  /** Per local day of the planned departure – for the heatmap. */
  byDay: Record<DayKey, { onTime: number; total: number; state: DayPunctuality }>;
}

/** Private, positive-only summary of the departures in [from, toExclusive) (anti-chaos-engine.md §5). */
export function punctuality(
  journeys: readonly Journey[],
  from: DayKey,
  toExclusive: DayKey,
  timeZone: string,
): PunctualityReport {
  const report: PunctualityReport = { onTime: 0, total: 0, byDay: {} };
  for (const j of journeys) {
    const ok = wasOnTime(j);
    if (ok === undefined) continue;
    const day = dayKeyOf(j.plannedLeaveAt, timeZone);
    if (day < from || day >= toExclusive) continue;
    report.total += 1;
    if (ok) report.onTime += 1;
    const d = report.byDay[day] ?? { onTime: 0, total: 0, state: 'on-time' as DayPunctuality };
    d.total += 1;
    if (ok) d.onTime += 1;
    d.state = d.onTime === d.total ? 'on-time' : d.onTime === 0 ? 'late' : 'mixed';
    report.byDay[day] = d;
  }
  return report;
}

/** First day of the month containing `day` and the first day of the next month. */
export function monthRange(day: DayKey): { from: DayKey; toExclusive: DayKey } {
  const from = `${day.slice(0, 8)}01`;
  let next = addDays(from, 27);
  while (next.slice(5, 7) === from.slice(5, 7)) next = addDays(next, 1);
  return { from, toExclusive: next };
}
