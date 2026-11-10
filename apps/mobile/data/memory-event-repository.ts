import type { CalendarEvent, EventCollab } from '@nowish/domain';

import { deserializeCollab, serializeCollab } from './collab-serialization';
import type { EventRepository } from './event-repository';
import { deserializeEvent, serializeEvent } from './serialization';

export type MemoryRepository = EventRepository & { failNext?: boolean };

/** In-memory repository for tests. Round-trips through JSON so tests cover serialization too. */
export function createMemoryEventRepository(
  initial: readonly CalendarEvent[] = [],
  seeded = false,
  initialCollabs: readonly EventCollab[] = [],
): MemoryRepository {
  const rows = new Map(initial.map((e) => [e.id, serializeEvent(e)]));
  const collabRows = new Map(initialCollabs.map((c) => [c.eventId, serializeCollab(c)]));
  let isSeeded = seeded;
  let isCollabSeeded = seeded && initialCollabs.length > 0;
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
    async replaceAll(events, collabs) {
      rows.clear();
      collabRows.clear();
      for (const e of events) rows.set(e.id, serializeEvent(e));
      for (const c of collabs) collabRows.set(c.eventId, serializeCollab(c));
      isSeeded = true;
      isCollabSeeded = true;
    },
  };
  return repo;
}
