import { COLLAB_LIMITS, CollabError, nextId, type ChatMessage, type EventCollab, type SimulatedAction } from './model';
import { respond, memberIds } from './rsvp';
import { vote } from './poll';

export function postMessage(c: EventCollab, authorId: string, body: string, now: Date): EventCollab {
  if (!memberIds(c).includes(authorId)) throw new CollabError('not-invited');
  const text = body.trim();
  if (text.length === 0 || text.length > COLLAB_LIMITS.message) throw new CollabError('invalid-input');
  const msg: ChatMessage = { id: nextId('msg', c.messages, now), at: now, type: 'text', authorId, body: text };
  return { ...c, messages: [...c.messages, msg] };
}

export const lastMessage = (c: EventCollab): ChatMessage | undefined => c.messages[c.messages.length - 1];

/** Messages in display order (by time, then insertion). */
export const sortedMessages = (c: EventCollab): ChatMessage[] =>
  c.messages
    .map((m, i) => ({ m, i }))
    .sort((a, b) => a.m.at.getTime() - b.m.at.getTime() || a.i - b.i)
    .map((x) => x.m);

/** Queue simulated actions (kept sorted by time). */
export function schedule(c: EventCollab, actions: readonly SimulatedAction[]): EventCollab {
  if (actions.length === 0) return c;
  return { ...c, pending: [...c.pending, ...actions].sort((a, b) => a.at.getTime() - b.at.getTime()) };
}

/**
 * Applies every simulated action that is due. Actions that are no longer possible (poll closed,
 * person uninvited) are dropped – the simulation never forces state the rules would reject.
 */
export function applyDueActions(c: EventCollab, now: Date): { collab: EventCollab; applied: number } {
  const due = c.pending.filter((a) => a.at.getTime() <= now.getTime());
  if (due.length === 0) return { collab: c, applied: 0 };
  let next: EventCollab = { ...c, pending: c.pending.filter((a) => a.at.getTime() > now.getTime()) };
  let applied = 0;
  for (const a of due) {
    try {
      if (a.type === 'rsvp') next = respond(next, a.personId, a.answer, a.at);
      else if (a.type === 'vote') next = vote(next, a.pollId, a.personId, a.votes, a.at);
      else {
        if (!memberIds(next).includes(a.personId)) continue;
        next = {
          ...next,
          messages: [
            ...next.messages,
            {
              id: nextId('msg', next.messages, a.at),
              at: a.at,
              type: 'text',
              authorId: a.personId,
              body: a.body.de,
              bodyI18n: a.body,
            },
          ],
        };
      }
      applied += 1;
    } catch (error) {
      if (!(error instanceof CollabError)) throw error;
      // Rule-rejected simulated action (e.g. poll closed meanwhile): dropped on purpose, see doc comment.
    }
  }
  return { collab: next, applied };
}
