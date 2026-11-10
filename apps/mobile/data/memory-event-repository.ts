import type { CalendarEvent } from '@nowish/domain';

import type { EventRepository } from './event-repository';
import { deserializeEvent, serializeEvent } from './serialization';

/** In-memory repository for tests. Round-trips through JSON so tests cover serialization too. */
export function createMemoryEventRepository(
  initial: readonly CalendarEvent[] = [],
  seeded = false,
): EventRepository & { failNext?: boolean } {
  const rows = new Map(initial.map((e) => [e.id, serializeEvent(e)]));
  let isSeeded = seeded;
  const repo: EventRepository & { failNext?: boolean } = {
    async load() {
      return { events: [...rows.values()].map(deserializeEvent), seeded: isSeeded };
    },
    async upsert(e) {
      if (repo.failNext) {
        repo.failNext = false;
        throw new Error('simulated write failure');
      }
      rows.set(e.id, serializeEvent(e));
    },
    async remove(id) {
      rows.delete(id);
    },
    async replaceAll(events) {
      rows.clear();
      for (const e of events) rows.set(e.id, serializeEvent(e));
      isSeeded = true;
    },
  };
  return repo;
}
