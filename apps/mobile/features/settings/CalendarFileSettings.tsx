import { useRouter } from 'expo-router';
import { useState } from 'react';

import { exportIcs, parseIcs } from '@nowish/domain';
import { Button, Card, SectionTitle, Text } from '@nowish/ui';

import { useAgendaContext } from '../agenda/use-agenda';
import { pickCalendarText, shareCalendarText } from '@/services/calendar-file';
import { haptic } from '@/services/haptics';

import { setPendingImport } from './pending-import';

/** CAL-09: import and export calendar files – local only, no account. */
export function CalendarFileSettings() {
  const { store, now, locale, t } = useAgendaContext();
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const doExport = () => {
    setMessage(null);
    haptic('light');
    shareCalendarText(exportIcs(store.events, now, locale), 'nowish.ics', t('ics.export'))
      .then(() => setMessage({ text: t('ics.exported', { count: store.events.length }), error: false }))
      .catch((e: unknown) => {
        console.warn('[ics] share failed', e instanceof Error ? e.message : 'unknown');
        setMessage({ text: t('ics.error.share'), error: true });
      });
  };

  const doImport = () => {
    setMessage(null);
    haptic('light');
    pickCalendarText()
      .then((text) => {
        if (text === null) return;
        const result = parseIcs(text, store.timeZone);
        if (!result.ok) {
          haptic('warning');
          setMessage({ text: t(`ics.error.${result.error}`), error: true });
          return;
        }
        setPendingImport(result);
        router.push('/ics-import');
      })
      .catch((e: unknown) => {
        // Never log file contents or names (privacy.md) – only that reading failed.
        console.warn('[ics] read failed', e instanceof Error ? e.name : 'unknown');
        setMessage({ text: t('ics.error.read'), error: true });
      });
  };

  return (
    <Card testID="calendar-file">
      <SectionTitle>{t('ics.title')}</SectionTitle>
      <Text variant="bodyM" color="textSecondary">
        {t('ics.hint')}
      </Text>
      <Button label={t('ics.import')} variant="secondary" onPress={doImport} testID="ics-import" />
      <Button label={t('ics.export')} variant="secondary" onPress={doExport} testID="ics-export" />
      {message ? (
        <Text
          variant="bodyM"
          color={message.error ? 'dangerText' : 'textSecondary'}
          accessibilityLiveRegion="polite"
          testID="ics-message"
          {...(message.error ? { accessibilityRole: 'alert' as const } : {})}
        >
          {message.text}
        </Text>
      ) : null}
    </Card>
  );
}
