/**
 * The "helper" (Phase 8, ADR 0016): spots plans that do not fit together and offers ready-made fixes.
 * Pure and rule-based – no AI, no network.
 */

const MINUTE = 60_000;

/** One concrete occurrence on the user's own calendar. */
export interface PlannedItem {
  /** Unique per occurrence, e.g. `${eventId}@${occurrenceKey}`. */
  key: string;
  start: Date;
  end: Date;
  allDay: boolean;
  /** When the user has to leave for it; absent when no travel is planned. */
  leaveAt?: Date;
  /** Buffer included in `leaveAt`, in minutes (0 when none). */
  bufferMinutes: number;
}

export type ConflictKind = 'overlap' | 'tight';

export type ConflictFix =
  /** Ask/move the later item by n minutes (rounded up to 5). */
  | { kind: 'shift'; key: string; minutes: number }
  /** Leave the buffer out for the later item – enough when lateness ≤ buffer. */
  | { kind: 'skip-buffer'; key: string; minutes: number };

export interface Conflict {
  kind: ConflictKind;
  /** The earlier item. */
  first: string;
  /** The later item that cannot be reached in time. */
  second: string;
  /** overlap: minutes both run at the same time; tight: minutes the user would be late. */
  minutes: number;
  fixes: ConflictFix[];
}

const ceilTo5 = (n: number) => Math.ceil(n / 5) * 5;

/**
 * Conflicts between timed items, earliest first:
 * - `overlap`: the later item starts before the earlier one ends.
 * - `tight`: no overlap, but leaving for the later item would have to happen before the earlier one ends.
 * All-day items never conflict (they are context, not appointments).
 */
export function findConflicts(items: readonly PlannedItem[]): Conflict[] {
  const timed = items.filter((i) => !i.allDay).sort((a, b) => a.start.getTime() - b.start.getTime());
  const out: Conflict[] = [];
  for (let i = 0; i < timed.length; i++) {
    const a = timed[i];
    if (!a) continue;
    for (let j = i + 1; j < timed.length; j++) {
      const b = timed[j];
      if (!b) continue;
      if (b.start.getTime() >= a.end.getTime()) {
        // Only the next item after `a` ends can be "tight"; later ones have more room.
        const lateMs = a.end.getTime() - (b.leaveAt ?? b.start).getTime();
        if (lateMs > 0) {
          const late = Math.ceil(lateMs / MINUTE);
          const fixes: ConflictFix[] = [{ kind: 'shift', key: b.key, minutes: ceilTo5(late) }];
          if (b.bufferMinutes >= late) fixes.push({ kind: 'skip-buffer', key: b.key, minutes: b.bufferMinutes });
          out.push({ kind: 'tight', first: a.key, second: b.key, minutes: late, fixes });
        }
        break;
      }
      const overlap = Math.ceil((Math.min(a.end.getTime(), b.end.getTime()) - b.start.getTime()) / MINUTE);
      const lateBy = Math.ceil((a.end.getTime() - (b.leaveAt ?? b.start).getTime()) / MINUTE);
      out.push({
        kind: 'overlap',
        first: a.key,
        second: b.key,
        minutes: overlap,
        fixes: [{ kind: 'shift', key: b.key, minutes: ceilTo5(lateBy) }],
      });
    }
  }
  return out;
}

/** A free window between plans. */
export interface FreeGap {
  from: Date;
  to: Date;
  minutes: number;
  /** The item the gap follows (absent at the start of the window). */
  after?: string;
}

/**
 * Free windows of at least `minMinutes` inside [windowStart, windowEnd). Time spent getting ready and travelling
 * counts as busy, so a gap is time the user really has.
 */
export function freeGaps(
  items: readonly PlannedItem[],
  windowStart: Date,
  windowEnd: Date,
  minMinutes = 60,
): FreeGap[] {
  const busy = items
    .filter((i) => !i.allDay)
    .map((i) => ({ key: i.key, from: (i.leaveAt ?? i.start).getTime(), to: i.end.getTime() }))
    .filter((b) => b.to > windowStart.getTime() && b.from < windowEnd.getTime())
    .sort((a, b) => a.from - b.from);
  const out: FreeGap[] = [];
  let cursor = windowStart.getTime();
  let after: string | undefined;
  const push = (to: number) => {
    const m = Math.floor((to - cursor) / MINUTE);
    if (m >= minMinutes)
      out.push({ from: new Date(cursor), to: new Date(to), minutes: m, ...(after ? { after } : {}) });
  };
  for (const b of busy) {
    if (b.from > cursor) push(b.from);
    if (b.to > cursor) {
      cursor = b.to;
      after = b.key;
    }
  }
  if (windowEnd.getTime() > cursor) push(windowEnd.getTime());
  return out;
}
