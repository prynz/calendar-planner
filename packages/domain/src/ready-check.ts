import type { LocalizedText } from './calendar-event';
import { claimOf } from './collab/bring';
import type { EventCollab } from './collab/model';
import type { EventCategory } from './event';

/**
 * Ready check before leaving (anti-chaos-engine.md §3): own bring-list claims, category items (e.g. the health
 * insurance card for the doctor) and personal standard items. Standard texts live in i18n (`ready.item.<key>`).
 */
export const STANDARD_READY_KEYS = ['keys', 'phone', 'wallet'] as const;
export const CATEGORY_READY_KEYS: Partial<Record<EventCategory, readonly string[]>> = {
  health: ['insurance-card', 'id-card'],
  celebration: ['gift'],
  sport: ['sportswear', 'water'],
  work: ['documents'],
};

export type ReadyItem =
  | { id: string; source: 'standard' | 'category'; key: string }
  | { id: string; source: 'bring'; title: string; titleI18n?: LocalizedText; quantity: number };

export function readyItems(category: EventCategory, collab: EventCollab | undefined, viewerId: string): ReadyItem[] {
  const bring: ReadyItem[] = (collab?.bring ?? [])
    .map((i) => ({ item: i, quantity: claimOf(i, viewerId) }))
    .filter((x) => x.quantity > 0)
    .map(({ item, quantity }) => ({
      id: `bring-${item.id}`,
      source: 'bring',
      title: item.title,
      ...(item.titleI18n ? { titleI18n: item.titleI18n } : {}),
      quantity,
    }));
  const cat: ReadyItem[] = (CATEGORY_READY_KEYS[category] ?? []).map((key) => ({
    id: `cat-${key}`,
    source: 'category',
    key,
  }));
  const std: ReadyItem[] = STANDARD_READY_KEYS.map((key) => ({ id: `std-${key}`, source: 'standard', key }));
  return [...bring, ...cat, ...std];
}

export function readyProgress(items: readonly ReadyItem[], checked: readonly string[]) {
  const done = items.filter((i) => checked.includes(i.id)).length;
  return { done, total: items.length, complete: items.length > 0 && done === items.length };
}
