import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand } from '@nowish/brand';
import { Badge, Button, CheckRow, ProgressBar, radii, space, Text, TextField, useTheme } from '@nowish/ui';

import { useAccount } from '@/providers/account';
import { useI18n } from '@/providers/i18n';
import { useReminders } from '@/providers/reminders';
import { haptic } from '@/services/haptics';

import { AnimatedMark } from './AnimatedMark';

const STEPS = 4;

/**
 * First start (profile-settings.md ACC-08, ADR 0004/0015): welcome, name + age confirmation (never a birth
 * date), how the app helps incl. the Demo note, and the 14-day Plus trial (Demo). No ads, no paywall here.
 */
export function OnboardingScreen() {
  const { t } = useI18n();
  const { completeOnboarding } = useAccount();
  const reminders = useReminders();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState(false);
  const [ageError, setAgeError] = useState(false);
  const [failed, setFailed] = useState(false);

  const next = () => {
    if (step === 1 && !age) {
      haptic('warning');
      setAgeError(true);
      return;
    }
    haptic('light');
    setStep((s) => Math.min(STEPS - 1, s + 1));
  };
  const finish = () => {
    setFailed(false);
    completeOnboarding({ displayName: name })
      .then(() => {
        haptic('success');
        router.replace('/');
      })
      .catch((e: unknown) => {
        console.warn('[onboarding] save failed', e instanceof Error ? e.message : 'unknown');
        setFailed(true);
      });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.canvas }} behavior="padding">
      <ScrollView
        testID="screen-onboarding"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + space[6],
          paddingBottom: insets.bottom + space[6],
          paddingHorizontal: space[5],
          gap: space[5],
        }}
      >
        <View style={{ gap: space[2] }}>
          <Text variant="label" color="textSecondary">
            {t('onb.step', { n: step + 1, total: STEPS })}
          </Text>
          <ProgressBar value={(step + 1) / STEPS} />
        </View>

        <View style={{ flex: 1, gap: space[5] }}>
          {step === 0 ? (
            <>
              <AnimatedMark />
              <Text variant="label" color="textSecondary">
                {t('onb.welcome.eyebrow')}
              </Text>
              <View style={{ gap: space[2] }} accessible accessibilityRole="header">
                <Text variant="displayXl">{t('onb.welcome.before')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2] }}>
                  {/* R3 "framed keyword" – onboarding only (design-system.md). */}
                  <View
                    style={{
                      borderWidth: 3,
                      borderColor: colors.accentFill,
                      borderRadius: radii.pill,
                      paddingHorizontal: space[4],
                    }}
                  >
                    <Text variant="displayXl" color="accentText">
                      {t('onb.welcome.keyword')}
                    </Text>
                  </View>
                  <Text variant="displayXl">{t('onb.welcome.after')}</Text>
                </View>
              </View>
              <Text variant="bodyL" color="textSecondary">
                {t('onb.welcome.body')}
              </Text>
              <Text variant="label" color="textSecondary">
                {brand.name}
              </Text>
            </>
          ) : step === 1 ? (
            <>
              <Text variant="displayL" accessibilityRole="header">
                {t('onb.you.title')}
              </Text>
              <TextField
                label={t('onb.you.name')}
                value={name}
                onChangeText={setName}
                placeholder={t('onb.you.namePlaceholder')}
                maxLength={40}
                testID="onb-name"
              />
              <CheckRow
                label={t('onb.you.age')}
                checked={age}
                onToggle={() => {
                  haptic('selection');
                  setAge((a) => !a);
                  setAgeError(false);
                }}
                testID="onb-age"
              />
              <Text variant="bodyM" color={ageError ? 'dangerText' : 'textSecondary'} accessibilityLiveRegion="polite">
                {ageError ? t('onb.you.ageRequired') : t('onb.you.ageHint')}
              </Text>
            </>
          ) : step === 2 ? (
            <>
              <Text variant="displayL" accessibilityRole="header">
                {t('onb.how.title')}
              </Text>
              {(['leave', 'remind', 'together'] as const).map((k) => (
                <View key={k} style={{ flexDirection: 'row', gap: space[3] }}>
                  <Text variant="titleM" color="accentText">
                    ●
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyL">{t(`onb.how.${k}`)}</Text>
                  </View>
                </View>
              ))}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <Badge label={t('demo.badge')} tone="demo" />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyM" color="textSecondary">
                    {t('onb.how.demo')}
                  </Text>
                </View>
              </View>
              {reminders.permission === 'granted' ? null : (
                <>
                  <Button
                    label={t('onb.how.notify')}
                    variant="secondary"
                    onPress={() => void reminders.request()}
                    loading={reminders.permission === 'checking'}
                    testID="onb-notify"
                  />
                  <Text variant="label" color="textSecondary">
                    {t('onb.how.notifyLater')}
                  </Text>
                </>
              )}
            </>
          ) : (
            <>
              <Text variant="displayL" accessibilityRole="header">
                {t('onb.trial.title')}
              </Text>
              <Text variant="bodyL">{t('onb.trial.body')}</Text>
              <Text variant="bodyM" color="textSecondary">
                {t('onb.trial.free')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <Badge label={t('demo.badge')} tone="demo" />
                <Text variant="label" color="textSecondary">
                  {t('onb.trial.demo')}
                </Text>
              </View>
            </>
          )}
        </View>

        {failed ? (
          <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
            {t('collab.error.save')}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', gap: space[3] }}>
          {step > 0 ? (
            <View style={{ flex: 1 }}>
              <Button
                label={t('onb.back')}
                variant="tertiary"
                onPress={() => setStep((s) => s - 1)}
                testID="onb-back"
              />
            </View>
          ) : null}
          <View style={{ flex: 2 }}>
            {step === STEPS - 1 ? (
              <Button label={t('onb.finish')} size="lg" onPress={finish} testID="onb-finish" />
            ) : (
              <Button
                label={step === 0 ? t('onb.welcome.start') : t('onb.next')}
                size="lg"
                onPress={next}
                testID="onb-next"
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
