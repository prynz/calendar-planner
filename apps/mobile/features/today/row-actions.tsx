import { useState, type ReactElement } from 'react';

import type { AgendaItem } from '@nowish/demo';
import { displayTitle } from '@nowish/domain';
import { SwipeRow, type ListRowProps } from '@nowish/ui';

import { useAgendaContext } from '../agenda/use-agenda';
import { useDone } from '@/providers/done';
import { haptic } from '@/services/haptics';
import { itemKey } from './insights';
import { LaterSheet } from './LaterSheet';

export interface RowExtras {
  isDone: boolean;
  /** Pass to `ListRow.check`. */
  check: NonNullable<ListRowProps['check']>;
  /** Appended to the row's screen-reader label. */
  a11ySuffix: string;
}

/**
 * Tick off + swipe for any list of plans (Phase 9 on "Today", Phase 10 in Calendar and Events): right = done,
 * left = "later". The same behaviour everywhere so people only learn it once. Render `sheet` once per screen.
 */
export function useRowActions() {
  const { t, locale } = useAgendaContext();
  const done = useDone();
  const [later, setLater] = useState<AgendaItem | null>(null);

  const wrap = (item: AgendaItem, render: (extras: RowExtras) => ReactElement, key?: string) => {
    const k = itemKey(item);
    const e = item.event;
    const isDone = done.isDone(k);
    const title = displayTitle(e, locale);
    const toggle = () => {
      haptic(isDone ? 'selection' : 'success');
      done.toggle(k);
    };
    return (
      <SwipeRow
        key={key ?? k}
        right={{ label: isDone ? t('swipe.undo') : t('swipe.done'), onAction: toggle }}
        left={{ label: t('swipe.later'), onAction: () => setLater(item) }}
        onThreshold={() => haptic('selection')}
        testID={`swipe-${e.id}`}
      >
        {render({
          isDone,
          check: {
            checked: isDone,
            onToggle: toggle,
            label: isDone ? t('done.unmark', { title }) : t('done.mark', { title }),
            testID: `done-${e.id}`,
          },
          a11ySuffix: isDone ? `, ${t('done.label')}` : '',
        })}
      </SwipeRow>
    );
  };

  return { wrap, sheet: <LaterSheet item={later} onClose={() => setLater(null)} /> };
}
