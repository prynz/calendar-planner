import { ArrowDown, ArrowUp } from 'lucide-react-native';
import { Switch, View } from 'react-native';

import {
  ACCENT_NAMES,
  ACCENTS,
  IconButton,
  PressableScale,
  radii,
  SegmentedControl,
  SoftCard,
  space,
  Text,
  useTheme,
  type AccentName,
} from '@nowish/ui';

import { useI18n } from '@/providers/i18n';
import { START_TABS, useSettings, type Density, type HomeBlock, type StartTab } from '@/providers/settings';
import { haptic } from '@/services/haptics';

import { DetailShell } from '../shell/DetailShell';

/** Personalise (Phase 8, ADR 0016): accent colour, layout density, the order of Today, the start view. */
export function PersonalizeScreen() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { settings, set, saveFailed } = useSettings();

  const move = (i: number, delta: -1 | 1) => {
    const order = [...settings.homeOrder];
    const j = i + delta;
    const a = order[i];
    const b = order[j];
    if (a === undefined || b === undefined) return;
    order[i] = b;
    order[j] = a;
    haptic('selection');
    set('homeOrder', order);
  };
  const toggle = (block: HomeBlock, on: boolean) => {
    haptic('light');
    set('homeHidden', on ? settings.homeHidden.filter((b) => b !== block) : [...settings.homeHidden, block]);
  };

  return (
    <DetailShell
      title={t('personal.title')}
      demo={false}
      error={saveFailed ? t('settings.saveError') : null}
      missing={null}
      testID="screen-personalize"
      backTestID="personalize-back"
    >
      <Text variant="bodyM" color="textSecondary">
        {t('personal.intro')}
      </Text>

      <SoftCard testID="personal-accent">
        <Text variant="bodyStrong" accessibilityRole="header">
          {t('personal.accent')}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} accessibilityRole="radiogroup">
          {ACCENT_NAMES.map((accent: AccentName) => {
            const selected = settings.accent === accent;
            return (
              <PressableScale
                key={accent}
                onPress={() => {
                  haptic('selection');
                  set('accent', accent);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected, checked: selected }}
                accessibilityLabel={t(`personal.accent.${accent}`)}
                testID={`accent-${accent}`}
                style={{ alignItems: 'center', gap: space[1], minWidth: space[16] }}
              >
                <View
                  style={{
                    width: space[12] + space[1],
                    height: space[12] + space[1],
                    borderRadius: radii.pill,
                    borderWidth: 2.5,
                    borderColor: selected ? colors.textPrimary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: space[10],
                      height: space[10],
                      borderRadius: radii.pill,
                      backgroundColor: ACCENTS[accent].fill,
                    }}
                  />
                </View>
                <Text variant="label">{t(`personal.accent.${accent}`)}</Text>
              </PressableScale>
            );
          })}
        </View>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            backgroundColor: colors.accentFill,
            borderRadius: radii.md,
            padding: space[3],
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text variant="titleM" color="onAccentFill">
            {t('quick.save')}
          </Text>
          <Text variant="label" color="onAccentFill">
            {t('personal.preview')}
          </Text>
        </View>
        <Text variant="label" color="accentText">
          {t('personal.accent.hint')}
        </Text>
      </SoftCard>

      <SoftCard testID="personal-density">
        <Text variant="bodyStrong" accessibilityRole="header">
          {t('personal.density')}
        </Text>
        <SegmentedControl
          options={(['airy', 'compact'] as const).map((d: Density) => ({
            value: d,
            label: t(`personal.density.${d}`),
          }))}
          value={settings.density}
          onChange={(d) => {
            haptic('selection');
            set('density', d);
          }}
          accessibilityLabel={t('personal.density')}
          testIDPrefix="density"
        />
        <Text variant="label" color="textSecondary">
          {t(`personal.density.hint.${settings.density}`)}
        </Text>
      </SoftCard>

      <SoftCard testID="personal-home">
        <Text variant="bodyStrong" accessibilityRole="header">
          {t('personal.home')}
        </Text>
        <Text variant="label" color="textSecondary">
          {t('personal.home.hint')}
        </Text>
        {settings.homeOrder.map((block, i) => {
          const label = t(`personal.block.${block}`);
          const shown = !settings.homeHidden.includes(block);
          return (
            <View
              key={block}
              testID={`home-row-${block}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: space[16] - space[2] }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" color={shown ? 'textPrimary' : 'textSecondary'}>
                  {label}
                </Text>
              </View>
              <IconButton
                icon={(c) => <ArrowUp color={c} size={18} />}
                onPress={() => move(i, -1)}
                disabled={i === 0}
                accessibilityLabel={t('personal.home.up', { block: label })}
                testID={`home-up-${block}`}
              />
              <IconButton
                icon={(c) => <ArrowDown color={c} size={18} />}
                onPress={() => move(i, 1)}
                disabled={i === settings.homeOrder.length - 1}
                accessibilityLabel={t('personal.home.down', { block: label })}
                testID={`home-down-${block}`}
              />
              <Switch
                value={shown}
                onValueChange={(v) => toggle(block, v)}
                accessibilityLabel={t('personal.home.show', { block: label })}
                testID={`home-show-${block}`}
                trackColor={{ false: colors.border, true: colors.accentFill }}
                thumbColor={colors.elevated}
                ios_backgroundColor={colors.border}
              />
            </View>
          );
        })}
      </SoftCard>

      <SoftCard testID="personal-start">
        <Text variant="bodyStrong" accessibilityRole="header">
          {t('personal.start')}
        </Text>
        <SegmentedControl
          options={START_TABS.map((s: StartTab) => ({ value: s, label: t(`personal.start.${s}`) }))}
          value={settings.startTab}
          onChange={(s) => {
            haptic('selection');
            set('startTab', s);
          }}
          accessibilityLabel={t('personal.start')}
          testIDPrefix="start"
        />
        <Text variant="label" color="textSecondary">
          {t('personal.start.hint')}
        </Text>
      </SoftCard>
    </DetailShell>
  );
}
