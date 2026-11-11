import { nextId } from '../collab/model';
import { requireAdult } from './household';
import { FAMILY_LIMITS, FamilyError, type Household, type ShoppingItem } from './model';

/** FAM-06: shared shopping list. Open items first (newest on top), then done ones. */
export function addShoppingItem(h: Household, by: string, title: string, note: string, now: Date): Household {
  requireAdult(h, by);
  const t = title.trim();
  const n = note.trim();
  if (t.length === 0 || t.length > FAMILY_LIMITS.title || n.length > FAMILY_LIMITS.note)
    throw new FamilyError('invalid-input');
  if (h.shopping.length >= FAMILY_LIMITS.shopping) throw new FamilyError('limit');
  const item: ShoppingItem = {
    id: nextId('buy', h.shopping, now),
    title: t,
    ...(n ? { note: n } : {}),
    addedBy: by,
    createdAt: now,
  };
  return { ...h, shopping: [...h.shopping, item] };
}

export function toggleShoppingItem(h: Household, by: string, id: string, now: Date): Household {
  requireAdult(h, by);
  if (!h.shopping.some((i) => i.id === id)) throw new FamilyError('not-found');
  return {
    ...h,
    shopping: h.shopping.map((i) => {
      if (i.id !== id) return i;
      if (i.doneAt) {
        const { doneAt: _a, doneBy: _b, ...open } = i;
        return open;
      }
      return { ...i, doneAt: now, doneBy: by };
    }),
  };
}

/** "Clear bought items". */
export function clearDoneShopping(h: Household, by: string): Household {
  requireAdult(h, by);
  return { ...h, shopping: h.shopping.filter((i) => !i.doneAt) };
}

export function sortedShopping(h: Household): ShoppingItem[] {
  const open = h.shopping.filter((i) => !i.doneAt).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const done = h.shopping
    .filter((i) => i.doneAt)
    .sort((a, b) => (b.doneAt?.getTime() ?? 0) - (a.doneAt?.getTime() ?? 0));
  return [...open, ...done];
}
