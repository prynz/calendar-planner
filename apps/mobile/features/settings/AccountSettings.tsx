import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, MemberAvatar, SectionTitle, space, Text } from '@nowish/ui';

import { HouseAd } from '../premium/HouseAd';
import { SubscriptionCard } from '../premium/SubscriptionCard';
import { useAccount } from '@/providers/account';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

/** Top of "Me": profile, plan (Demo), privacy centre – and the settings ad slot on Free. */
export function AccountSettings() {
  const { t } = useI18n();
  const { account } = useAccount();
  const router = useRouter();
  const go = (pathname: '/profile' | '/privacy' | '/personalize') => {
    haptic('light');
    router.push(pathname);
  };
  const name = account.displayName || t('profile.unnamed');
  return (
    <>
      <Card testID="account">
        <SectionTitle>{t('settings.account')}</SectionTitle>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <MemberAvatar name={name} emoji={account.statusEmoji} />
          <View style={{ flex: 1 }}>
            <Text variant="titleM">{name}</Text>
            {account.paypalMe ? (
              <Text variant="label" color="textSecondary">{`paypal.me/${account.paypalMe}`}</Text>
            ) : null}
          </View>
        </View>
        <Button label={t('profile.open')} variant="secondary" onPress={() => go('/profile')} testID="account-profile" />
        <Button
          label={t('personal.open')}
          variant="secondary"
          onPress={() => go('/personalize')}
          testID="account-personalize"
        />
        <Button label={t('privacy.open')} variant="tertiary" onPress={() => go('/privacy')} testID="account-privacy" />
      </Card>
      <SubscriptionCard />
      <HouseAd slot="settings_card" surface="settings" />
    </>
  );
}
