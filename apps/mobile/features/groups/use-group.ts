import { useCallback, useState } from 'react';

import { agendaBetween, type AgendaItem } from '@nowish/demo';
import { addDays, GroupError, localized, type CalendarEvent, type Group } from '@nowish/domain';
import type { Locale } from '@nowish/i18n';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { nameOf } from '../collab/text';
import type { GroupUpdate } from '@/providers/events';
import { haptic } from '@/services/haptics';

/** How far ahead the next meeting is looked up (covers monthly meetings). */
const HORIZON_DAYS = 62;

export const groupName = (g: Group, locale: Locale) => localized(g.name, g.nameI18n, locale);

/** The next not-yet-finished occurrence of each meeting, soonest first. */
export function nextMeetings(
  g: Group,
  events: readonly CalendarEvent[],
  today: string,
  now: Date,
  timeZone: string,
): AgendaItem[] {
  const own = events.filter((e) => g.meetingIds.includes(e.id));
  const seen = new Set<string>();
  return agendaBetween(own, today, addDays(today, HORIZON_DAYS), timeZone).filter((i) => {
    if (i.end.getTime() <= now.getTime() || seen.has(i.event.id)) return false;
    seen.add(i.event.id);
    return true;
  });
}

/** Screen-level access to one group with a `run` helper that turns domain errors into visible messages. */
export function useGroup(groupId: string) {
  const ctx = useAgendaContext();
  const { store, t } = ctx;
  const [error, setError] = useState<string | null>(null);
  const group = store.getGroup(groupId);

  const run = useCallback(
    async (fn: GroupUpdate, success: 'success' | 'light' | 'selection' = 'light'): Promise<boolean> => {
      setError(null);
      try {
        await store.updateGroup(groupId, fn);
        haptic(success);
        return true;
      } catch (e) {
        haptic('warning');
        if (e instanceof GroupError) setError(t(`groups.error.${e.code}`));
        else {
          console.warn('[groups] update failed', e instanceof Error ? e.message : 'unknown');
          setError(t('groups.error.save'));
        }
        return false;
      }
    },
    [store, groupId, t],
  );

  return { ...ctx, group, run, error, showError: setError, viewerId: VIEWER_ID, name: (id: string) => nameOf(id, t) };
}

export type GroupContext = ReturnType<typeof useGroup>;
