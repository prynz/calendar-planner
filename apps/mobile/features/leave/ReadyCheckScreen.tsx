import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { agendaForDay } from '@nowish/demo';
import {
  displayTitle,
  journeyId,
  localized,
  newJourney,
  readyItems,
  readyProgress,
  toggleChecked,
  type ReadyItem,
} from '@nowish/domain';
import { formatTime, type MessageKey } from '@nowish/i18n';
import {
  Button,
  EmptyState,
  IconButton,
  PressableScale,
  ProgressBar,
  radii,
  SegmentedControl,
  space,
  Text,
  touch,
  useTheme,
} from '@nowish/ui';

import { leavePlanFor, VIEWER_ID } from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';
import { LimitNotice } from '../premium/LimitNotice';
import { useAccount } from '@/providers/account';
import { haptic } from '@/services/haptics';

type Mode = 'list' | 'steps';

/** Ready check (anti-chaos-engine.md §3) as a list or – focus friendly – one item per screen. */
export function ReadyCheckScreen({ eventId, occurrence }: { eventId: string; occurrence: string | undefined }) {
  const { store, t, locale, buffer, today } = useAgendaContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('list');
  const { limits } = useAccount();
  const [failed, setFailed] = useState(false);
  const event = store.getEvent(eventId);
  const day = occurrence ?? today;
  const item = event ? (agendaForDay([event], day, event.timeZone)[0] ?? null) : null;
  const plan = event && item ? leavePlanFor(event, item.start, buffer) : null;

  const close = (
    <IconButton
      icon={(c) => <X color={c} size={22} />}
      onPress={() => router.back()}
      accessibilityLabel={t('common.close')}
      testID="ready-close"
    />
  );

  if (!limits.readyCheck) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: insets.top + space[4], gap: space[4] }}>
        <View style={{ alignItems: 'flex-end', paddingHorizontal: space[4] }}>{close}</View>
        <View style={{ paddingHorizontal: space[5] }}>
          <LimitNotice text={t('limit.ready')} reason="ready-check" testID="limit-ready" />
        </View>
      </View>
    );
  }

  if (!event || !item || !plan) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: insets.top + space[4], gap: space[4] }}>
        <View style={{ alignItems: 'flex-end', paddingHorizontal: space[4] }}>{close}</View>
        <StoreGate>
          <EmptyState
            title={t('ready.title')}
            body={event && item ? t('ready.noPlan') : t('collab.notFound.body')}
            testID="ready-unavailable"
          />
        </StoreGate>
      </View>
    );
  }

  const journey =
    store.getJourney(journeyId(event.id, item.occurrenceKey)) ?? newJourney(event.id, item.occurrenceKey, plan.leaveAt);
  const items = readyItems(event.category, store.getCollab(event.id), VIEWER_ID);
  const progress = readyProgress(items, journey.checked);
  const label = (i: ReadyItem) =>
    i.source === 'bring'
      ? `${localized(i.title, i.titleI18n, locale)} ×${i.quantity}`
      : // Keys are fixed in packages/domain and checked against de/en in __tests__/leave.test.tsx.
        t(`ready.item.${i.key}` as MessageKey);
  const toggle = (id: string) => {
    setFailed(false);
    const next = toggleChecked(journey, id);
    const nowComplete = readyProgress(items, next.checked).complete;
    haptic(nowComplete ? 'success' : 'selection');
    store.saveJourney(next).catch((error: unknown) => {
      console.warn('[ready] save failed', error instanceof Error ? error.message : 'unknown');
      setFailed(true);
    });
  };
  const open = items.filter((i) => !journey.checked.includes(i.id));
  const current = open[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        testID="screen-ready"
        contentContainerStyle={{
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + space[8],
          paddingHorizontal: space[5],
          gap: space[4],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <View style={{ flex: 1, gap: space[1] }}>
            <Text variant="label" color="textSecondary">
              {t('ready.eyebrow', {
                title: displayTitle(event, locale),
                time: formatTime(plan.leaveAt, locale, event.timeZone),
              })}
            </Text>
            <Text variant="titleL" accessibilityRole="header">
              {t('ready.title')}
            </Text>
          </View>
          {close}
        </View>
        <SegmentedControl<Mode>
          options={[
            { value: 'list', label: t('ready.mode.list') },
            { value: 'steps', label: t('ready.mode.steps') },
          ]}
          value={mode}
          onChange={setMode}
          accessibilityLabel={t('ready.title')}
          testIDPrefix="ready-mode"
        />
        <Text variant="titleM" testID="ready-progress" accessibilityLiveRegion="polite">
          {progress.complete ? t('ready.allSet') : t('leave.readyProgress', progress)}
        </Text>
        <ProgressBar value={progress.total ? progress.done / progress.total : 0} />
        {failed ? (
          <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
            {t('collab.error.save')}
          </Text>
        ) : null}

        {mode === 'list' ? (
          items.map((i) => {
            const done = journey.checked.includes(i.id);
            return (
              <PressableScale
                key={i.id}
                onPress={() => toggle(i.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityLabel={label(i)}
                testID={`ready-${i.id}`}
                pressedScale={0.98}
                style={{
                  minHeight: touch.cta,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space[3],
                  paddingHorizontal: space[4],
                  borderRadius: radii.md,
                  backgroundColor: colors.surface,
                }}
              >
                <View
                  style={{
                    width: space[8],
                    height: space[8],
                    borderRadius: radii.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done ? colors.accentFill : colors.elevated,
                  }}
                >
                  {done ? <Check color={colors.onAccentFill} size={18} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyL" color={done ? 'textSecondary' : 'textPrimary'}>
                    {label(i)}
                  </Text>
                  {i.source === 'bring' ? (
                    <Text variant="label" color="textSecondary">
                      {t('ready.fromBringList')}
                    </Text>
                  ) : null}
                </View>
              </PressableScale>
            );
          })
        ) : current ? (
          <View style={{ gap: space[4], alignItems: 'stretch' }} testID="ready-step">
            <Text variant="label" color="textSecondary" align="center">
              {t('ready.step', { n: progress.done + 1, total: progress.total })}
            </Text>
            <View
              style={{
                minHeight: 200,
                borderRadius: radii.xl,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                padding: space[6],
              }}
            >
              <Text variant="displayL" align="center">
                {label(current)}
              </Text>
            </View>
            <Button label={t('ready.got')} size="lg" onPress={() => toggle(current.id)} testID="ready-got" />
          </View>
        ) : (
          <EmptyState title={t('ready.allSet')} body={t('leave.readyProgress', progress)} testID="ready-done" />
        )}
      </ScrollView>
    </View>
  );
}
