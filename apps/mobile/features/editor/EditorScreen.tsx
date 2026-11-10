import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EVENT_CATEGORIES,
  eventToDraft,
  RECURRENCE_FREQUENCIES,
  TRAVEL_MODES,
  validateDraft,
  wallParts,
  type DraftField,
  type EventDraft,
  type TravelMode,
  type Weekday,
} from '@nowish/domain';
import { formatLongDate, formatTime } from '@nowish/i18n';
import {
  Button,
  categoryColors,
  ChipGroup,
  FieldLabel,
  Gutter,
  space,
  Stepper,
  SwitchRow,
  Text,
  TextField,
  useTheme,
  radii,
} from '@nowish/ui';

import { weekdayLabels } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { DateTimeField } from './DateTimeField';
import {
  clampMinutes,
  dateToDay,
  dateToMinute,
  minuteToDate,
  newDraft,
  previewLeaveAt,
  withRepeat,
  withStart,
} from './draft-helpers';
import { confirm } from '@/services/confirm';
import { haptic } from '@/services/haptics';

const MINUTE_STEP = 5;

export function EditorScreen({ eventId, initialDay }: { eventId?: string; initialDay?: string }) {
  const { store, now, locale, t, today, buffer } = useAgendaContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const tz = store.timeZone;
  const existing = eventId ? store.getEvent(eventId) : undefined;
  const initial = useMemo<EventDraft>(() => {
    if (existing) return eventToDraft(existing, locale);
    const w = wallParts(now, tz);
    return newDraft(initialDay ?? today, today, w.hour * 60 + w.minute);
    // Initial draft is computed once when the editor opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [draft, setDraft] = useState<EventDraft>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const errors = validateDraft(draft);
  const err = (f: DraftField) => (showErrors && errors[f] ? t(`editor.error.${errors[f]}`) : undefined);
  const set = (patch: Partial<EventDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const time = (m: number) => formatTime(minuteToDate(draft.day, m % (24 * 60)), locale);
  const leaveAt = previewLeaveAt(draft, tz, buffer);

  const close = () => {
    if (!dirty) return router.back();
    confirm(t('editor.discard.title'), t('editor.discard.body'), t('editor.discard.keep'), [
      { label: t('editor.discard.confirm'), destructive: true, onPress: () => router.back() },
    ]);
  };

  const save = async () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      haptic('warning');
      return;
    }
    setSaving(true);
    setSaveFailed(false);
    try {
      if (existing) await store.update(existing.id, draft);
      else await store.create(draft);
      haptic('success');
      router.back();
    } catch (error) {
      console.warn('[editor] save failed', error instanceof Error ? error.message : 'unknown');
      setSaveFailed(true);
      setSaving(false);
    }
  };

  const minutesStepper = (label: string, value: number, onChange: (v: number) => void, id: string) => (
    <Stepper
      label={label}
      valueText={t('editor.minutesValue', { n: value })}
      onDecrease={() => {
        haptic('selection');
        onChange(clampMinutes(value - MINUTE_STEP));
      }}
      onIncrease={() => {
        haptic('selection');
        onChange(clampMinutes(value + MINUTE_STEP));
      }}
      decreaseLabel={t('editor.stepper.decrease', { label })}
      increaseLabel={t('editor.stepper.increase', { label })}
      canDecrease={value > 0}
      canIncrease={value < 600}
      testIDPrefix={id}
    />
  );

  const repeatValue = draft.recurrence?.freq ?? 'none';
  const travelValue: TravelMode | 'none' = draft.travel?.mode ?? 'none';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ gestureEnabled: !dirty }} />
      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? space[4] : insets.top + space[2],
          paddingHorizontal: space[4],
          paddingBottom: space[2],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button label={t('common.cancel')} variant="tertiary" onPress={close} testID="editor-cancel" />
        <Text variant="titleM" accessibilityRole="header">
          {existing ? t('editor.editTitle') : t('editor.newTitle')}
        </Text>
        <Button label={t('common.save')} onPress={save} loading={saving} testID="editor-save" />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + space[10], gap: space[6], paddingTop: space[3] }}
        testID="screen-editor"
      >
        <Gutter gap={4}>
          {saveFailed ? (
            <Text variant="bodyM" color="dangerText" accessibilityRole="alert" testID="editor-save-failed">
              {t('editor.saveFailed')}
            </Text>
          ) : null}
          <TextField
            label={t('editor.field.title')}
            value={draft.title}
            onChangeText={(title) => set({ title })}
            placeholder={t('editor.field.titlePlaceholder')}
            maxLength={140}
            autoFocus={!existing}
            testID="editor-title"
            error={err('title')}
          />
          <FieldLabel>{t('editor.field.category')}</FieldLabel>
          <ChipGroup
            options={EVENT_CATEGORIES.map((c) => ({ value: c, label: t(`category.${c}`), swatch: categoryColors[c] }))}
            selected={[draft.category]}
            onToggle={(category) => {
              haptic('selection');
              set({ category });
            }}
            accessibilityLabel={t('editor.field.category')}
            testIDPrefix="editor-category"
          />
        </Gutter>

        <Gutter gap={3}>
          <DateTimeField
            label={t('editor.field.date')}
            valueText={formatLongDate(minuteToDate(draft.day, 12 * 60), locale)}
            value={minuteToDate(draft.day, 12 * 60)}
            mode="date"
            onChange={(d) => set({ day: dateToDay(d) })}
            doneLabel={t('common.close')}
            testID="editor-date"
          />
          <SwitchRow
            label={t('editor.field.allDay')}
            value={draft.allDay}
            onChange={(allDay) => {
              haptic('light');
              set({ allDay });
            }}
            testID="editor-allday"
          />
          {draft.allDay ? (
            <Stepper
              label={t('editor.field.days')}
              valueText={t('editor.daysValue', { n: draft.days })}
              onDecrease={() => set({ days: Math.max(1, draft.days - 1) })}
              onIncrease={() => set({ days: Math.min(31, draft.days + 1) })}
              decreaseLabel={t('editor.stepper.decrease', { label: t('editor.field.days') })}
              increaseLabel={t('editor.stepper.increase', { label: t('editor.field.days') })}
              canDecrease={draft.days > 1}
              canIncrease={draft.days < 31}
              testIDPrefix="editor-days"
            />
          ) : (
            <>
              <DateTimeField
                label={t('editor.field.start')}
                valueText={time(draft.startMinute)}
                value={minuteToDate(draft.day, draft.startMinute)}
                mode="time"
                onChange={(d) => setDraft((x) => withStart(x, dateToMinute(d)))}
                doneLabel={t('common.close')}
                testID="editor-start"
              />
              <DateTimeField
                label={t('editor.field.end')}
                valueText={time(draft.endMinute)}
                value={minuteToDate(draft.day, draft.endMinute % (24 * 60))}
                mode="time"
                onChange={(d) => set({ endMinute: dateToMinute(d) === 0 ? 24 * 60 : dateToMinute(d) })}
                doneLabel={t('common.close')}
                testID="editor-end"
              />
              {err('time') ? (
                <Text variant="label" color="dangerText" accessibilityRole="alert">
                  {err('time')}
                </Text>
              ) : null}
            </>
          )}
        </Gutter>

        <Gutter gap={3}>
          <FieldLabel error={err('recurrence')}>{t('editor.field.repeat')}</FieldLabel>
          <ChipGroup
            options={(['none', ...RECURRENCE_FREQUENCIES] as const).map((f) => ({ value: f, label: t(`repeat.${f}`) }))}
            selected={[repeatValue]}
            onToggle={(f) => {
              haptic('selection');
              setDraft((d) => withRepeat(d, f));
            }}
            accessibilityLabel={t('editor.field.repeat')}
            testIDPrefix="editor-repeat"
          />
          {draft.recurrence?.freq === 'weekly' ? (
            <>
              <FieldLabel>{t('editor.field.weekdays')}</FieldLabel>
              <ChipGroup
                multiple
                options={weekdayLabels(locale, tz).map((label, i) => ({ value: String(i), label }))}
                selected={(draft.recurrence.byWeekday ?? []).map(String)}
                onToggle={(v) => {
                  haptic('selection');
                  setDraft((d) => {
                    if (!d.recurrence) return d;
                    const day = Number(v) as Weekday; // chip values are "0"…"6"
                    const current = d.recurrence.byWeekday ?? [];
                    const next = current.includes(day) ? current.filter((x) => x !== day) : [...current, day].sort();
                    return { ...d, recurrence: { ...d.recurrence, byWeekday: next } };
                  });
                }}
                accessibilityLabel={t('editor.field.weekdays')}
                testIDPrefix="editor-weekday"
              />
            </>
          ) : null}
        </Gutter>

        <Gutter gap={4}>
          <TextField
            label={t('editor.field.location')}
            value={draft.location}
            onChangeText={(location) => set({ location })}
            placeholder={t('editor.field.locationPlaceholder')}
            maxLength={200}
            testID="editor-location"
            error={err('location')}
          />
        </Gutter>

        <Gutter gap={4}>
          <Text variant="titleM" accessibilityRole="header">
            {t('editor.section.leave')}
          </Text>
          <View
            testID="editor-preview"
            accessibilityLiveRegion="polite"
            style={{
              backgroundColor: leaveAt ? colors.accentFill : colors.surface,
              borderRadius: radii.lg,
              padding: space[4],
            }}
          >
            <Text variant={leaveAt ? 'titleM' : 'bodyM'} color={leaveAt ? 'onAccentFill' : 'textSecondary'}>
              {leaveAt ? t('editor.preview', { time: formatTime(leaveAt, locale, tz) }) : t('editor.previewNone')}
            </Text>
          </View>
          <FieldLabel>{t('editor.field.travelMode')}</FieldLabel>
          <ChipGroup
            options={(['none', ...TRAVEL_MODES] as const).map((m) => ({
              value: m,
              label: m === 'none' ? t('editor.travel.none') : t(`leave.mode.${m}`),
            }))}
            selected={[travelValue]}
            onToggle={(m) => {
              haptic('selection');
              setDraft((d) => {
                const { travel: _t, ...rest } = d;
                return m === 'none' ? rest : { ...rest, travel: { mode: m, minutes: d.travel?.minutes ?? 15 } };
              });
            }}
            accessibilityLabel={t('editor.field.travelMode')}
            testIDPrefix="editor-travel"
          />
          {draft.travel
            ? minutesStepper(
                t('editor.field.travelMinutes'),
                draft.travel.minutes,
                (minutes) => setDraft((d) => (d.travel ? { ...d, travel: { ...d.travel, minutes } } : d)),
                'editor-travel-min',
              )
            : null}
          {minutesStepper(
            t('editor.field.prep'),
            draft.prepMinutes,
            (prepMinutes) => set({ prepMinutes }),
            'editor-prep',
          )}
          {minutesStepper(
            t('editor.field.arrival'),
            draft.arrivalMarginMinutes,
            (arrivalMarginMinutes) => set({ arrivalMarginMinutes }),
            'editor-arrival',
          )}
          {draft.travel ? (
            <Text variant="label" color="textSecondary">
              {t('leave.manualHint')}
            </Text>
          ) : null}
        </Gutter>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
