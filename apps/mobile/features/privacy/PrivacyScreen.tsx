import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { householdMemberIds } from '@nowish/domain';
import { Button, Card, SectionTitle, space, Text } from '@nowish/ui';

import { DetailShell } from '../shell/DetailShell';
import { useAccount } from '@/providers/account';
import { useDone } from '@/providers/done';
import { useEvents } from '@/providers/events';
import { useI18n } from '@/providers/i18n';
import { useNow } from '@/providers/clock';
import { shareTextFile } from '@/services/calendar-file';
import { confirm } from '@/services/confirm';
import { haptic } from '@/services/haptics';

/**
 * Privacy centre (profile-settings.md): what is stored – with counts –, what is not, consents, data export
 * (Art. 20 GDPR) and deleting everything. All of it concerns this device only.
 */
export function PrivacyScreen() {
  const { t } = useI18n();
  const store = useEvents();
  const done = useDone();
  const account = useAccount();
  const now = useNow();
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const h = store.household;

  const exportData = () => {
    setMessage(null);
    const data = {
      exportedAt: now.toISOString(),
      app: 'Nowish prototype',
      profile: account.account,
      events: store.events,
      collaboration: store.collabs,
      departureHistory: store.journeys,
      ticked: done.keys,
      family: h,
      groups: store.groups,
    };
    shareTextFile(
      JSON.stringify(data, null, 2),
      'nowish-data.json',
      t('privacy.export'),
      'application/json',
      'public.json',
    )
      .then(() => setMessage({ text: t('privacy.exported'), error: false }))
      .catch((e: unknown) => {
        console.warn('[privacy] export failed', e instanceof Error ? e.message : 'unknown');
        setMessage({ text: t('ics.error.share'), error: true });
      });
  };

  const deleteAll = () =>
    confirm(t('privacy.delete.confirm'), t('privacy.delete.confirmBody'), t('common.cancel'), [
      {
        label: t('privacy.delete'),
        destructive: true,
        onPress: () => {
          store
            .deleteAll()
            .then(() => done.clear())
            .then(() => account.reset())
            .then(() => {
              haptic('success');
              router.replace('/onboarding');
            })
            .catch((e: unknown) => {
              console.warn('[privacy] delete failed', e instanceof Error ? e.message : 'unknown');
              setMessage({ text: t('privacy.delete.failed'), error: true });
            });
        },
      },
    ]);

  const stored = [
    t('privacy.item.events', { count: store.events.length }),
    t('privacy.item.collabs', { count: store.collabs.length }),
    t('privacy.item.journeys', { count: store.journeys.length }),
    t('privacy.item.done', { count: done.keys.length }),
    t('privacy.item.family', { count: h ? householdMemberIds(h).length : 0 }),
    t('privacy.item.groups', { count: store.groups.length }),
    t('privacy.item.profile'),
  ];
  const notStored = ['birthday', 'location', 'tracking', 'contacts'] as const;

  return (
    <DetailShell
      title={t('privacy.title')}
      demo={false}
      error={null}
      missing={null}
      testID="screen-privacy"
      backTestID="privacy-back"
    >
      <Text variant="bodyL">{t('privacy.intro')}</Text>
      <Card testID="privacy-stored">
        <SectionTitle>{t('privacy.stored')}</SectionTitle>
        {stored.map((line) => (
          <Text key={line} variant="bodyM">{`• ${line}`}</Text>
        ))}
      </Card>
      <Card>
        <SectionTitle>{t('privacy.not')}</SectionTitle>
        {notStored.map((k) => (
          <Text key={k} variant="bodyM" color="textSecondary">{`✕ ${t(`privacy.not.${k}`)}`}</Text>
        ))}
      </Card>
      <Card>
        <SectionTitle>{t('privacy.consents')}</SectionTitle>
        <Text variant="bodyM" color="textSecondary">
          {t('privacy.consent.liveEta')}
        </Text>
        <Text variant="bodyM" color="textSecondary">
          {t('privacy.consent.ai')}
        </Text>
      </Card>
      <View style={{ gap: space[2] }}>
        <Button label={t('privacy.export')} variant="secondary" onPress={exportData} testID="privacy-export" />
        <Text variant="label" color="textSecondary">
          {t('privacy.export.hint')}
        </Text>
      </View>
      <View style={{ gap: space[2] }}>
        <Button label={t('privacy.delete')} variant="tertiary" onPress={deleteAll} testID="privacy-delete" />
        <Text variant="label" color="textSecondary">
          {t('privacy.delete.hint')}
        </Text>
      </View>
      {message ? (
        <Text
          variant="bodyM"
          color={message.error ? 'dangerText' : 'textSecondary'}
          accessibilityLiveRegion="polite"
          testID="privacy-message"
        >
          {message.text}
        </Text>
      ) : null}
      <Card>
        <SectionTitle>{t('privacy.legal')}</SectionTitle>
        <Text variant="bodyM" color="textSecondary">
          {t('privacy.legal.draft')}
        </Text>
      </Card>
    </DetailShell>
  );
}
