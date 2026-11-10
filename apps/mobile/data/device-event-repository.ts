import * as SQLite from 'expo-sqlite';

import type { CalendarEvent } from '@nowish/domain';

import type { EventRepository } from './event-repository';
import { deserializeEvent, serializeEvent } from './serialization';

const DB_NAME = 'nowish.db';
const SCHEMA_VERSION = 1;

/**
 * Local SQLite store (ADR 0010). Events are kept as validated JSON documents – flexible while the
 * prototype evolves; the server schema (data-model.md) arrives with block B.
 */
export function createDeviceEventRepository(): EventRepository {
  let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
  const db = () => {
    dbPromise ??= SQLite.openDatabaseAsync(DB_NAME).then(async (d) => {
      const row = await d.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      if ((row?.user_version ?? 0) < SCHEMA_VERSION) {
        await d.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS event (id TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
          PRAGMA user_version = ${SCHEMA_VERSION};
        `);
      }
      return d;
    });
    return dbPromise;
  };

  return {
    async load() {
      const d = await db();
      const rows = await d.getAllAsync<{ id: string; json: string }>('SELECT id, json FROM event');
      const events: CalendarEvent[] = [];
      for (const r of rows) {
        try {
          events.push(deserializeEvent(r.json));
        } catch (error) {
          // One unreadable row must not take the whole calendar down; it is reported, not hidden.
          console.warn('[events] skipped corrupt row', r.id, error instanceof Error ? error.message : 'unknown');
        }
      }
      const seeded = await d.getFirstAsync<{ value: string }>("SELECT value FROM meta WHERE key = 'seeded'");
      return { events, seeded: seeded?.value === '1' };
    },
    async upsert(e) {
      const d = await db();
      await d.runAsync(
        'INSERT INTO event (id, json) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json',
        e.id,
        serializeEvent(e),
      );
    },
    async remove(id) {
      const d = await db();
      await d.runAsync('DELETE FROM event WHERE id = ?', id);
    },
    async replaceAll(events) {
      const d = await db();
      await d.withTransactionAsync(async () => {
        await d.runAsync('DELETE FROM event');
        for (const e of events) await d.runAsync('INSERT INTO event (id, json) VALUES (?, ?)', e.id, serializeEvent(e));
        await d.runAsync(
          "INSERT INTO meta (key, value) VALUES ('seeded', '1') ON CONFLICT(key) DO UPDATE SET value = '1'",
        );
      });
    },
  };
}
