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

import { journeyId, markLeft, newJourney } from '@nowish/domain';
import { useRouter } from 'expo-router';

import { effectiveBuffer } from '@/features/leave/buffer';
import { planReminders } from '@/features/reminders/plan';
import { useNow } from '@/providers/clock';
import { useAccount } from '@/providers/account';
import { useEvents } from '@/providers/events';
import { useI18n } from '@/providers/i18n';
import { useSettings } from '@/providers/settings';
import {
  getPermission,
  onReminderResponse,
  openSystemSettings,
  replaceScheduled,
  requestPermission,
  setupActions,
  type PermissionState,
  type ReminderResponse,
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
  const store = useEvents();
  const { events, state, timeZone, journeys } = store;
  const router = useRouter();
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

  const { limits } = useAccount();
  const buffer = effectiveBuffer(settings, journeys, limits.bufferLearning).minutes;

  // Reminder actions: "on my way" records the departure, "running late" and plain taps open the event.
  const storeRef = useRef(store);
  useLayoutEffect(() => {
    storeRef.current = store;
  });
  useEffect(() => {
    if (state !== 'ready') return;
    const handle = (r: ReminderResponse) => {
      if (r.action === 'on-my-way') {
        const id = journeyId(r.eventId, r.occurrenceKey);
        const current = storeRef.current.getJourney(id) ?? newJourney(r.eventId, r.occurrenceKey, r.plannedLeaveAt);
        storeRef.current.saveJourney(markLeft(current, new Date())).catch((error: unknown) => {
          console.warn('[reminders] could not record departure', error instanceof Error ? error.message : 'unknown');
        });
        return;
      }
      router.push({
        pathname: '/event/[id]',
        params: { id: r.eventId, occurrence: r.occurrenceKey, ...(r.action === 'running-late' ? { late: '1' } : {}) },
      });
    };
    return onReminderResponse(handle);
  }, [state, router]);

  useEffect(() => {
    setupActions({ onMyWay: t('notify.action.onMyWay'), runningLate: t('notify.action.runningLate') }).catch(
      (error: unknown) => {
        console.warn('[reminders] actions not available', error instanceof Error ? error.message : 'unknown');
      },
    );
  }, [t]);

  useEffect(() => {
    if (permission !== 'granted' || state !== 'ready') return;
    const plan = planReminders({
      events,
      journeys,
      now: nowRef.current,
      timeZone,
      intensity: settings.reminderIntensity,
      // Free: one reminder in the casual tone (tone choice is part of Plus).
      tone: limits.reminderStages === 'all' ? settings.reminderTone : 'casual',
      stages: limits.reminderStages,
      bufferMinutes: buffer,
      locale,
      t,
    });
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
  }, [
    permission,
    state,
    events,
    journeys,
    timeZone,
    settings.reminderIntensity,
    settings.reminderTone,
    limits.reminderStages,
    buffer,
    locale,
    t,
    minuteBucket,
  ]);

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
