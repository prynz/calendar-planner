import type { EventCategory } from '../event';
import { addDays, dayKeyOf, zonedWallTimeToInstant } from '../time';

/**
 * Curated event templates (templates.md). Texts live in i18n under `template.<id>.*`; this module only
 * holds structure. Versioned: an event remembers the version it came from, edits never act retroactively.
 */
export const TEMPLATE_IDS = ['birthday', 'bbq', 'game-night', 'kids-birthday', 'moving', 'festival'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export interface EventTemplate {
  id: TemplateId;
  version: number;
  category: EventCategory;
  durationMinutes: number;
  prepMinutes: number;
  /** Default start, minutes after midnight. */
  startMinute: number;
  /** Task keys with a due offset in days relative to the event day (−7 = one week before). */
  tasks: readonly { key: string; offsetDays: number }[];
  bring: readonly { key: string; quantity: number }[];
}

export const EVENT_TEMPLATES: readonly EventTemplate[] = [
  {
    id: 'birthday',
    version: 1,
    category: 'celebration',
    durationMinutes: 300,
    prepMinutes: 60,
    startMinute: 19 * 60,
    tasks: [
      { key: 'invite', offsetDays: -14 },
      { key: 'cake', offsetDays: -1 },
      { key: 'decorate', offsetDays: 0 },
    ],
    bring: [
      { key: 'drinks', quantity: 6 },
      { key: 'snacks', quantity: 3 },
      { key: 'music', quantity: 1 },
    ],
  },
  {
    id: 'bbq',
    version: 1,
    category: 'social',
    durationMinutes: 300,
    prepMinutes: 30,
    startMinute: 16 * 60,
    tasks: [
      { key: 'grill', offsetDays: -3 },
      { key: 'shopping', offsetDays: -1 },
    ],
    bring: [
      { key: 'sausages', quantity: 3 },
      { key: 'salad', quantity: 2 },
      { key: 'charcoal', quantity: 1 },
      { key: 'drinks', quantity: 6 },
    ],
  },
  {
    id: 'game-night',
    version: 1,
    category: 'social',
    durationMinutes: 240,
    prepMinutes: 30,
    startMinute: 19 * 60,
    tasks: [{ key: 'pick-games', offsetDays: -2 }],
    bring: [
      { key: 'game', quantity: 2 },
      { key: 'snacks', quantity: 3 },
      { key: 'drinks', quantity: 4 },
    ],
  },
  {
    id: 'kids-birthday',
    version: 1,
    category: 'family',
    durationMinutes: 180,
    prepMinutes: 60,
    startMinute: 15 * 60,
    tasks: [
      { key: 'invite', offsetDays: -14 },
      { key: 'party-bags', offsetDays: -2 },
      { key: 'cake', offsetDays: -1 },
    ],
    bring: [
      { key: 'juice', quantity: 4 },
      { key: 'fruit', quantity: 2 },
    ],
  },
  {
    id: 'moving',
    version: 1,
    category: 'family',
    durationMinutes: 480,
    prepMinutes: 30,
    startMinute: 9 * 60,
    tasks: [
      { key: 'van', offsetDays: -14 },
      { key: 'boxes', offsetDays: -7 },
      { key: 'parking', offsetDays: -5 },
    ],
    bring: [
      { key: 'straps', quantity: 2 },
      { key: 'drill', quantity: 1 },
      { key: 'pizza', quantity: 1 },
    ],
  },
  {
    id: 'festival',
    version: 1,
    category: 'social',
    durationMinutes: 720,
    prepMinutes: 45,
    startMinute: 12 * 60,
    tasks: [
      { key: 'tickets', offsetDays: -30 },
      { key: 'travel', offsetDays: -7 },
    ],
    bring: [
      { key: 'tent', quantity: 1 },
      { key: 'powerbank', quantity: 2 },
      { key: 'sunscreen', quantity: 1 },
    ],
  },
];

export function templateById(id: string): EventTemplate | undefined {
  return EVENT_TEMPLATES.find((t) => t.id === id);
}

/** Relative due day → 18:00 local on that day, but never after the event start. */
export function resolveDue(eventStart: Date, offsetDays: number, timeZone: string): Date {
  const day = addDays(dayKeyOf(eventStart, timeZone), offsetDays);
  const due = zonedWallTimeToInstant(day, 18, 0, timeZone);
  return due.getTime() > eventStart.getTime() ? eventStart : due;
}
