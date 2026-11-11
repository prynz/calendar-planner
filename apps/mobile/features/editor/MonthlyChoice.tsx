import { nthOfDay, parseDayKey, type EventDraft } from '@nowish/domain';
import type { Locale, Translate } from '@nowish/i18n';
import { ChipGroup } from '@nowish/ui';

import { weekdayLabels } from '../agenda/presenters';
import { haptic } from '@/services/haptics';

/**
 * Monthly repeat: "on the 6th" or "every 1st Friday" (GRP-04). The ordinal always follows the chosen date,
 * so changing the date never leaves a stale rule behind (see `withMonthlyRule`).
 */
export function MonthlyChoice({
  draft,
  onChange,
  locale,
  timeZone,
  t,
}: {
  draft: EventDraft;
  onChange: (next: EventDraft) => void;
  locale: Locale;
  timeZone: string;
  t: Translate;
}) {
  if (draft.recurrence?.freq !== 'monthly') return null;
  const nth = nthOfDay(draft.day);
  const weekday = weekdayLabels(locale, timeZone, 'long')[nth.weekday] ?? '';
  const value = draft.recurrence.byNthWeekday ? 'nth' : 'day';
  return (
    <ChipGroup
      options={[
        { value: 'day', label: t('editor.repeat.monthlyDay', { day: parseDayKey(draft.day).dayOfMonth }) },
        { value: 'nth', label: t('editor.repeat.monthlyNth', { nth: t(`nth.${nth.nth}`), weekday }) },
      ]}
      selected={[value]}
      onToggle={(v) => {
        haptic('selection');
        if (!draft.recurrence) return;
        const { byNthWeekday: _n, ...rest } = draft.recurrence;
        onChange({ ...draft, recurrence: v === 'nth' ? { ...rest, byNthWeekday: nth } : rest });
      }}
      accessibilityLabel={t('editor.field.repeat')}
      testIDPrefix="editor-monthly"
    />
  );
}

/** Keeps an "n-th weekday" rule in step with the draft's date. */
export function withMonthlyRule(d: EventDraft): EventDraft {
  if (!d.recurrence?.byNthWeekday) return d;
  return { ...d, recurrence: { ...d.recurrence, byNthWeekday: nthOfDay(d.day) } };
}
