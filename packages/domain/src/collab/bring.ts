import { COLLAB_LIMITS, CollabError, nextId, type BringItem, type EventCollab } from './model';
import { memberIds } from './rsvp';

export const claimedQuantity = (item: BringItem) => item.claims.reduce((sum, c) => sum + c.quantity, 0);
export const remainingQuantity = (item: BringItem) => item.quantity - claimedQuantity(item);
export const claimOf = (item: BringItem, personId: string) =>
  item.claims.find((c) => c.personId === personId)?.quantity ?? 0;

export function bringProgress(items: readonly BringItem[]): { covered: number; total: number } {
  return { covered: items.filter((i) => remainingQuantity(i) <= 0).length, total: items.length };
}

/**
 * Normalises item names for duplicate hints (BRG-04): lower case, umlauts folded, punctuation removed,
 * and a very small German/English plural stem ("Salate" → "salat", "chips" → "chip").
 */
export function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 4 ? w.replace(/(en|er|e|n|s)$/, '') : w))
    .join(' ');
}

/** Existing items that look like `title` – a hint only, never a block. */
export function similarItems(items: readonly BringItem[], title: string, locale: 'de' | 'en'): BringItem[] {
  const n = normalizeItemName(title);
  if (n.length < 3) return [];
  return items.filter((i) => {
    const other = normalizeItemName(i.titleI18n?.[locale] ?? i.title);
    return other === n || other.split(' ').includes(n) || n.split(' ').includes(other);
  });
}

export function addBringItem(
  c: EventCollab,
  actorId: string,
  input: { title: string; quantity: number },
  now: Date,
): EventCollab {
  if (!memberIds(c).includes(actorId)) throw new CollabError('not-invited');
  const title = input.title.trim();
  if (
    title.length === 0 ||
    title.length > COLLAB_LIMITS.title ||
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > COLLAB_LIMITS.quantity
  )
    throw new CollabError('invalid-input');
  const item: BringItem = { id: nextId('item', c.bring, now), title, quantity: input.quantity, claims: [] };
  return { ...c, bring: [...c.bring, item] };
}

/**
 * Sets how many of an item a person brings (0 = withdraw). Claims never add up beyond the item's quantity
 * (bring-list.md; the server repeats this check in a transaction in block B).
 */
export function setClaim(c: EventCollab, itemId: string, personId: string, quantity: number): EventCollab {
  const item = c.bring.find((i) => i.id === itemId);
  if (!item) throw new CollabError('not-found');
  if (!memberIds(c).includes(personId)) throw new CollabError('not-invited');
  if (!Number.isInteger(quantity) || quantity < 0) throw new CollabError('invalid-input');
  const others = claimedQuantity(item) - claimOf(item, personId);
  if (others + quantity > item.quantity) throw new CollabError('over-claimed');
  const claims = item.claims.filter((cl) => cl.personId !== personId);
  const next: BringItem = { ...item, claims: quantity > 0 ? [...claims, { personId, quantity }] : claims };
  return { ...c, bring: c.bring.map((i) => (i.id === itemId ? next : i)) };
}

export function removeBringItem(c: EventCollab, actorId: string, itemId: string): EventCollab {
  if (actorId !== c.hostId) throw new CollabError('not-host');
  if (!c.bring.some((i) => i.id === itemId)) throw new CollabError('not-found');
  return { ...c, bring: c.bring.filter((i) => i.id !== itemId) };
}
