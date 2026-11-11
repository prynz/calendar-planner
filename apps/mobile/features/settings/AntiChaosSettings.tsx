import { useState } from 'react';

import { addDays, monthRange, noonOf, punctuality, REMINDER_TONES, weekdayOf, type ReminderTone } from '@nowish/domain';
import { formatLongDate } from '@nowish/i18n';
import { Button, Card, Heatmap, SectionTitle, SegmentedControl, SwitchRow, Text, type HeatmapCell } from '@nowish/ui';

import { weekdayLabels } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { useSettings } from '@/providers/settings';
import { confirm } from '@/services/confirm';
import { haptic } from '@/services/haptics';

/** Reminder tone, buffer learning and the private punctuality summary (anti-chaos-engine.md §1, §2, §5). */
export function AntiChaosSettings() {
  const { store, t, learnedBuffer } = useAgendaContext();
  const { settings, set } = useSettings();
  const [deleteFailed, setDeleteFailed] = useState(false);

  const learningText = !settings.bufferLearning
    ? t('settings.learning.off')
    : learnedBuffer
      ? t('settings.learning.active', { minutes: learnedBuffer.minutes, samples: learnedBuffer.samples })
      : t('settings.learning.waiting');

  const deleteHistory = () => {
    haptic('warning');
    confirm(t('settings.history.confirmTitle'), t('settings.history.confirmBody'), t('common.cancel'), [
      {
        label: t('settings.history.delete'),
        destructive: true,
        onPress: () => {
          store
            .clearJourneys()
            .then(() => setDeleteFailed(false))
            .catch((error: unknown) => {
              console.warn('[settings] delete history failed', error instanceof Error ? error.message : 'unknown');
              setDeleteFailed(true);
            });
        },
      },
    ]);
  };

  return (
    <>
      <SectionTitle>{t('settings.tone')}</SectionTitle>
      <SegmentedControl<ReminderTone>
        options={REMINDER_TONES.map((v) => ({ value: v, label: t(`settings.tone.${v}`) }))}
        value={settings.reminderTone}
        onChange={(v) => {
          haptic('selection');
          set('reminderTone', v);
        }}
        accessibilityLabel={t('settings.tone')}
        testIDPrefix="tone"
      />
      <Text variant="bodyM" color="textSecondary" testID="tone-example">
        {t(`notify.${settings.reminderTone}.leave-now.title`)}
      </Text>
      <SwitchRow
        label={t('settings.learning')}
        value={settings.bufferLearning}
        onChange={(v) => {
          haptic('light');
          set('bufferLearning', v);
        }}
        testID="buffer-learning"
      />
      <Text variant="label" color="textSecondary" testID="buffer-learning-text">
        {learningText}
      </Text>
      <Card testID="punctuality">
        <SectionTitle>{t('settings.punctuality')}</SectionTitle>
        <SwitchRow
          label={t('settings.punctuality.show')}
          value={settings.punctualityStats}
          onChange={(v) => {
            haptic('light');
            set('punctualityStats', v);
          }}
          testID="punctuality-show"
        />
        {settings.punctualityStats ? <PunctualitySummary /> : null}
        <Text variant="label" color="textSecondary">
          {t('settings.punctuality.private')}
        </Text>
        {deleteFailed ? (
          <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
            {t('settings.history.deleteFailed')}
          </Text>
        ) : null}
        <Button
          label={t('settings.history.delete')}
          variant="secondary"
          onPress={deleteHistory}
          disabled={store.journeys.length === 0}
          testID="history-delete"
        />
      </Card>
    </>
  );
}

/** Month summary + heatmap of the viewer's own departures. */
function PunctualitySummary() {
  const { store, t, locale, today: day } = useAgendaContext();
  const timeZone = store.timeZone;
  const { from, toExclusive } = monthRange(day);
  const report = punctuality(store.journeys, from, toExclusive, timeZone);
  const weeks: (HeatmapCell | null)[][] = [];
  let week: (HeatmapCell | null)[] = Array.from({ length: weekdayOf(from) }, () => null);
  for (let d = from; d < toExclusive; d = addDays(d, 1)) {
    const entry = report.byDay[d];
    const date = formatLongDate(noonOf(d, timeZone), locale, timeZone);
    const level = !entry ? 0 : entry.state === 'on-time' ? 3 : entry.state === 'mixed' ? 2 : 1;
    week.push({ key: d, level, label: t(`heatmap.day.${entry ? entry.state : 'none'}`, { date }) });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push([...week, ...Array.from({ length: 7 - week.length }, () => null)]);
  return (
    <>
      <Text variant="titleM" testID="punctuality-summary">
        {t('settings.punctuality.summary', { onTime: report.onTime, total: report.total })}
      </Text>
      <Heatmap weeks={weeks} weekdays={weekdayLabels(locale, timeZone)} testID="punctuality-heatmap" />
      <Text variant="label" color="textSecondary">
        {t('settings.punctuality.legend')}
      </Text>
    </>
  );
}
