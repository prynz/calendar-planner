import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { planReminders } from '@/features/reminders/plan';
import { useNow } from '@/providers/clock';
import { useEvents } from '@/providers/events';
import { useI18n } from '@/providers/i18n';
import { useSettings } from '@/providers/settings';
import {
  getPermission,
  openSystemSettings,
  replaceScheduled,
  requestPermission,
  type PermissionState,
} from '@/services/notifications';

interface RemindersValue {
  permission: PermissionState | 'checking';
  /** Reminders currently scheduled on the device for an event (all its occurrences in the next week). */
  scheduledFor: (eventId: string) => number;
  request: () => Promise<void>;
  openSettings: () => void;
}

const RemindersContext = createContext<RemindersValue | null>(null);

/**
 * Keeps the device's local notifications in sync with events and settings (offline, no account –
 * ADR 0010). Rescheduling is idempotent and debounced; the clock tick re-plans every 30 s so passed
 * stages drop out.
 */
export function RemindersProvider({ children }: { children: ReactNode }) {
  const { events, state, timeZone } = useEvents();
  const { settings } = useSettings();
  const { locale, t } = useI18n();
  const now = useNow();
  const [permission, setPermission] = useState<PermissionState | 'checking'>('checking');
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  // Plan with the app clock (testable), but re-plan at most every 5 minutes – not on every 30 s tick.
  const nowRef = useRef(now);
  useLayoutEffect(() => {
    nowRef.current = now;
  });
  const minuteBucket = Math.floor(now.getTime() / (5 * 60_000));

  useEffect(() => {
    let alive = true;
    getPermission().then((p) => alive && setPermission(p));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (permission !== 'granted' || state !== 'ready') return;
    const plan = planReminders(
      events,
      nowRef.current,
      timeZone,
      settings.reminderIntensity,
      settings.dawdleBuffer,
      locale,
      t,
    );
    let alive = true;
    const timer = setTimeout(() => {
      replaceScheduled(plan, t('settings.reminders'))
        .then((c) => alive && setCounts(c))
        .catch((error: unknown) => {
          console.warn('[reminders] scheduling failed', error instanceof Error ? error.message : 'unknown');
        });
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [permission, state, events, timeZone, settings.reminderIntensity, settings.dawdleBuffer, locale, t, minuteBucket]);

  const request = useCallback(async () => {
    try {
      setPermission(await requestPermission(t('settings.reminders')));
    } catch (error) {
      console.warn('[reminders] permission request failed', error instanceof Error ? error.message : 'unknown');
      setPermission('unavailable');
    }
  }, [t]);

  const value = useMemo<RemindersValue>(
    () => ({ permission, scheduledFor: (id) => counts.get(id) ?? 0, request, openSettings: openSystemSettings }),
    [permission, counts, request],
  );
  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used inside <RemindersProvider>');
  return ctx;
}
