import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const ClockContext = createContext<Date>(new Date(0));

/**
 * Current time, refreshed every 30 s so "in 20 min" labels stay true.
 * Tests pass a fixed `now`, which disables ticking.
 */
export function ClockProvider({ children, now: fixed }: { children: ReactNode; now?: Date }) {
  const [now, setNow] = useState(() => fixed ?? new Date());
  useEffect(() => {
    if (fixed) return;
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [fixed]);
  return <ClockContext.Provider value={fixed ?? now}>{children}</ClockContext.Provider>;
}

export function useNow(): Date {
  return useContext(ClockContext);
}
