import * as SQLite from 'expo-sqlite';

import { deserializeGroup, deserializeHousehold, serializeGroup, serializeHousehold } from './circles-serialization';
import { deserializeCollab, deserializeJourney, serializeCollab, serializeJourney } from './collab-serialization';
import type { EventRepository } from './event-repository';
import { deserializeEvent, serializeEvent } from './serialization';

const DB_NAME = 'nowish.db';
/** v1: events (Phase 2) · v2: collaboration (Phase 3) · v3: departure history (Phase 4) · v4: family + groups (Phase 5). */
const SCHEMA_VERSION = 4;

/** Ordered, additive migrations – never edit an applied one. */
const MIGRATIONS: Record<number, string> = {
  1: `
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS event (id TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);`,
  2: `CREATE TABLE IF NOT EXISTS collab (event_id TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);`,
  3: `CREATE TABLE IF NOT EXISTS journey (id TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);`,
  4: `
    CREATE TABLE IF NOT EXISTS household (id TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS circle (id TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);`,
};

type Row = { id: string; json: string };

function parseRows<T>(rows: { id: string; json: string }[], parse: (json: string) => T, label: string): T[] {
  const out: T[] = [];
  for (const r of rows) {
    try {
      out.push(parse(r.json));
    } catch (error) {
      // One unreadable row must not take the whole calendar down; it is reported, not hidden.
      console.warn(`[${label}] skipped corrupt row`, r.id, error instanceof Error ? error.message : 'unknown');
    }
  }
  return out;
}

const setMeta = (d: SQLite.SQLiteDatabase, key: string) =>
  d.runAsync("INSERT INTO meta (key, value) VALUES (?, '1') ON CONFLICT(key) DO UPDATE SET value = '1'", key);

/**
 * Local SQLite store (ADR 0010). Events and collaboration data are kept as validated JSON documents –
 * flexible while the prototype evolves; the server schema (data-model.md) arrives with block B.
 */
