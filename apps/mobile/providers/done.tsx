import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { addDays, dayKeyOf, type DayKey } from '@nowish/domain';

import { useNow } from '@/providers/clock';

import type { SettingsStore } from '@/storage/settings-store';

/**
 * Phase 9: plans ticked off as done, per occurrence (`eventId@day`). Private and only on this device – a
 * personal checklist, not an RSVP. Entries older than KEEP_DAYS are dropped so the list cannot grow forever.
 */
const KEY = 'today.done';
const KEEP_DAYS = 30;

const dayOf = (key: string): DayKey | null => {
  const day = key.split('@')[1];
  return day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
};

export function parseDone(raw: string | null, today: DayKey): Set<string> {
  if (!raw) return new Set();
  const oldest = addDays(today, -KEEP_DAYS);
  return new Set(
    raw.split(',').filter((k) => {
      const day = dayOf(k);
      return day !== null && day >= oldest;
    }),
  );
}

interface DoneContextValue {
  isDone: (key: string) => boolean;
  toggle: (key: string) => void;
  /** All ticked-off occurrences – for the privacy centre's count and export. */
  keys: readonly string[];
  /** Privacy centre "delete all data". */
  clear: () => Promise<void>;
  /** Set when the last save failed; the change still applies for this session. */
  saveFailed: boolean;
}

const DoneContext = createContext<DoneContextValue | null>(null);

export function DoneProvider({
  store,
  timeZone,
  children,
}: {
  store: SettingsStore;
  timeZone: string;
  children: ReactNode;
}) {
  const today = dayKeyOf(useNow(), timeZone);
  const [done, setDone] = useState<Set<string>>(new Set());
  const doneRef = useRef(done);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    store
      .get(KEY)
      .then((raw) => {
        if (!alive) return;
        const loaded = parseDone(raw, today);
        doneRef.current = loaded;
        setDone(loaded);
      })
      .catch((error: unknown) => {
        // Starts empty; ticking off still works for this session.
        console.warn('[done] load failed', error instanceof Error ? error.name : 'unknown');
      });
    return () => {
      alive = false;
    };
  }, [store, today]);

  const toggle = useCallback(
    (key: string) => {
      const next = new Set(doneRef.current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      doneRef.current = next;
      setDone(next);
      store
        .set(KEY, [...next].join(','))
        .then(() => setSaveFailed(false))
        .catch((error: unknown) => {
          console.warn('[done] save failed', error instanceof Error ? error.name : 'unknown');
          setSaveFailed(true);
        });
    },
    [store],
  );

  const clear = useCallback(async () => {
    doneRef.current = new Set();
    setDone(new Set());
    await store.set(KEY, '');
  }, [store]);

  const value = useMemo<DoneContextValue>(
    () => ({ isDone: (k) => done.has(k), toggle, keys: [...done], clear, saveFailed }),
    [done, toggle, clear, saveFailed],
  );
  return <DoneContext.Provider value={value}>{children}</DoneContext.Provider>;
}

export function useDone(): DoneContextValue {
  const ctx = useContext(DoneContext);
  if (!ctx) throw new Error('useDone must be used inside <DoneProvider>');
  return ctx;
}
