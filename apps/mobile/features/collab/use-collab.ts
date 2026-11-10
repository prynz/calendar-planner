import { useCallback, useState } from 'react';

import { CollabError } from '@nowish/domain';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import type { CollabUpdate } from '@/providers/events';
import { haptic } from '@/services/haptics';

import { nameOf } from './text';

/**
 * Screen-level access to one social event: event, collaboration document, viewer role and a `run`
 * helper that applies a domain operation and turns domain errors into friendly, visible messages.
 */
export function useCollab(eventId: string) {
  const ctx = useAgendaContext();
  const { store, t } = ctx;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const event = store.getEvent(eventId);
  const collab = store.getCollab(eventId);

  const run = useCallback(
    async (fn: CollabUpdate, success: 'success' | 'light' | 'selection' = 'light'): Promise<boolean> => {
      setError(null);
      setBusy(true);
      try {
        await store.updateCollab(eventId, fn);
        haptic(success);
        return true;
      } catch (e) {
        haptic('warning');
        if (e instanceof CollabError) {
          setError(t(`collab.error.${e.code}`, { name: e.personId ? nameOf(e.personId, t) : '' }));
        } else {
          console.warn('[collab] update failed', e instanceof Error ? e.message : 'unknown');
          setError(t('collab.error.save'));
        }
        return false;
      } finally {
        setBusy(false);
      }
    },
    [store, eventId, t],
  );

  return {
    ...ctx,
    event,
    collab,
    isHost: collab?.hostId === VIEWER_ID,
    viewerId: VIEWER_ID,
    run,
    busy,
    error,
    clearError: () => setError(null),
    showError: setError,
    name: (id: string) => nameOf(id, t),
  };
}

export type CollabContext = ReturnType<typeof useCollab>;
