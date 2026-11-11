import type { CalendarEvent, EventCollab, Journey } from '@nowish/domain';

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
): MemoryRepository {
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
    async replaceAll(events, collabs, journeys) {
      rows.clear();
      collabRows.clear();
      journeyRows.clear();
      for (const e of events) rows.set(e.id, serializeEvent(e));
      for (const c of collabs) collabRows.set(c.eventId, serializeCollab(c));
      for (const j of journeys) journeyRows.set(j.id, serializeJourney(j));
      isSeeded = true;
      isCollabSeeded = true;
      isJourneysSeeded = true;
    },
  };
  return repo;
}
