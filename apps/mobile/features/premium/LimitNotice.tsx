import { useRouter } from 'expo-router';

import type { HintTrigger } from '@nowish/entitlements';
import { Button, Card, Text } from '@nowish/ui';

import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

/**
 * A limit explained where it applies (monetization.md §3): always shown, never a pop-up, with a way to the
 * plans. Existing content is never taken away – only adding more is limited.
 */
export function LimitNotice({ text, reason, testID }: { text: string; reason: HintTrigger; testID?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Card {...(testID ? { testID } : {})}>
      <Text variant="bodyM">{text}</Text>
      <Button
        label={t('limit.see')}
        variant="secondary"
        onPress={() => {
          haptic('light');
          router.push({ pathname: '/paywall', params: { reason } });
        }}
        {...(testID ? { testID: `${testID}-plans` } : {})}
      />
    </Card>
  );
}
