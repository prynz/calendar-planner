import { nextId } from '../collab/model';
import { acceptInvite } from './household';
import { FamilyError, type FamilyAction, type Household } from './model';
import { answerRideRequest } from './rides';

export function scheduleFamily(h: Household, actions: readonly FamilyAction[]): Household {
  if (actions.length === 0) return h;
  return { ...h, pending: [...h.pending, ...actions].sort((a, b) => a.at.getTime() - b.at.getTime()) };
}

/** Plays due simulated actions; ones the rules now reject (request withdrawn, item gone) are dropped. */
export function applyDueFamilyActions(h: Household, now: Date): { household: Household; applied: number } {
  const due = h.pending.filter((a) => a.at.getTime() <= now.getTime());
  if (due.length === 0) return { household: h, applied: 0 };
  let next: Household = { ...h, pending: h.pending.filter((a) => a.at.getTime() > now.getTime()) };
  let applied = 0;
  for (const a of due) {
    try {
      if (a.type === 'join') next = acceptInvite(next, a.personId);
      else if (a.type === 'ride-answer')
        next = answerRideRequest(next, a.personId, a.eventId, a.occurrenceKey, a.leg, a.accept);
      else if (a.type === 'shopping-add') {
        if (!next.adultIds.includes(a.personId)) continue;
        next = {
          ...next,
          shopping: [
            ...next.shopping,
            {
              id: nextId('buy', next.shopping, a.at),
              title: a.title.de,
              titleI18n: a.title,
              addedBy: a.personId,
              createdAt: a.at,
            },
          ],
        };
      } else {
        const item = next.shopping.find((i) => i.id === a.itemId);
        if (!item || item.doneAt || !next.adultIds.includes(a.personId)) continue;
        next = {
          ...next,
          shopping: next.shopping.map((i) => (i.id === a.itemId ? { ...i, doneAt: a.at, doneBy: a.personId } : i)),
        };
      }
      applied += 1;
    } catch (error) {
      if (!(error instanceof FamilyError)) throw error;
      // Rule-rejected simulated action: dropped on purpose (see doc comment).
    }
  }
  return { household: next, applied };
}
