import { useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';

import { parseQuickEntry, wallParts, type DayKey } from '@nowish/domain';
import { formatLongDate, formatTime } from '@nowish/i18n';
import { BottomSheet, Button, PressableScale, radii, SoftCard, space, Text, TextField, useTheme } from '@nowish/ui';

import { haptic } from '@/services/haptics';

import { instantAt } from './time';
import { newDraft, withStart } from '../editor/draft-helpers';
import { useAgendaContext } from '../agenda/use-agenda';

const EXAMPLES = ['quick.example.1', 'quick.example.2', 'quick.example.3'] as const;

export function QuickAddSheet({
  visible,
  day,
  onClose,
  onDetails,
}: {
  visible: boolean;
  day?: DayKey;
  onClose: () => void;
  onDetails: (params: Record<string, string>) => void;
}) {
  const { store, now, locale, t, today } = useAgendaContext();
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const tz = store.timeZone;

  const parsed = parseQuickEntry(text, today);
  const targetDay = parsed.day ?? day ?? today;
  const wall = wallParts(now, tz);
  const base = newDraft(targetDay, today, wall.hour * 60 + wall.minute);
  const draft = {
    ...(parsed.startMinute !== undefined ? withStart(base, parsed.startMinute) : base),
    title: parsed.title.slice(0, 120),
    location: (parsed.location ?? '').slice(0, 200),
  };
  const timeText = (minute: number) => formatTime(instantAt(targetDay, minute, tz), locale, tz);

  const reset = () => {
    setText('');
    setError(null);
  };
  const close = () => {
    reset();
    onClose();
  };
  const save = () => {
    if (!draft.title.trim()) {
      haptic('warning');
      setError(t('quick.error.title'));
      return;
    }
    setBusy(true);
    store
      .create(draft)
      .then(() => {
        haptic('success');
        AccessibilityInfo.announceForAccessibility(t('quick.saved', { title: draft.title }));
        close();
      })
      .catch((e: unknown) => {
        console.warn('[quick-add] save failed', e instanceof Error ? e.name : 'unknown');
        setError(t('quick.error.save'));
      })
      .finally(() => setBusy(false));
  };

  const when = t('quick.whenValue', {
    date: formatLongDate(instantAt(targetDay, 12 * 60, tz), locale, tz),
    time: parsed.startMinute !== undefined || text.trim() ? timeText(draft.startMinute) : 'none',
  });
  const fields: [string, string][] = [
    [t('quick.what'), draft.title || t('quick.unknown')],
    [t('quick.when'), when],
    [t('quick.where'), draft.location || t('quick.unknown')],
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      title={t('quick.title')}
      closeLabel={t('common.close')}
      testID="quick-sheet"
    >
      <TextField
        label={t('quick.label')}
        value={text}
        onChangeText={(v) => {
          setText(v);
          setError(null);
        }}
        placeholder={t('quick.placeholder')}
        maxLength={200}
        autoFocus
        testID="quick-input"
        {...(error ? { error } : {})}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }} accessibilityLabel={t('quick.examples')}>
        {EXAMPLES.map((key, i) => (
          <PressableScale
            key={key}
            onPress={() => {
              setText(t(key));
              setError(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={t(key)}
            testID={`quick-example-${i + 1}`}
            style={{
              minHeight: space[10],
              paddingHorizontal: space[3],
              justifyContent: 'center',
              borderRadius: radii.pill,
              borderWidth: 1.5,
              borderColor: colors.border,
              backgroundColor: colors.elevated,
            }}
          >
            <Text variant="label">{t(key)}</Text>
          </PressableScale>
        ))}
      </View>
      <SoftCard testID="quick-preview">
        <View style={{ flexDirection: 'row', gap: space[3] }}>
          {fields.map(([label, value]) => (
            <View key={label} style={{ flex: 1, gap: space[0.5] }} accessible accessibilityLabel={`${label}: ${value}`}>
              <Text variant="label" color="textSecondary">
                {label}
              </Text>
              <Text variant="bodyStrong">{value}</Text>
            </View>
          ))}
        </View>
      </SoftCard>
      {parsed.startMinute === undefined && text.trim() ? (
        <Text variant="label" color="textSecondary">
          {t('quick.defaultHint', { time: timeText(draft.startMinute) })}
        </Text>
      ) : null}
      <Button label={t('quick.save')} size="lg" onPress={save} loading={busy} testID="quick-save" />
      <Button
        label={t('quick.details')}
        variant="secondary"
        onPress={() => {
          const params: Record<string, string> = { day: targetDay, start: String(draft.startMinute) };
          if (draft.title) params.title = draft.title;
          if (draft.location) params.place = draft.location;
          reset();
          onDetails(params);
        }}
        testID="quick-details"
      />
      <Text variant="label" color="textSecondary" align="center">
        {t('quick.noAi')}
      </Text>
    </BottomSheet>
  );
}
