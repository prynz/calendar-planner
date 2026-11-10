import { useState } from 'react';

import { brand } from '@nowish/brand';
import type { ReminderIntensity } from '@nowish/domain';
import type { LanguagePreference } from '@nowish/i18n';
import { Button, Card, Gutter, Screen, ScreenHeader, SectionTitle, SegmentedControl, Stepper, Text } from '@nowish/ui';

import type { ClientConfigResult } from '@/config/client-config';
import { useEvents } from '@/providers/events';
import { useI18n } from '@/providers/i18n';
import { BUFFER_RANGE, useSettings, type ThemePreference } from '@/providers/settings';
import { confirm } from '@/services/confirm';
import { haptic } from '@/services/haptics';

export function SettingsScreen({ clientConfig, appVersion }: { clientConfig: ClientConfigResult; appVersion: string }) {
  const { t } = useI18n();
  const { settings, setLanguage, setTheme, set, saveFailed, state } = useSettings();
  const events = useEvents();
  const [resetFailed, setResetFailed] = useState(false);
  const intensityOptions = [
    { value: 'gentle', label: t('settings.intensity.gentle') },
    { value: 'normal', label: t('settings.intensity.normal') },
    { value: 'firm', label: t('settings.intensity.firm') },
  ] as const satisfies readonly { value: ReminderIntensity; label: string }[];
  const resetExampleWorld = () => {
    haptic('warning');
    confirm(t('settings.exampleWorld.confirmTitle'), t('settings.exampleWorld.confirmBody'), t('common.cancel'), [
      {
        label: t('settings.exampleWorld.confirm'),
        destructive: true,
        onPress: () => {
          events
            .resetExampleWorld()
            .then(() => {
              setResetFailed(false);
              haptic('success');
            })
            .catch((error: unknown) => {
              console.warn('[settings] reset failed', error instanceof Error ? error.message : 'unknown');
              setResetFailed(true);
            });
        },
      },
    ]);
  };

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
        <SectionTitle>{t('settings.reminders')}</SectionTitle>
        <SegmentedControl
          options={intensityOptions}
          value={settings.reminderIntensity}
          onChange={(v) => {
            haptic('selection');
            set('reminderIntensity', v);
          }}
          accessibilityLabel={t('settings.reminders')}
          testIDPrefix="intensity"
        />
        <Text variant="bodyM" color="textSecondary" testID="intensity-hint">
          {t(`settings.intensity.hint.${settings.reminderIntensity}`)}
        </Text>
        <Stepper
          label={t('settings.buffer')}
          valueText={t('editor.minutesValue', { n: settings.dawdleBuffer })}
          onDecrease={() => {
            haptic('selection');
            set('dawdleBuffer', Math.max(BUFFER_RANGE.min, settings.dawdleBuffer - BUFFER_RANGE.step));
          }}
          onIncrease={() => {
            haptic('selection');
            set('dawdleBuffer', Math.min(BUFFER_RANGE.max, settings.dawdleBuffer + BUFFER_RANGE.step));
          }}
          decreaseLabel={t('editor.stepper.decrease', { label: t('settings.buffer') })}
          increaseLabel={t('editor.stepper.increase', { label: t('settings.buffer') })}
          canDecrease={settings.dawdleBuffer > BUFFER_RANGE.min}
          canIncrease={settings.dawdleBuffer < BUFFER_RANGE.max}
          testIDPrefix="buffer"
        />
        <Text variant="label" color="textSecondary">
          {t('settings.buffer.hint')}
        </Text>
      </Gutter>
      <Gutter gap={4}>
        <Card testID="example-world">
          <SectionTitle>{t('settings.exampleWorld')}</SectionTitle>
          <Text variant="bodyM" color="textSecondary">
            {t('settings.exampleWorld.hint')}
          </Text>
          {resetFailed ? (
            <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
              {t('settings.exampleWorld.failed')}
            </Text>
          ) : null}
          <Button
            label={t('settings.exampleWorld.reset')}
            variant="secondary"
            onPress={resetExampleWorld}
            testID="reset-example-world"
          />
        </Card>
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
