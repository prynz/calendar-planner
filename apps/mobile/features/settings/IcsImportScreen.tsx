import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { icsEventId, type CalendarEvent, type IcsEntry } from '@nowish/domain';
import { formatShortDate, formatTime } from '@nowish/i18n';
import { Button, Card, EmptyState, SectionTitle, space, Text } from '@nowish/ui';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { DetailShell } from '../shell/DetailShell';
import { haptic } from '@/services/haptics';

import { getPendingImport, setPendingImport } from './pending-import';

type OkEntry = Extract<IcsEntry, { ok: true }>;

/** CAL-09: preview before importing – new, already there (by UID) and problems per entry. */
export function IcsImportScreen() {
  const { store, now, locale, t } = useAgendaContext();
  const router = useRouter();
  const [result] = useState(getPendingImport);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const ok = (result?.entries ?? []).filter((e): e is OkEntry => e.ok);
  const problems = (result?.entries ?? []).filter((e) => !e.ok);
  const exists = (e: OkEntry) => !!store.getEvent(icsEventId(e.uid));
  const fresh = ok.filter((e) => !exists(e));
  const dupes = ok.filter(exists);

  const toEvent = (e: OkEntry): CalendarEvent => {
    const id = icsEventId(e.uid);
    const previous = store.getEvent(id);
    return {
      id,
      kind: previous?.kind ?? 'appointment',
      title: e.event.title,
      location: e.event.location,
      category: previous?.category ?? 'social',
      start: e.event.start,
      end: e.event.end,
      allDay: e.event.allDay,
      timeZone: e.event.timeZone,
      ...(e.event.recurrence ? { recurrence: e.event.recurrence } : {}),
      ...(previous?.travel ? { travel: previous.travel } : {}),
      prepMinutes: previous?.prepMinutes ?? 0,
      arrivalMarginMinutes: previous?.arrivalMarginMinutes ?? 0,
      ...(previous?.hostId ? { hostId: previous.hostId } : {}),
      participantIds: previous?.participantIds ?? [VIEWER_ID],
      isDemo: false,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
  };

  const importAll = () => {
    setError(null);
    store
      .importEvents(ok.map(toEvent))
      .then(() => {
        haptic('success');
        setDone(ok.length);
        setPendingImport(null);
      })
      .catch((e: unknown) => {
        console.warn('[ics] import failed', e instanceof Error ? e.message : 'unknown');
        haptic('warning');
        setError(t('collab.error.save'));
      });
  };

  const row = (e: OkEntry) => (
    <View key={e.index} style={{ gap: space[1] }} testID={`ics-entry-${e.index}`}>
      <Text variant="bodyL">{e.event.title}</Text>
      <Text variant="label" color="textSecondary">
        {e.event.allDay
          ? formatShortDate(e.event.start, locale, e.event.timeZone)
          : `${formatShortDate(e.event.start, locale, e.event.timeZone)} · ${formatTime(e.event.start, locale, e.event.timeZone)}`}
      </Text>
      {e.warnings.map((w) => (
        <Text key={w} variant="label" color="textSecondary">
          {`⚠︎ ${t(`icsImport.warning.${w}`)}`}
        </Text>
      ))}
    </View>
  );

  return (
    <DetailShell
      title={t('icsImport.title')}
      demo={false}
      error={error}
      missing={
        result ? null : { title: t('icsImport.title'), body: t('icsImport.nothing'), testID: 'ics-import-missing' }
      }
      testID="screen-ics-import"
      backTestID="ics-import-back"
    >
      {done !== null ? (
        <EmptyState
          title={t('icsImport.done', { count: done })}
          body=""
          action={{ label: t('common.close'), onPress: () => router.back() }}
          testID="ics-import-done"
        />
      ) : (
        <>
          <Text variant="titleM" testID="ics-import-summary">
            {t('icsImport.summary', { new: fresh.length, dupes: dupes.length })}
          </Text>
          {result && result.skippedCancelled > 0 ? (
            <Text variant="bodyM" color="textSecondary">
              {t('icsImport.cancelled', { count: result.skippedCancelled })}
            </Text>
          ) : null}
          {fresh.length > 0 ? (
            <Card>
              <SectionTitle>{t('icsImport.new')}</SectionTitle>
              {fresh.map(row)}
            </Card>
          ) : null}
          {dupes.length > 0 ? (
            <Card>
              <SectionTitle>{t('icsImport.duplicate')}</SectionTitle>
              {dupes.map(row)}
            </Card>
          ) : null}
          {problems.length > 0 ? (
            <Card testID="ics-import-problems">
              <SectionTitle>{t('icsImport.problems')}</SectionTitle>
              {problems.map((p) =>
                p.ok ? null : (
                  <Text key={p.index} variant="bodyM">
                    {`${p.title ?? t('icsImport.untitled')} – ${t(`icsImport.error.${p.error}`)}`}
                  </Text>
                ),
              )}
            </Card>
          ) : null}
          <Button
            label={ok.length > 0 ? t('icsImport.confirm', { count: ok.length }) : t('icsImport.nothing')}
            onPress={importAll}
            disabled={ok.length === 0}
            testID="ics-import-confirm"
          />
        </>
      )}
    </DetailShell>
  );
}
