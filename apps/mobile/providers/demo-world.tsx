import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { buildDemoWorld, DEMO_TIME_ZONE, type DemoWorld } from '@nowish/demo';
import { dayKeyOf } from '@nowish/domain';

import { useNow } from './clock';

const DemoWorldContext = createContext<DemoWorld | null>(null);

/** Demo world (ADR 0008), rebuilt when the calendar day changes. */
export function DemoWorldProvider({ children }: { children: ReactNode }) {
  const now = useNow();
  const today = dayKeyOf(now, DEMO_TIME_ZONE);
  // Rebuild only when the day changes, not on every clock tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `now` intentionally reduced to `today`
  const world = useMemo(() => buildDemoWorld(now), [today]);
  return <DemoWorldContext.Provider value={world}>{children}</DemoWorldContext.Provider>;
}

export function useDemoWorld(): DemoWorld {
  const ctx = useContext(DemoWorldContext);
  if (!ctx) throw new Error('useDemoWorld must be used inside <DemoWorldProvider>');
  return ctx;
}
