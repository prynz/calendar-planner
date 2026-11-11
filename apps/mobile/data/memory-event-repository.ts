import type { CalendarEvent, EventCollab, Group, Household, Journey } from '@nowish/domain';

import { deserializeGroup, deserializeHousehold, serializeGroup, serializeHousehold } from './circles-serialization';

import { deserializeCollab, deserializeJourney, serializeCollab, serializeJourney } from './collab-serialization';
import type { EventRepository } from './event-repository';
import { deserializeEvent, serializeEvent } from './serialization';

export type MemoryRepository = EventRepository & { failNext?: boolean };

/** In-memory repository for tests. Round-trips through JSON so tests cover serialization too. */
export function createMemoryEventRepository(
  initial: readonly CalendarEvent[] = [],
  seeded = false,
  initialCollabs: readonly EventCollab[] = [],
  initialJourneys: readonly Journey[] = [],
  /** Tests that model a fresh Phase-4 install without history pass true. */
  journeysSeeded = seeded && initialJourneys.length > 0,
  /** Family and groups; `seeded` defaults to the world flag so older tests never get demo circles. */
  circles: { household?: Household | null; groups?: readonly Group[]; seeded?: boolean } = {},
): MemoryRepository {
  let householdRow = circles.household ? serializeHousehold(circles.household) : null;
  const groupRows = new Map((circles.groups ?? []).map((g) => [g.id, serializeGroup(g)]));
  let isCirclesSeeded = circles.seeded ?? seeded;
  const rows = new Map(initial.map((e) => [e.id, serializeEvent(e)]));
  const collabRows = new Map(initialCollabs.map((c) => [c.eventId, serializeCollab(c)]));
  let isSeeded = seeded;
  let isCollabSeeded = seeded && initialCollabs.length > 0;
  const journeyRows = new Map(initialJourneys.map((j) => [j.id, serializeJourney(j)]));
  let isJourneysSeeded = journeysSeeded;
  const failIfAsked = () => {
    if (repo.failNext) {
      repo.failNext = false;
      throw new Error('simulated write failure');
    }
  };
  const repo: MemoryRepository = {
    async load() {
      return {
        events: [...rows.values()].map(deserializeEvent),
        collabs: [...collabRows.values()].map(deserializeCollab),
        seeded: isSeeded,
        collabSeeded: isCollabSeeded,
        journeys: [...journeyRows.values()].map(deserializeJourney),
        journeysSeeded: isJourneysSeeded,
        household: householdRow ? deserializeHousehold(householdRow) : null,
        groups: [...groupRows.values()].map(deserializeGroup),
        circlesSeeded: isCirclesSeeded,
      };
    },
    async upsert(e) {
      failIfAsked();
      rows.set(e.id, serializeEvent(e));
    },
    async remove(id) {
      failIfAsked();
      rows.delete(id);
      collabRows.delete(id);
    },
    async upsertCollab(c) {
      failIfAsked();
      collabRows.set(c.eventId, serializeCollab(c));
    },
    async seedCollabs(collabs) {
      for (const c of collabs) collabRows.set(c.eventId, serializeCollab(c));
      isCollabSeeded = true;
    },
    async upsertJourney(j) {
      failIfAsked();
      journeyRows.set(j.id, serializeJourney(j));
    },
    async seedJourneys(journeys) {
      for (const j of journeys) if (!journeyRows.has(j.id)) journeyRows.set(j.id, serializeJourney(j));
      isJourneysSeeded = true;
    },
    async clearJourneys() {
      failIfAsked();
      journeyRows.clear();
    },
    async upsertHousehold(h) {
      failIfAsked();
      householdRow = serializeHousehold(h);
    },
    async upsertGroup(g) {
      failIfAsked();
      groupRows.set(g.id, serializeGroup(g));
    },
    async removeGroup(id) {
      failIfAsked();
      groupRows.delete(id);
    },
    async seedCircles(extra) {
      for (const e of extra.events) if (!rows.has(e.id)) rows.set(e.id, serializeEvent(e));
      for (const c of extra.collabs) if (!collabRows.has(c.eventId)) collabRows.set(c.eventId, serializeCollab(c));
      for (const g of extra.groups) if (!groupRows.has(g.id)) groupRows.set(g.id, serializeGroup(g));
      if (extra.household && !householdRow) householdRow = serializeHousehold(extra.household);
      isCirclesSeeded = true;
    },
    async replaceAll(world) {
      rows.clear();
      collabRows.clear();
      journeyRows.clear();
      groupRows.clear();
      for (const e of world.events) rows.set(e.id, serializeEvent(e));
      for (const c of world.collabs) collabRows.set(c.eventId, serializeCollab(c));
      for (const j of world.journeys) journeyRows.set(j.id, serializeJourney(j));
      for (const g of world.groups) groupRows.set(g.id, serializeGroup(g));
      householdRow = world.household ? serializeHousehold(world.household) : null;
      isSeeded = true;
      isCollabSeeded = true;
      isJourneysSeeded = true;
      isCirclesSeeded = true;
    },
  };
  return repo;
}
