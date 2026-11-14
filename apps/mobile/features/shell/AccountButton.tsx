import { useRouter } from 'expo-router';

import { initialsOf, PressableScale, radii, Text, touch, useTheme } from '@nowish/ui';

import { useAccount } from '@/providers/account';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

/**
 * Kompass (ADR 0017): "Me" is not a tab any more – the avatar in each tab's header opens profile and settings.
 * Keeps the old `tab-settings` test id so flows and tests find it.
 */
export function AccountButton() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();
  const { account } = useAccount();
  const name = account.displayName.trim();
  return (
    <PressableScale
      onPress={() => {
        haptic('selection');
        router.navigate('/settings');
      }}
      accessibilityRole="button"
      accessibilityLabel={t('account.open')}
      pressedScale={0.92}
      testID="tab-settings"
      style={{
        width: touch.min,
        height: touch.min,
        borderRadius: radii.pill,
        backgroundColor: colors.secondaryFill,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="label" color="onSecondaryFill" maxFontSizeMultiplier={1.3}>
        {name ? initialsOf(name) : t('account.initial')}
      </Text>
    </PressableScale>
  );
}
