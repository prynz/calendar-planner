import type { CalendarEvent, Household } from '@nowish/domain';

import { VIEWER_ID } from '../agenda/presenters';

/** Phase 8 calendar filter: everyone, me, or one household member. */
export type PersonFilter = 'all' | string;

/** Me first, then the other adults and the child profiles of the household. */
export function calendarPeople(h: Household | null): string[] {
  if (!h) return [];
  return [VIEWER_ID, ...h.adultIds.filter((id) => id !== VIEWER_ID), ...h.kids.map((k) => k.id)];
}

/**
 * Whose plan is it? Family assignments (FAM-03) win; otherwise the participants. A plan assigned only to a child
 * is the child's, not mine – even though it is on my calendar.
 */
export function isFor(h: Household | null, e: CalendarEvent, person: PersonFilter): boolean {
  if (person === 'all') return true;
  const assigned = h?.assignments[e.id];
  if (assigned && assigned.length > 0) return assigned.includes(person);
  return e.participantIds.includes(person);
}
