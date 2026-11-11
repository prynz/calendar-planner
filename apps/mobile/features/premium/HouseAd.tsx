import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { canShowAd, type AdSlot } from '@nowish/entitlements';
import { Badge, Button, Card, IconButton, Text } from '@nowish/ui';

import { useAccount } from '@/providers/account';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

/** Our own ads only (monetization.md §4) – the catalog the admin will manage in block B4. */
const ADS = [
  { id: 'plus', go: { pathname: '/paywall', params: { tier: 'plus' } } },
  { id: 'templates', go: { pathname: '/templates', params: {} } },
  { id: 'family', go: { pathname: '/paywall', params: { tier: 'family' } } },
] as const;

/**
 * A house-ad slot. Renders nothing unless the rules allow it: Free plan, allowed surface, not the first
 * session, within the caps, not dismissed today. Always labelled "Ad" and closable at once (0 s).
 */
export function HouseAd({ slot, surface }: { slot: AdSlot; surface: string }) {
  const { t } = useI18n();
  const account = useAccount();
  const router = useRouter();
  const s = account.adState(slot);
  // Decided once when the slot appears: counting the impression must not make the ad vanish again.
  const [allowed] = useState(() => canShowAd({ tier: account.tier, slot, surface, ...s }));
  const ad = ADS[Number(account.account.ads.day.slice(-2)) % ADS.length] ?? ADS[0];

  const { adShown } = account;
  useEffect(() => {
    if (allowed) adShown(slot);
    // Counted once per appearance of the slot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, slot]);

  if (!allowed || s.dismissedToday) return null;
  return (
    <Card testID={`ad-${slot}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Badge label={t('ad.label')} tone="neutral" />
        <IconButton
          icon={(c) => <X color={c} size={18} />}
          onPress={() => {
            haptic('light');
            account.adDismissed(slot);
          }}
          accessibilityLabel={t('ad.close')}
          testID={`ad-${slot}-close`}
        />
      </View>
      <Text variant="titleM">{t(`ad.${ad.id}.title`)}</Text>
      <Text variant="bodyM" color="textSecondary">
        {t(`ad.${ad.id}.body`)}
      </Text>
      <Button
        label={t(`ad.${ad.id}.cta`)}
        variant="secondary"
        onPress={() => {
          haptic('light');
          router.push(ad.go);
        }}
        testID={`ad-${slot}-cta`}
      />
      <Text variant="label" color="textSecondary">
        {t('ad.preview')}
      </Text>
    </Card>
  );
}
