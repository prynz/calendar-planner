import { brand } from '@nowish/brand';
import type { LanguagePreference } from '@nowish/i18n';
import { Card, Gutter, Screen, ScreenHeader, SectionTitle, SegmentedControl, Text } from '@nowish/ui';

import type { ClientConfigResult } from '@/config/client-config';
import { useI18n } from '@/providers/i18n';
import { useSettings, type ThemePreference } from '@/providers/settings';
import { haptic } from '@/services/haptics';

export function SettingsScreen({ clientConfig, appVersion }: { clientConfig: ClientConfigResult; appVersion: string }) {
  const { t } = useI18n();
  const { settings, setLanguage, setTheme, saveFailed, state } = useSettings();

  const languageOptions = [
    { value: 'system', label: t('settings.language.system') },
    { value: 'de', label: t('settings.language.de') },
    { value: 'en', label: t('settings.language.en') },
  ] as const satisfies readonly { value: LanguagePreference; label: string }[];
  const themeOptions = [
    { value: 'system', label: t('settings.theme.system') },
    { value: 'dark', label: t('settings.theme.dark') },
    { value: 'light', label: t('settings.theme.light') },
  ] as const satisfies readonly { value: ThemePreference; label: string }[];

  const backendText = !clientConfig.ok
    ? t('settings.backend.invalid', { reason: clientConfig.reason })
    : clientConfig.config.backend === 'demo'
      ? t('settings.backend.demo')
      : t('settings.backend.configured', { host: clientConfig.config.host });
  const variant = clientConfig.ok ? clientConfig.config.variant : 'unknown';

  return (
    <Screen testID="screen-settings">
      <ScreenHeader title={t('settings.title')} />
      <Gutter gap={4}>
        <SectionTitle>{t('settings.language')}</SectionTitle>
        <SegmentedControl
          options={languageOptions}
          value={settings.language}
          onChange={(v) => {
            haptic('selection');
            setLanguage(v);
          }}
          accessibilityLabel={t('settings.language')}
          testIDPrefix="language"
        />
        <SectionTitle>{t('settings.theme')}</SectionTitle>
        <SegmentedControl
          options={themeOptions}
          value={settings.theme}
          onChange={(v) => {
            haptic('selection');
            setTheme(v);
          }}
          accessibilityLabel={t('settings.theme')}
          testIDPrefix="theme"
        />
        {saveFailed || state === 'load-failed' ? (
          <Text variant="bodyM" color="dangerText" accessibilityRole="alert" testID="settings-save-error">
            {t('settings.saveError')}
          </Text>
        ) : null}
      </Gutter>
      <Gutter gap={4}>
        <Card testID="backend-status">
          <SectionTitle>{t('settings.backend')}</SectionTitle>
          <Text variant="bodyM" color={clientConfig.ok ? 'textPrimary' : 'dangerText'}>
            {backendText}
          </Text>
        </Card>
        <Card>
          <SectionTitle>{t('settings.about')}</SectionTitle>
          <Text variant="bodyM">{t('settings.about.body', { name: brand.name })}</Text>
          <Text variant="label" color="textSecondary">
            {t('settings.version', { version: appVersion, variant })}
          </Text>
        </Card>
      </Gutter>
    </Screen>
  );
}