export function createDeviceEventRepository(): EventRepository {
  let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
  const db = () => {
    dbPromise ??= SQLite.openDatabaseAsync(DB_NAME).then(async (d) => {
      const row = await d.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      for (let v = (row?.user_version ?? 0) + 1; v <= SCHEMA_VERSION; v++) {
        await d.execAsync(`${MIGRATIONS[v] ?? ''}\nPRAGMA user_version = ${v};`);
      }
      return d;
    });
    return dbPromise;
  };

  return {
    async load() {
      const d = await db();
      const events = parseRows(
        await d.getAllAsync<{ id: string; json: string }>('SELECT id, json FROM event'),
        deserializeEvent,
        'events',
      );
      const collabs = parseRows(
        await d.getAllAsync<{ id: string; json: string }>('SELECT event_id AS id, json FROM collab'),
        deserializeCollab,
        'collab',
      );
      const meta = await d.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM meta');
      const flag = (k: string) => meta.some((m) => m.key === k && m.value === '1');
      const journeys = parseRows(
        await d.getAllAsync<{ id: string; json: string }>('SELECT id, json FROM journey'),
        deserializeJourney,
        'journey',
      );
      const households = parseRows(
        await d.getAllAsync<Row>('SELECT id, json FROM household'),
        deserializeHousehold,
        'household',
      );
      const groups = parseRows(await d.getAllAsync<Row>('SELECT id, json FROM circle'), deserializeGroup, 'group');
      return {
        events,
        collabs,
        journeys,
        household: households[0] ?? null,
        groups,
        seeded: flag('seeded'),
        collabSeeded: flag('collab_seeded'),
        journeysSeeded: flag('journeys_seeded'),
        circlesSeeded: flag('circles_seeded'),
      };
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
      await d.withTransactionAsync(async () => {
        await d.runAsync('DELETE FROM event WHERE id = ?', id);
        await d.runAsync('DELETE FROM collab WHERE event_id = ?', id);
      });
    },
    async upsertCollab(c) {
      const d = await db();
      await d.runAsync(
        'INSERT INTO collab (event_id, json) VALUES (?, ?) ON CONFLICT(event_id) DO UPDATE SET json = excluded.json',
        c.eventId,
        serializeCollab(c),
      );
    },
    async seedCollabs(collabs) {
      const d = await db();
      await d.withTransactionAsync(async () => {
        for (const c of collabs)
          await d.runAsync(
            'INSERT INTO collab (event_id, json) VALUES (?, ?) ON CONFLICT(event_id) DO NOTHING',
            c.eventId,
            serializeCollab(c),
          );
        await setMeta(d, 'collab_seeded');
      });
    },
    async upsertJourney(j) {
      const d = await db();
      await d.runAsync(
        'INSERT INTO journey (id, json) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json',
        j.id,
        serializeJourney(j),
      );
    },
    async seedJourneys(journeys) {
      const d = await db();
      await d.withTransactionAsync(async () => {
        for (const j of journeys)
          await d.runAsync(
            'INSERT INTO journey (id, json) VALUES (?, ?) ON CONFLICT(id) DO NOTHING',
            j.id,
            serializeJourney(j),
          );
        await setMeta(d, 'journeys_seeded');
      });
    },
    async clearJourneys() {
      const d = await db();
      await d.runAsync('DELETE FROM journey');
    },
    async upsertHousehold(h) {
      const d = await db();
      await d.runAsync(
        'INSERT INTO household (id, json) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json',
        h.id,
        serializeHousehold(h),
      );
    },
    async upsertGroup(g) {
      const d = await db();
      await d.runAsync(
        'INSERT INTO circle (id, json) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json',
        g.id,
        serializeGroup(g),
      );
    },
    async removeGroup(id) {
      const d = await db();
      await d.runAsync('DELETE FROM circle WHERE id = ?', id);
    },
    async seedCircles(extra) {
      const d = await db();
      await d.withTransactionAsync(async () => {
        for (const e of extra.events)
          await d.runAsync(
            'INSERT INTO event (id, json) VALUES (?, ?) ON CONFLICT(id) DO NOTHING',
            e.id,
            serializeEvent(e),
          );
        for (const c of extra.collabs)
          await d.runAsync(
            'INSERT INTO collab (event_id, json) VALUES (?, ?) ON CONFLICT(event_id) DO NOTHING',
            c.eventId,
            serializeCollab(c),
          );
        if (extra.household)
          await d.runAsync(
            'INSERT INTO household (id, json) VALUES (?, ?) ON CONFLICT(id) DO NOTHING',
            extra.household.id,
            serializeHousehold(extra.household),
          );
        for (const g of extra.groups)
          await d.runAsync(
            'INSERT INTO circle (id, json) VALUES (?, ?) ON CONFLICT(id) DO NOTHING',
            g.id,
            serializeGroup(g),
          );
        await setMeta(d, 'circles_seeded');
      });
    },
    async replaceAll(world) {
      const d = await db();
      await d.withTransactionAsync(async () => {
        for (const table of ['event', 'collab', 'journey', 'household', 'circle'])
          await d.runAsync(`DELETE FROM ${table}`); // fixed table names, no user input
        for (const j of world.journeys)
          await d.runAsync('INSERT INTO journey (id, json) VALUES (?, ?)', j.id, serializeJourney(j));
        for (const e of world.events)
          await d.runAsync('INSERT INTO event (id, json) VALUES (?, ?)', e.id, serializeEvent(e));
        for (const c of world.collabs)
          await d.runAsync('INSERT INTO collab (event_id, json) VALUES (?, ?)', c.eventId, serializeCollab(c));
        if (world.household)
          await d.runAsync(
            'INSERT INTO household (id, json) VALUES (?, ?)',
            world.household.id,
            serializeHousehold(world.household),
          );
        for (const g of world.groups)
          await d.runAsync('INSERT INTO circle (id, json) VALUES (?, ?)', g.id, serializeGroup(g));
        for (const flag of ['seeded', 'collab_seeded', 'journeys_seeded', 'circles_seeded']) await setMeta(d, flag);
      });
    },
  };
}
