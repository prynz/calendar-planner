import {
  buildDemoCollabs,
  buildDemoEvents,
  buildDemoGroups,
  buildDemoHousehold,
  buildDemoJourneys,
  DEMO_TIME_ZONE,
} from '@nowish/demo';
import type { CalendarEvent, EventCollab, Group, Household, Journey } from '@nowish/domain';

import type { EventRepository } from '@/data/event-repository';

export interface World {
  events: CalendarEvent[];
  collabs: EventCollab[];
  journeys: Journey[];
  household: Household | null;
  groups: Group[];
}

/** The complete example world for `now` (ADR 0008, 0010). */
export function demoWorld(now: Date): World {
  const events = buildDemoEvents(now, DEMO_TIME_ZONE);
  return {
    events,
    collabs: buildDemoCollabs(events, now),
    journeys: buildDemoJourneys(now, DEMO_TIME_ZONE),
    household: buildDemoHousehold(events, now),
    groups: buildDemoGroups(events, now),
  };
}

/** Demo events that arrived with Phase 5 (family and group meetings). */
const PHASE_5_EVENTS = new Set(['demo-swim', 'demo-paul-doctor', 'demo-stammtisch', 'demo-run']);

/**
 * Loads the stored world. A fresh device gets the example world; a device that ran an older prototype
 * gets each later part of the example world once, without touching what is already there.
 */
export async function loadWorld(repository: EventRepository, now: Date): Promise<World> {
  const loaded = await repository.load();
  if (!loaded.seeded) {
    const world = demoWorld(now);
    await repository.replaceAll(world);
    return world;
  }
  let { events, collabs, journeys, household, groups } = loaded;
  if (!loaded.journeysSeeded) {
    const extra = buildDemoJourneys(now, DEMO_TIME_ZONE).filter((j) => !journeys.some((x) => x.id === j.id));
    await repository.seedJourneys(extra);
    journeys = [...journeys, ...extra];
  }
  if (!loaded.collabSeeded) {
    const extra = buildDemoCollabs(
      events.filter((e) => e.isDemo),
      now,
    ).filter((c) => !collabs.some((x) => x.eventId === c.eventId));
    await repository.seedCollabs(extra);
    collabs = [...collabs, ...extra];
  }
  if (!loaded.circlesSeeded) {
    const demo = demoWorld(now);
    const newEvents = demo.events.filter((e) => PHASE_5_EVENTS.has(e.id) && !events.some((x) => x.id === e.id));
    const all = [...events, ...newEvents];
    const extra = {
      events: newEvents,
      collabs: buildDemoCollabs(newEvents, now).filter((c) => !collabs.some((x) => x.eventId === c.eventId)),
      household: household ? null : buildDemoHousehold(all, now),
      groups: buildDemoGroups(all, now).filter((g) => !groups.some((x) => x.id === g.id)),
    };
    await repository.seedCircles(extra);
    events = all;
    collabs = [...collabs, ...extra.collabs];
    household = household ?? extra.household;
    groups = [...groups, ...extra.groups];
  }
  return { events, collabs, journeys, household, groups };
}
