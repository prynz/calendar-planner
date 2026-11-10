import { useEffect, type RefObject } from 'react';

import { applyDueActions, type EventCollab } from '@nowish/domain';

/** How often due demo actions are checked. Short enough that replies feel live, cheap enough to idle. */
export const SIMULATION_TICK_MS = 1000;

/**
 * Plays the queued actions of simulated demo people (ADR 0010, ADR 0012). Only documents with due actions
 * are touched, so an idle world causes no writes and no re-renders.
 */
export function useSimulation({
  enabled,
  collabsRef,
  nowRef,
  save,
}: {
  enabled: boolean;
  collabsRef: RefObject<EventCollab[]>;
  nowRef: RefObject<() => Date>;
  save: (changed: readonly EventCollab[]) => Promise<void>;
}) {
  useEffect(() => {
    if (!enabled) return;
    let busy = false;
    const id = setInterval(() => {
      if (busy) return;
      const now = nowRef.current();
      const changed = collabsRef.current
        .filter((c) => c.pending.some((a) => a.at.getTime() <= now.getTime()))
        .map((c) => applyDueActions(c, now).collab);
      if (changed.length === 0) return;
      busy = true;
      save(changed)
        .catch((error: unknown) => {
          // The queued actions stay pending and are retried on the next tick.
          console.warn('[simulation] save failed', error instanceof Error ? error.message : 'unknown');
        })
        .finally(() => {
          busy = false;
        });
    }, SIMULATION_TICK_MS);
    return () => clearInterval(id);
  }, [enabled, collabsRef, nowRef, save]);
}
