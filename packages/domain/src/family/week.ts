import { addDays, dayKeyOf, type DayKey } from '../time';
import { householdMemberIds } from './household';
import type { Household } from './model';
import type { FamilyOccurrence } from './rides';

/**
 * Members an occurrence concerns: the explicit assignment, otherwise the household members taking part.
 */
export function membersOf(h: Household, item: FamilyOccurrence): string[] {
  const assigned = h.assignments[item.event.id];
  if (assigned) return assigned;
  const members = householdMemberIds(h);
  return item.event.participantIds.filter((id) => members.includes(id));
}

export interface FamilyDay {
  day: DayKey;
  /** memberId → number of appointments. */
  byMember: Record<string, number>;
  total: number;
}

/** FAM-09: load per day for the week starting at `from` (only appointments that concern the family). */
export function familyWeek(
  h: Household,
  items: readonly FamilyOccurrence[],
  from: DayKey,
  timeZone: string,
  days = 7,
): FamilyDay[] {
  const out: FamilyDay[] = Array.from({ length: days }, (_, i) => ({ day: addDays(from, i), byMember: {}, total: 0 }));
  for (const item of items) {
    const members = membersOf(h, item);
    if (members.length === 0) continue;
    const slot = out.find((d) => d.day === dayKeyOf(item.start, timeZone));
    if (!slot) continue;
    slot.total += 1;
    for (const m of members) slot.byMember[m] = (slot.byMember[m] ?? 0) + 1;
  }
  return out;
}

/** A day counts as "full" from this many family appointments – shown, never judged. */
export const FULL_DAY = 3;
