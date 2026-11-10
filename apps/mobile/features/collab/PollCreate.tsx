import { useState } from 'react';
import { View } from 'react-native';

import { simulatePollVotes } from '@nowish/demo';
import {
  addDays,
  COLLAB_LIMITS,
  createPoll,
  dayKeyOf,
  wallParts,
  zonedWallTimeToInstant,
  type DayKey,
  type NewPoll,
} from '@nowish/domain';
import { formatLongDate, formatTime } from '@nowish/i18n';
import { Button, Card, ChipGroup, SectionTitle, SegmentedControl, space, Text, TextField } from '@nowish/ui';

import { DateTimeField } from '../editor/DateTimeField';
import { dateToDay, dateToMinute, minuteToDate } from '../editor/draft-helpers';
import type { CollabContext } from './use-collab';

type Kind = 'time' | 'text';
type Slot = { day: DayKey; minute: number };
const DEADLINE_DAYS = ['1', '2', '3'] as const;

/** Host form for a new poll: date options (POL-01) or free choices, deadline and decision rule. */
export function PollCreate({ ctx }: { ctx: CollabContext }) {
  const { event, t, locale, run, viewerId, now } = ctx;
  const tz = event?.timeZone ?? 'UTC';
  const startDay = event ? dayKeyOf(event.start, tz) : dayKeyOf(now, tz);
  const startWall = event ? wallParts(event.start, tz) : { hour: 19, minute: 0 };
  const startMinute = startWall.hour * 60 + startWall.minute;
  const [kind, setKind] = useState<Kind>('time');
  const [question, setQuestion] = useState('');
  const [slots, setSlots] = useState<Slot[]>([
    { day: startDay, minute: startMinute },
    { day: addDays(startDay, 1), minute: startMinute },
  ]);
  const [labels, setLabels] = useState<string[]>(['', '']);
  const [deadlineDays, setDeadlineDays] = useState<(typeof DEADLINE_DAYS)[number]>('2');
  const [decision, setDecision] = useState<NewPoll['decision']>('majority');
  const count = kind === 'time' ? slots.length : labels.length;
  const durationMs = event ? event.end.getTime() - event.start.getTime() : 2 * 3_600_000;

  const submit = () => {
    const q = question.trim() || (kind === 'time' ? t('poll.create.question.time') : '');
    void run((c, at) => {
      const options: NewPoll['options'] =
        kind === 'time'
          ? slots.map((s) => {
              const start = zonedWallTimeToInstant(s.day, Math.floor(s.minute / 60), s.minute % 60, tz);
              return { type: 'time', start, end: new Date(start.getTime() + durationMs) };
            })
          : labels.map((label) => ({ type: 'text', label }));
      const deadline = new Date(at.getTime() + Number(deadlineDays) * 86_400_000);
      const next = createPoll(c, viewerId, { question: q, options, deadline, decision }, at);
      const poll = next.polls[next.polls.length - 1];
      return { collab: next, simulate: poll ? simulatePollVotes(next, poll.id, at) : [] };
    }, 'success');
  };

  return (
    <Card testID="poll-create">
      <SectionTitle>{t('poll.create.title')}</SectionTitle>
      <SegmentedControl<Kind>
        options={[
          { value: 'time', label: t('poll.create.type.time') },
          { value: 'text', label: t('poll.create.type.text') },
        ]}
        value={kind}
        onChange={setKind}
        accessibilityLabel={t('poll.create.type')}
        testIDPrefix="poll-kind"
      />
      <TextField
        label={t('poll.create.question')}
        value={question}
        onChangeText={setQuestion}
        placeholder={kind === 'time' ? t('poll.create.question.time') : ''}
        maxLength={COLLAB_LIMITS.question}
        testID="poll-question"
      />
      {kind === 'time'
        ? slots.map((s, i) => (
            <View key={i} style={{ gap: space[2] }}>
              <DateTimeField
                label={t('poll.create.optionDay', { n: i + 1 })}
                valueText={formatLongDate(minuteToDate(s.day, 12 * 60), locale)}
                value={minuteToDate(s.day, 12 * 60)}
                mode="date"
                onChange={(d) => setSlots((xs) => xs.map((x, j) => (j === i ? { ...x, day: dateToDay(d) } : x)))}
                doneLabel={t('common.close')}
                testID={`poll-slot-${i}-day`}
              />
              <DateTimeField
                label={t('poll.create.optionTime', { n: i + 1 })}
                valueText={formatTime(minuteToDate(s.day, s.minute), locale)}
                value={minuteToDate(s.day, s.minute)}
                mode="time"
                onChange={(d) => setSlots((xs) => xs.map((x, j) => (j === i ? { ...x, minute: dateToMinute(d) } : x)))}
                doneLabel={t('common.close')}
                testID={`poll-slot-${i}-time`}
              />
            </View>
          ))
        : labels.map((l, i) => (
            <TextField
              key={i}
              label={t('poll.create.option', { n: i + 1 })}
              value={l}
              onChangeText={(v) => setLabels((xs) => xs.map((x, j) => (j === i ? v : x)))}
              maxLength={COLLAB_LIMITS.title}
              testID={`poll-label-${i}`}
            />
          ))}
      <View style={{ flexDirection: 'row', gap: space[2] }}>
        <View style={{ flex: 1 }}>
          <Button
            label={t('poll.create.addOption')}
            variant="secondary"
            disabled={count >= COLLAB_LIMITS.options}
            onPress={() =>
              kind === 'time'
                ? setSlots((xs) => [
                    ...xs,
                    { day: addDays(xs[xs.length - 1]?.day ?? startDay, 1), minute: startMinute },
                  ])
                : setLabels((xs) => [...xs, ''])
            }
            testID="poll-add-option"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label={t('poll.create.removeOption')}
            variant="tertiary"
            disabled={count <= 2}
            onPress={() => (kind === 'time' ? setSlots((xs) => xs.slice(0, -1)) : setLabels((xs) => xs.slice(0, -1)))}
            testID="poll-remove-option"
          />
        </View>
      </View>
      <Text variant="label" color="textSecondary">
        {t('poll.create.deadline')}
      </Text>
      <ChipGroup
        options={DEADLINE_DAYS.map((d) => ({ value: d, label: t('poll.create.deadlineDays', { n: Number(d) }) }))}
        selected={[deadlineDays]}
        onToggle={setDeadlineDays}
        accessibilityLabel={t('poll.create.deadline')}
        testIDPrefix="poll-deadline"
      />
      <Text variant="label" color="textSecondary">
        {t('poll.create.decision')}
      </Text>
      <SegmentedControl<NewPoll['decision']>
        options={[
          { value: 'majority', label: t('poll.create.decision.majority') },
          { value: 'host', label: t('poll.create.decision.host') },
        ]}
        value={decision}
        onChange={setDecision}
        accessibilityLabel={t('poll.create.decision')}
        testIDPrefix="poll-decision"
      />
      <Button
        label={t('poll.create.submit')}
        onPress={submit}
        disabled={kind === 'text' && (labels.some((l) => !l.trim()) || !question.trim())}
        testID="poll-submit"
      />
    </Card>
  );
}
