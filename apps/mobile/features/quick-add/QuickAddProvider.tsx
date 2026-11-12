import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { DayKey } from '@nowish/domain';

import { haptic } from '@/services/haptics';

import { QuickAddSheet } from './QuickAddSheet';

interface QuickAddContextValue {
  /** Opens the one-line quick entry; `day` presets the date (e.g. a free gap on another day). */
  open: (day?: DayKey) => void;
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

/** Phase 8: the "+" button opens a sheet instead of a full page – most plans fit in one line. */
export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; day?: DayKey }>({ open: false });
  const router = useRouter();
  const open = useCallback((day?: DayKey) => {
    haptic('light');
    setState(day ? { open: true, day } : { open: true });
  }, []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <QuickAddContext.Provider value={value}>
      {children}
      <QuickAddSheet
        visible={state.open}
        {...(state.day ? { day: state.day } : {})}
        onClose={close}
        onDetails={(params) => {
          close();
          router.push({ pathname: '/editor', params });
        }}
      />
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd(): QuickAddContextValue {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error('useQuickAdd must be used inside <QuickAddProvider>');
  return ctx;
}
