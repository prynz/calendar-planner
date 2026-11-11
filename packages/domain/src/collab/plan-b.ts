import { COLLAB_LIMITS, CollabError, nextId, type EventCollab } from './model';

/** Host marks the event as outdoor (weather matters) and sets an alternative place. */
export function setPlanB(c: EventCollab, by: string, input: { outdoor: boolean; location: string }): EventCollab {
  if (c.hostId !== by) throw new CollabError('not-host');
  const location = input.location.trim();
  if (location.length > COLLAB_LIMITS.location) throw new CollabError('invalid-input');
  const { planB: _p, ...rest } = c;
  return {
    ...rest,
    outdoor: input.outdoor,
    ...(location ? { planB: { location, active: c.planB?.active === true && c.planB.location === location } } : {}),
  };
}

/** Switch to plan B (or back); everyone sees a note in the chat. */
export function togglePlanB(c: EventCollab, by: string, now: Date): EventCollab {
  if (c.hostId !== by) throw new CollabError('not-host');
  if (!c.planB) throw new CollabError('invalid-input');
  const active = !c.planB.active;
  return {
    ...c,
    planB: { ...c.planB, active },
    messages: active
      ? [
          ...c.messages,
          {
            id: nextId('planb', c.messages, now),
            at: now,
            type: 'system',
            note: { kind: 'plan-b', personId: by, location: c.planB.location },
          },
        ]
      : c.messages,
  };
}
