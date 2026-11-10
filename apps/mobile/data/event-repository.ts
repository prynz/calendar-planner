import type { CalendarEvent, EventCollab } from '@nowish/domain';

export interface StoredWorld {
  events: CalendarEvent[];
  collabs: EventCollab[];
  /** The example world was seeded on this device. */
  seeded: boolean;
  /** Collaboration data (Phase 3) was seeded – false on devices that ran an older prototype. */
  collabSeeded: boolean;
}

/**
 * Storage boundary (ADR 0010, ADR 0012). Screens never touch SQLite directly; in block B a Supabase-backed
 * implementation replaces the local one behind this interface. One collaboration document per social event.
 */
export interface EventRepository {
  load(): Promise<StoredWorld>;
  upsert(event: CalendarEvent): Promise<void>;
  /** Removes the event and its collaboration document. */
  remove(id: string): Promise<void>;
  upsertCollab(collab: EventCollab): Promise<void>;
  /** Adds collaboration documents for an existing world and marks it as collab-seeded. */
  seedCollabs(collabs: readonly EventCollab[]): Promise<void>;
  /** Replaces everything (seeding / "reset example world") and marks the store as seeded. */
  replaceAll(events: readonly CalendarEvent[], collabs: readonly EventCollab[]): Promise<void>;
}
