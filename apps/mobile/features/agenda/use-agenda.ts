import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { dayKeyOf } from '@nowish/domain';

import { useNow } from '@/providers/clock';
import { useEvents } from '@/providers/events';
import { useI18n } from '@/providers/i18n';
import { useSettings } from '@/providers/settings';
import { haptic } from '@/services/haptics';

/** Shared screen context: store, clock, language, settings and navigation helpers. */
export function useAgendaContext() {
  const store = useEvents();
  const now = useNow();
  const { locale, t } = useI18n();
  const { settings } = useSettings();
  const router = useRouter();
  const today = dayKeyOf(now, store.timeZone);

  const openEvent = useCallback(
    (id: string, occurrenceKey: string) => {
      haptic('light');
      router.push({ pathname: '/event/[id]', params: { id, occurrence: occurrenceKey } });
    },
    [router],
  );
  const createEvent = useCallback(
    (day?: string) => {
      haptic('light');
      router.push({ pathname: '/editor', params: day ? { day } : {} });
    },
    [router],
  );

  return { store, now, locale, t, settings, today, openEvent, createEvent, buffer: settings.dawdleBuffer };
}
