import type { CalendarEvent } from '@nowish/domain';

/**
 * Storage boundary (ADR 0010). Screens never touch SQLite directly; in block B a Supabase-backed
 * implementation replaces the local one behind this interface.
 */
export interface EventRepository {
  /** All events plus whether the example world was already seeded on this device. */
  load(): Promise<{ events: CalendarEvent[]; seeded: boolean }>;
  upsert(event: CalendarEvent): Promise<void>;
  remove(id: string): Promise<void>;
  /** Replaces everything (seeding / "reset example world") and marks the store as seeded. */
  replaceAll(events: readonly CalendarEvent[]): Promise<void>;
}
