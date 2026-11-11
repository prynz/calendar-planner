import { useRouter } from 'expo-router';

import { nextRenewal, trialDaysLeft, trialEndingSoon } from '@nowish/entitlements';
import { formatLongDate } from '@nowish/i18n';
import { Button, Card, SectionTitle, Text } from '@nowish/ui';

import { useAccount } from '@/providers/account';
import { useNow } from '@/providers/clock';
import { useI18n } from '@/providers/i18n';
import { confirm } from '@/services/confirm';
import { haptic } from '@/services/haptics';

/** Plan overview (profile-settings.md „Abo“): tier, source, renewal, cancel in two taps – all Demo. */
export function SubscriptionCard() {
  const { t, locale } = useI18n();
  const now = useNow();
  const { account, tier, cancelPlan, switchToFree } = useAccount();
  const router = useRouter();
  const sub = account.subscription;
  const days = trialDaysLeft(sub, now);
  const renew = nextRenewal(sub, now);
  const fail = (e: unknown) => console.warn('[sub] not saved', e instanceof Error ? e.message : 'unknown');
  const status =
    sub.source === 'trial' && days !== null
      ? t('sub.trial', { days })
      : sub.source === 'demo-purchase' && sub.cancelled
        ? t('sub.cancelled', { date: formatLongDate(sub.renewsAt, locale) })
        : renew
          ? t('sub.renews', { date: formatLongDate(renew, locale) })
          : t('sub.freeLine');
  return (
    <Card testID="subscription">
      <SectionTitle>{t('sub.title')}</SectionTitle>
      <Text variant="titleM" testID="subscription-tier">
        {t('sub.current', { tier: t(`sub.tier.${tier}`) })}
      </Text>
      <Text variant="bodyM" color="textSecondary" testID="subscription-status">
        {status}
      </Text>
      {days !== null && trialEndingSoon(sub, now) ? (
        <Text variant="bodyM" testID="subscription-trial-ending">
          {t('sub.trialEnding', { days })}
        </Text>
      ) : null}
      <Button
        label={t('sub.compare')}
        variant={tier === 'free' ? 'primary' : 'secondary'}
        onPress={() => {
          haptic('light');
          router.push('/paywall');
        }}
        testID="subscription-compare"
      />
      {sub.source === 'demo-purchase' && !sub.cancelled ? (
        <Button
          label={t('sub.cancel')}
          variant="tertiary"
          onPress={() =>
            confirm(t('sub.cancel'), t('sub.cancel.confirm'), t('common.cancel'), [
              { label: t('sub.cancel'), destructive: true, onPress: () => void cancelPlan().catch(fail) },
            ])
          }
          testID="subscription-cancel"
        />
      ) : null}
      {tier !== 'free' ? (
        <Button
          label={sub.source === 'trial' ? t('sub.endTrial') : t('sub.tryFree')}
          variant="tertiary"
          onPress={() => void switchToFree().then(() => haptic('light'), fail)}
          testID="subscription-free"
        />
      ) : null}
      <Text variant="label" color="textSecondary">
        {t('sub.storeHint')}
      </Text>
    </Card>
  );
}
