import { useCallback, useState } from 'react';

import { agendaBetween } from '@nowish/demo';
import { addDays, FamilyError } from '@nowish/domain';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import type { HouseholdUpdate } from '@/providers/events';
import { haptic } from '@/services/haptics';

/** Days the family overview and rides look ahead (FAM-05: "this week"). */
export const FAMILY_DAYS = 7;

/**
 * Screen-level access to the family space: household, the next 7 days of the calendar and a `run`
 * helper that applies a domain operation and turns domain errors into friendly, visible messages.
 */
export function useFamily() {
  const ctx = useAgendaContext();
  const { store, t, today } = ctx;
  const [error, setError] = useState<string | null>(null);
  const household = store.household;
  const week = agendaBetween(store.events, today, addDays(today, FAMILY_DAYS), store.timeZone);

  const run = useCallback(
    async (fn: HouseholdUpdate, success: 'success' | 'light' | 'selection' = 'light'): Promise<boolean> => {
      setError(null);
      try {
        await store.updateHousehold(fn);
        haptic(success);
        return true;
      } catch (e) {
        haptic('warning');
        if (e instanceof FamilyError) setError(t(`family.error.${e.code}`));
        else {
          console.warn('[family] update failed', e instanceof Error ? e.message : 'unknown');
          setError(t('family.error.save'));
        }
        return false;
      }
    },
    [store, t],
  );

  return { ...ctx, household, week, run, error, showError: setError, viewerId: VIEWER_ID };
}

export type FamilyContext = ReturnType<typeof useFamily>;
