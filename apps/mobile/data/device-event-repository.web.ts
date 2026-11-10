import type { CalendarEvent } from '@nowish/domain';

import type { EventRepository } from './event-repository';
import { deserializeEvent, serializeEvent } from './serialization';

/**
 * Web preview only: browser localStorage instead of SQLite (SQLite on the web needs cross-origin isolation,
 * which GitHub Pages cannot provide). Same validated JSON documents as on devices.
 */
const KEY = 'nowish.events.v1';
const SEEDED = 'nowish.events.seeded';

function storage(): Storage {
  if (typeof globalThis.localStorage === 'undefined') throw new Error('localStorage is not available');
  return globalThis.localStorage;
}

function readRows(): Record<string, string> {
  const raw = storage().getItem(KEY);
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
    throw new Error('Stored events are corrupt');
  return parsed as Record<string, string>; // validated per row by deserializeEvent below
}

const writeRows = (rows: Record<string, string>) => storage().setItem(KEY, JSON.stringify(rows));

export function createDeviceEventRepository(): EventRepository {
  return {
    async load() {
      const events: CalendarEvent[] = [];
      for (const [id, json] of Object.entries(readRows())) {
        try {
          events.push(deserializeEvent(json));
        } catch (error) {
          console.warn('[events] skipped corrupt row', id, error instanceof Error ? error.message : 'unknown');
        }
      }
      return { events, seeded: storage().getItem(SEEDED) === '1' };
    },
    async upsert(e) {
      writeRows({ ...readRows(), [e.id]: serializeEvent(e) });
    },
    async remove(id) {
      const rows = readRows();
      delete rows[id];
      writeRows(rows);
    },
    async replaceAll(events) {
      writeRows(Object.fromEntries(events.map((e) => [e.id, serializeEvent(e)])));
      storage().setItem(SEEDED, '1');
    },
  };
}
