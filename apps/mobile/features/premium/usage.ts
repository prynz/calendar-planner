import { expandOccurrences, type CalendarEvent, type Group } from '@nowish/domain';

import { VIEWER_ID } from '../agenda/presenters';

const FAR = new Date('2100-01-01T00:00:00Z');

/** Own social events that still have an occurrence ahead – what the Free limit of 5 counts. */
export function activeHostedEvents(events: readonly CalendarEvent[], now: Date): number {
  return events.filter(
    (e) => e.kind === 'social' && e.hostId === VIEWER_ID && expandOccurrences(e, now, FAR).length > 0,
  ).length;
}

/** Groups the viewer belongs to. */
export const myGroups = (groups: readonly Group[]) => groups.filter((g) => g.memberIds.includes(VIEWER_ID)).length;
