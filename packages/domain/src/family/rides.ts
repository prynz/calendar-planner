import type { CalendarEvent } from '../calendar-event';
import type { DayKey } from '../time';
import { assignedTo, isAdult, kidById, requireAdult } from './household';
import { FamilyError, RIDE_LEGS, type Household, type Ride, type RideLeg } from './model';

/** One occurrence in the calendar (structurally the demo package's AgendaItem). */
export interface FamilyOccurrence {
  event: CalendarEvent;
  occurrenceKey: DayKey;
  start: Date;
  end: Date;
}

export interface RideSlot {
  item: FamilyOccurrence;
  kidIds: string[];
  legs: Record<RideLeg, Ride>;
}

/** Minutes around the start/end an adult is busy with a ride (on top of the travel time). */
export const RIDE_MARGIN_MIN = 15;

const rideOf = (h: Household, eventId: string, occurrenceKey: DayKey, leg: RideLeg): Ride =>
  h.rides.find((r) => r.eventId === eventId && r.occurrenceKey === occurrenceKey && r.leg === leg) ?? {
    eventId,
    occurrenceKey,
    leg,
  };

/**
 * Children need a ride to timed appointments that are theirs and happen somewhere (a location is set).
 * All-day entries, appointments at home ("no location") and family outings where an adult of the
 * household is assigned too (they go together) need none.
 */
export function rideSlots(h: Household, items: readonly FamilyOccurrence[]): RideSlot[] {
  return items
    .filter((i) => !i.event.allDay && i.event.location.trim().length > 0)
    .filter((i) => !assignedTo(h, i.event.id).some((id) => isAdult(h, id)))
    .map((item) => ({ item, kidIds: assignedTo(h, item.event.id).filter((id) => !!kidById(h, id)) }))
    .filter((s) => s.kidIds.length > 0)
    .map((s) => ({
      ...s,
      legs: {
        'drop-off': rideOf(h, s.item.event.id, s.item.occurrenceKey, 'drop-off'),
        'pick-up': rideOf(h, s.item.event.id, s.item.occurrenceKey, 'pick-up'),
      },
    }));
}

/** FAM-05: legs nobody has taken yet. */
export const openLegs = (slot: RideSlot): RideLeg[] => RIDE_LEGS.filter((l) => !slot.legs[l].driverId);

export const rideGapCount = (slots: readonly RideSlot[]) => slots.reduce((n, s) => n + openLegs(s).length, 0);

function upsertRide(h: Household, ride: Ride): Household {
  const rest = h.rides.filter(
    (r) => !(r.eventId === ride.eventId && r.occurrenceKey === ride.occurrenceKey && r.leg === ride.leg),
  );
  const empty = !ride.driverId && !ride.requestedId;
  return { ...h, rides: empty ? rest : [...rest, ride] };
}

/** Take a leg yourself (or give it back with `driverId: null`). */
export function setDriver(
  h: Household,
  by: string,
  eventId: string,
  occurrenceKey: DayKey,
  leg: RideLeg,
  driverId: string | null,
): Household {
  requireAdult(h, by);
  if (driverId !== null && !isAdult(h, driverId)) throw new FamilyError('not-adult');
  const { requestedId: _r, driverId: _d, ...base } = rideOf(h, eventId, occurrenceKey, leg);
  return upsertRide(h, { ...base, ...(driverId ? { driverId } : {}) });
}

/** Ask another adult to take a leg; they answer later (simulated in the prototype). */
export function requestRide(
  h: Household,
  by: string,
  eventId: string,
  occurrenceKey: DayKey,
  leg: RideLeg,
  adultId: string,
): Household {
  requireAdult(h, by);
  if (!isAdult(h, adultId) || adultId === by) throw new FamilyError('not-adult');
  const current = rideOf(h, eventId, occurrenceKey, leg);
  if (current.driverId) throw new FamilyError('invalid-input');
  return upsertRide(h, { ...current, requestedId: adultId });
}

export function answerRideRequest(
  h: Household,
  personId: string,
  eventId: string,
  occurrenceKey: DayKey,
  leg: RideLeg,
  accept: boolean,
): Household {
  const current = rideOf(h, eventId, occurrenceKey, leg);
  if (current.requestedId !== personId || current.driverId) throw new FamilyError('not-found');
  const { requestedId: _r, ...base } = current;
  return upsertRide(h, accept ? { ...base, driverId: personId } : base);
}

/** The time an adult is busy for one leg (travel there/back plus a margin). */
export function legWindow(item: FamilyOccurrence, leg: RideLeg): { start: Date; end: Date } {
  const travel = (item.event.travel?.minutes ?? 0) + RIDE_MARGIN_MIN;
  return leg === 'drop-off'
    ? { start: new Date(item.start.getTime() - travel * 60_000), end: item.start }
    : { start: item.end, end: new Date(item.end.getTime() + travel * 60_000) };
}

/**
 * Conflict check (family.md): the driver has an own appointment during the ride. Only appointments
 * the driver takes part in count; the children's own appointment does not.
 */
export function rideConflict(
  slot: RideSlot,
  leg: RideLeg,
  driverId: string,
  calendar: readonly FamilyOccurrence[],
): FamilyOccurrence | undefined {
  const w = legWindow(slot.item, leg);
  return calendar.find(
    (o) =>
      o.event.id !== slot.item.event.id &&
      !o.event.allDay &&
      o.event.participantIds.includes(driverId) &&
      o.start.getTime() < w.end.getTime() &&
      o.end.getTime() > w.start.getTime(),
  );
}
