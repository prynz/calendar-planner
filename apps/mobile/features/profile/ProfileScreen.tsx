import { useState } from 'react';

import { isPaypalName } from '@nowish/domain';
import { Button, ChipGroup, FieldLabel, Text, TextField } from '@nowish/ui';

import { DetailShell } from '../shell/DetailShell';
import { useAccount } from '@/providers/account';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

const EMOJIS = ['none', '😊', '🏃', '🎉', '🧘', '💼', '🎧', '🌱'] as const;

/** Profile (profile-settings.md): display name, optional status emoji and PayPal.me name. No birthday. */
export function ProfileScreen() {
  const { t } = useI18n();
  const { account, update } = useAccount();
  const [name, setName] = useState(account.displayName);
  const [emoji, setEmoji] = useState<string>(account.statusEmoji ?? 'none');
  const [paypal, setPaypal] = useState(account.paypalMe ?? '');
  const [state, setState] = useState<'idle' | 'saved' | 'failed'>('idle');
  const paypalInvalid = paypal.trim().length > 0 && !isPaypalName(paypal.trim());

  const save = () => {
    if (paypalInvalid) {
      haptic('warning');
      return;
    }
    update((a) => {
      const { statusEmoji: _e, paypalMe: _p, ...rest } = a;
      return {
        ...rest,
        displayName: name.trim().slice(0, 40),
        ...(emoji !== 'none' ? { statusEmoji: emoji } : {}),
        ...(paypal.trim() ? { paypalMe: paypal.trim() } : {}),
      };
    })
      .then(() => {
        haptic('success');
        setState('saved');
      })
      .catch((e: unknown) => {
        console.warn('[profile] save failed', e instanceof Error ? e.message : 'unknown');
        setState('failed');
      });
  };

  return (
    <DetailShell
      title={t('profile.title')}
      demo={false}
      error={state === 'failed' ? t('collab.error.save') : null}
      missing={null}
      testID="screen-profile"
      backTestID="profile-back"
    >
      <TextField
        label={t('profile.name')}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setState('idle');
        }}
        maxLength={40}
        testID="profile-name"
      />
      <FieldLabel>{t('profile.emoji')}</FieldLabel>
      <ChipGroup
        options={EMOJIS.map((e) => ({ value: e, label: e === 'none' ? t('profile.emoji.none') : e }))}
        selected={[emoji]}
        onToggle={(e) => {
          haptic('selection');
          setEmoji(e);
          setState('idle');
        }}
        accessibilityLabel={t('profile.emoji')}
        testIDPrefix="profile-emoji"
      />
      <TextField
        label={t('profile.paypal')}
        value={paypal}
        onChangeText={(v) => {
          setPaypal(v);
          setState('idle');
        }}
        maxLength={20}
        error={paypalInvalid ? t('profile.paypal.error') : undefined}
        testID="profile-paypal"
      />
      <Text variant="label" color="textSecondary">
        {t('profile.paypal.hint')}
      </Text>
      <Button label={state === 'saved' ? t('profile.saved') : t('profile.save')} onPress={save} testID="profile-save" />
      <Text variant="label" color="textSecondary">
        {t('profile.local')}
      </Text>
    </DetailShell>
  );
}
