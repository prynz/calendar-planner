import { useEffect, type RefObject } from 'react';

/** How often due demo actions are checked. Short enough that replies feel live, cheap enough to idle. */
export const SIMULATION_TICK_MS = 1000;

/**
 * Plays the queued actions of simulated demo people (ADR 0010, ADR 0012, ADR 0014). `step` returns null
 * when nothing is due, so an idle world causes no writes and no re-renders.
 */
export function useSimulation({
  enabled,
  nowRef,
  step,
}: {
  enabled: boolean;
  nowRef: RefObject<() => Date>;
  step: (now: Date) => Promise<void> | null;
}) {
  useEffect(() => {
    if (!enabled) return;
    let busy = false;
    const id = setInterval(() => {
      if (busy) return;
      const run = step(nowRef.current());
      if (!run) return;
      busy = true;
      run
        .catch((error: unknown) => {
          // The queued actions stay pending and are retried on the next tick.
          console.warn('[simulation] save failed', error instanceof Error ? error.message : 'unknown');
        })
        .finally(() => {
          busy = false;
        });
    }, SIMULATION_TICK_MS);
    return () => clearInterval(id);
  }, [enabled, nowRef, step]);
}
