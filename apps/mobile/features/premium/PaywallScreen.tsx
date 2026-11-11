import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  HINT_TRIGGERS,
  LIMITS,
  PAID_TIERS,
  PRICES,
  TIERS,
  type BillingPeriod,
  type HintTrigger,
  type Limit,
  type PaidTier,
  type Tier,
  type TierLimits,
} from '@nowish/entitlements';
import { formatMoney } from '@nowish/i18n';
import { Badge, Button, Card, SegmentedControl, space, Text, useTheme } from '@nowish/ui';

import { DetailShell } from '../shell/DetailShell';
import { useAccount } from '@/providers/account';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

const isTrigger = (s: unknown): s is HintTrigger =>
  typeof s === 'string' && (HINT_TRIGGERS as readonly string[]).includes(s);
const isPaid = (s: unknown): s is PaidTier => typeof s === 'string' && (PAID_TIERS as readonly string[]).includes(s);

/**
 * Plans with a Demo purchase (monetization.md §1/§3, ADR 0015): full comparison, prices incl. VAT, renewal and
 * cancellation explained, no countdown, nothing pre-selected but the period. Nothing is charged.
 */
export function PaywallScreen() {
  const { t, locale } = useI18n();
  const { tier: current, purchase, noteHint } = useAccount();
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string; tier?: string }>();
  const reason = isTrigger(params.reason) ? params.reason : null;
  const [period, setPeriod] = useState<BillingPeriod>('yearly');
  const [done, setDone] = useState<PaidTier | null>(null);
  const [failed, setFailed] = useState(false);
  const tierName = (x: Tier) => t(`sub.tier.${x}`);
  // Remember that this reason was explained, so proactive hints respect the caps (monetization.md §3).
  useEffect(() => {
    if (reason) noteHint(reason);
    // Once per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = (x: PaidTier) => {
    setFailed(false);
    purchase(x, period)
      .then(() => {
        haptic('success');
        setDone(x);
      })
      .catch((e: unknown) => {
        console.warn('[paywall] demo purchase not saved', e instanceof Error ? e.message : 'unknown');
        setFailed(true);
      });
  };

  return (
    <DetailShell
      title={t('paywall.title')}
      demo
      error={failed ? t('collab.error.save') : null}
      missing={null}
      testID="screen-paywall"
      backTestID="paywall-close"
    >
      <Card>
        <Text variant="bodyM" testID="paywall-demo">
          {t('paywall.demo')}
        </Text>
      </Card>
      {reason ? (
        <Text variant="titleM" testID="paywall-reason">
          {t(`paywall.reason.${reason}`)}
        </Text>
      ) : null}
      {done ? (
        <Card testID="paywall-done">
          <Text variant="titleM">{t('paywall.done', { tier: tierName(done) })}</Text>
          <Button label={t('paywall.close')} onPress={() => router.back()} testID="paywall-done-close" />
        </Card>
      ) : null}

      <SegmentedControl<BillingPeriod>
        options={[
          { value: 'monthly', label: t('paywall.monthly') },
          { value: 'yearly', label: t('paywall.yearly') },
        ]}
        value={period}
        onChange={(p) => {
          haptic('selection');
          setPeriod(p);
        }}
        accessibilityLabel={t('paywall.title')}
        testIDPrefix="paywall-period"
      />

      {PAID_TIERS.map((x) => {
        const price = PRICES[x][period];
        const saving = Math.round((1 - PRICES[x].yearly / (PRICES[x].monthly * 12)) * 100);
        const mine = current === x;
        const highlighted = isPaid(params.tier) && params.tier === x;
        return (
          <PlanCard key={x} highlighted={highlighted} testID={`plan-${x}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="titleL">{tierName(x)}</Text>
              {mine ? <Badge label={t('paywall.yours')} tone="neutral" /> : null}
            </View>
            <Text variant="titleM" testID={`plan-${x}-price`}>
              {t(period === 'monthly' ? 'paywall.perMonth' : 'paywall.perYear', {
                price: formatMoney(price, 'EUR', locale),
              })}
            </Text>
            {period === 'yearly' ? (
              <Text variant="label" color="textSecondary">
                {t('paywall.saving', { percent: saving })}
              </Text>
            ) : null}
            <Text variant="bodyM" color="textSecondary">
              {t('paywall.trial')}
            </Text>
            {mine ? null : (
              <Button
                label={t('paywall.choose', { tier: tierName(x) })}
                variant={highlighted ? 'primary' : 'secondary'}
                onPress={() => buy(x)}
                testID={`plan-${x}-choose`}
              />
            )}
          </PlanCard>
        );
      })}

      <Compare tierName={tierName} />
      <Text variant="label" color="textSecondary">
        {t('paywall.free')}
      </Text>
      <Text variant="label" color="textSecondary" testID="paywall-legal">
        {t('paywall.legal')}
      </Text>
      <Text variant="label" color="textSecondary">
        {t('sub.storeHint')}
      </Text>
    </DetailShell>
  );
}

function PlanCard({
  highlighted,
  testID,
  children,
}: {
  highlighted: boolean;
  testID: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{ borderRadius: space[6], borderWidth: highlighted ? 3 : 0, borderColor: colors.accentFill }}
      testID={testID}
    >
      <Card>{children}</Card>
    </View>
  );
}

/** Full comparison table – the same data the app enforces (`@nowish/entitlements`). */
function Compare({ tierName }: { tierName: (t: Tier) => string }) {
  const { t } = useI18n();
  // The narrow table shows ∞; screen readers hear the word (row label below).
  const lim = (l: Limit) => (l === null ? '∞' : String(l));
  const spoken = (v: string) => (v === '∞' ? t('paywall.unlimited') : v);
  const yes = (b: boolean) => (b ? t('paywall.yes') : t('paywall.no'));
  const rows: { key: string; value: (l: TierLimits) => string }[] = [
    { key: 'hosted', value: (l) => lim(l.activeHostedEvents) },
    { key: 'participants', value: (l) => lim(l.participantsPerEvent) },
    { key: 'groups', value: (l) => lim(l.groups) },
    { key: 'reminders', value: (l) => t(`paywall.reminders.${l.reminderStages}`) },
    { key: 'buffer', value: (l) => yes(l.bufferLearning) },
    { key: 'ready', value: (l) => yes(l.readyCheck) },
    { key: 'costs', value: (l) => yes(l.costSplit === 'full') },
    { key: 'covers', value: (l) => yes(l.covers === 'premium') },
    { key: 'family', value: (l) => String(l.familyAdults) },
    { key: 'ads', value: (l) => yes(!l.houseAds) },
    { key: 'focus', value: () => t('paywall.yes') },
  ];
  return (
    <Card testID="paywall-compare">
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 2 }} />
        {TIERS.map((x) => (
          <View key={x} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="label">{tierName(x)}</Text>
          </View>
        ))}
      </View>
      {rows.map((r) => (
        <View
          key={r.key}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: space[1] }}
          accessible
          accessibilityLabel={`${t(`paywall.row.${r.key}` as 'paywall.row.hosted')}: ${TIERS.map(
            (x) => `${tierName(x)} ${spoken(r.value(LIMITS[x]))}`,
          ).join(', ')}`}
        >
          <View style={{ flex: 2 }}>
            <Text variant="label" color="textSecondary">
              {/* Row keys are the fixed list above; each has a de/en text (i18n parity test). */}
              {t(`paywall.row.${r.key}` as 'paywall.row.hosted')}
            </Text>
          </View>
          {TIERS.map((x) => (
            <View key={x} style={{ flex: 1, alignItems: 'center' }}>
              <Text variant="label">{r.value(LIMITS[x])}</Text>
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
}
