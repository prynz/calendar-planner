import type { EventRepository } from './event-repository';
import { deserializeGroup, deserializeHousehold, serializeGroup, serializeHousehold } from './circles-serialization';
import { deserializeCollab, deserializeJourney, serializeCollab, serializeJourney } from './collab-serialization';
import { deserializeEvent, serializeEvent } from './serialization';

/**
 * Web preview only: browser localStorage instead of SQLite (SQLite on the web needs cross-origin isolation,
 * which GitHub Pages cannot provide). Same validated JSON documents as on devices (ADR 0011).
 */
const EVENTS = 'nowish.events.v1';
const COLLABS = 'nowish.collab.v1';
const SEEDED = 'nowish.events.seeded';
const COLLAB_SEEDED = 'nowish.collab.seeded';
const JOURNEYS = 'nowish.journeys.v1';
const JOURNEYS_SEEDED = 'nowish.journeys.seeded';
const HOUSEHOLD = 'nowish.household.v1';
const GROUPS = 'nowish.groups.v1';
const CIRCLES_SEEDED = 'nowish.circles.seeded';

function storage(): Storage {
  if (typeof globalThis.localStorage === 'undefined') throw new Error('localStorage is not available');
  return globalThis.localStorage;
}

function readRows(key: string): Record<string, string> {
  const raw = storage().getItem(key);
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
    throw new Error(`Stored ${key} is corrupt`);
  return parsed as Record<string, string>; // validated per row by the deserializers below
}

const writeRows = (key: string, rows: Record<string, string>) => storage().setItem(key, JSON.stringify(rows));

function parseAll<T>(key: string, parse: (json: string) => T): T[] {
  const out: T[] = [];
  for (const [id, json] of Object.entries(readRows(key))) {
    try {
      out.push(parse(json));
    } catch (error) {
      console.warn(`[${key}] skipped corrupt row`, id, error instanceof Error ? error.message : 'unknown');
    }
  }
  return out;
}

export function createDeviceEventRepository(): EventRepository {
  return {
    async load() {
      return {
        events: parseAll(EVENTS, deserializeEvent),
        collabs: parseAll(COLLABS, deserializeCollab),
        seeded: storage().getItem(SEEDED) === '1',
        collabSeeded: storage().getItem(COLLAB_SEEDED) === '1',
        journeys: parseAll(JOURNEYS, deserializeJourney),
        journeysSeeded: storage().getItem(JOURNEYS_SEEDED) === '1',
        household: parseAll(HOUSEHOLD, deserializeHousehold)[0] ?? null,
        groups: parseAll(GROUPS, deserializeGroup),
        circlesSeeded: storage().getItem(CIRCLES_SEEDED) === '1',
      };
    },
    async upsert(e) {
      writeRows(EVENTS, { ...readRows(EVENTS), [e.id]: serializeEvent(e) });
    },
    async remove(id) {
      const events = readRows(EVENTS);
      const collabs = readRows(COLLABS);
      delete events[id];
      delete collabs[id];
      writeRows(EVENTS, events);
      writeRows(COLLABS, collabs);
    },
    async upsertCollab(c) {
      writeRows(COLLABS, { ...readRows(COLLABS), [c.eventId]: serializeCollab(c) });
    },
    async seedCollabs(collabs) {
      writeRows(COLLABS, {
        ...Object.fromEntries(collabs.map((c) => [c.eventId, serializeCollab(c)])),
        ...readRows(COLLABS),
      });
      storage().setItem(COLLAB_SEEDED, '1');
    },
    async upsertJourney(j) {
      writeRows(JOURNEYS, { ...readRows(JOURNEYS), [j.id]: serializeJourney(j) });
    },
    async seedJourneys(journeys) {
      writeRows(JOURNEYS, {
        ...Object.fromEntries(journeys.map((j) => [j.id, serializeJourney(j)])),
        ...readRows(JOURNEYS),
      });
      storage().setItem(JOURNEYS_SEEDED, '1');
    },
    async clearJourneys() {
      writeRows(JOURNEYS, {});
    },
    async upsertHousehold(h) {
      writeRows(HOUSEHOLD, { [h.id]: serializeHousehold(h) });
    },
    async upsertGroup(g) {
      writeRows(GROUPS, { ...readRows(GROUPS), [g.id]: serializeGroup(g) });
    },
    async removeGroup(id) {
      const groups = readRows(GROUPS);
      delete groups[id];
      writeRows(GROUPS, groups);
    },
    async seedCircles(extra) {
      const keep = <T>(key: string, items: readonly T[], id: (x: T) => string, ser: (x: T) => string) =>
        writeRows(key, { ...Object.fromEntries(items.map((x) => [id(x), ser(x)])), ...readRows(key) });
      keep(EVENTS, extra.events, (e) => e.id, serializeEvent);
      keep(COLLABS, extra.collabs, (c) => c.eventId, serializeCollab);
      keep(GROUPS, extra.groups, (g) => g.id, serializeGroup);
      if (extra.household && Object.keys(readRows(HOUSEHOLD)).length === 0)
        writeRows(HOUSEHOLD, { [extra.household.id]: serializeHousehold(extra.household) });
      storage().setItem(CIRCLES_SEEDED, '1');
    },
    async replaceAll(world) {
      writeRows(JOURNEYS, Object.fromEntries(world.journeys.map((j) => [j.id, serializeJourney(j)])));
      writeRows(EVENTS, Object.fromEntries(world.events.map((e) => [e.id, serializeEvent(e)])));
      writeRows(COLLABS, Object.fromEntries(world.collabs.map((c) => [c.eventId, serializeCollab(c)])));
      writeRows(HOUSEHOLD, world.household ? { [world.household.id]: serializeHousehold(world.household) } : {});
      writeRows(GROUPS, Object.fromEntries(world.groups.map((g) => [g.id, serializeGroup(g)])));
      for (const flag of [SEEDED, COLLAB_SEEDED, JOURNEYS_SEEDED, CIRCLES_SEEDED]) storage().setItem(flag, '1');
    },
  };
}
