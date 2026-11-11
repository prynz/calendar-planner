import { agendaForDay, type AgendaItem } from '@nowish/demo';
import type { CalendarEvent, DayKey } from '@nowish/domain';

/** The agenda occurrence behind the leave card (event + occurrence day). */
export function agendaBetweenFor(
  events: readonly CalendarEvent[],
  eventId: string,
  occurrenceKey: DayKey,
  timeZone: string,
): AgendaItem | null {
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;
  return agendaForDay([event], occurrenceKey, timeZone).find((i) => i.occurrenceKey === occurrenceKey) ?? null;
}
