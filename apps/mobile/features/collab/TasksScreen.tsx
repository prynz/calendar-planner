import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import {
  addTask,
  localized,
  releaseTask,
  setTaskDone,
  sortTasks,
  takeTask,
  taskProgress,
  type EventTask,
} from '@nowish/domain';
import { formatShortDate } from '@nowish/i18n';
import {
  Button,
  Card,
  EmptyState,
  PressableScale,
  ProgressBar,
  radii,
  SectionTitle,
  space,
  Text,
  TextField,
  touch,
  useTheme,
} from '@nowish/ui';

import { CollabShell } from './CollabShell';
import { useCollab, type CollabContext } from './use-collab';

/** Event tasks: take one, mark done (with progress), add new ones (TSK-01…06). */
export function TasksScreen({ eventId }: { eventId: string }) {
  const ctx = useCollab(eventId);
  const { collab, t, run, viewerId } = ctx;
  const [title, setTitle] = useState('');

  const progress = collab ? taskProgress(collab.tasks) : { done: 0, total: 0 };
  return (
    <CollabShell ctx={ctx} title={t('tasks.title')} testID="screen-tasks">
      {collab ? (
        <>
          {collab.tasks.length === 0 ? (
            <EmptyState title={t('tasks.empty.title')} body={t('tasks.empty.body')} testID="tasks-empty" />
          ) : (
            <Card>
              <Text variant="titleM" testID="tasks-progress">
                {t('tasks.progress', progress)}
              </Text>
              <ProgressBar value={progress.total ? progress.done / progress.total : 0} />
              {sortTasks(collab.tasks).map((task) => (
                <TaskRow key={task.id} task={task} ctx={ctx} />
              ))}
            </Card>
          )}
          <Card>
            <SectionTitle>{t('tasks.add.title')}</SectionTitle>
            <TextField
              label={t('tasks.add.name')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('tasks.add.placeholder')}
              maxLength={120}
              testID="task-new-title"
            />
            <Button
              label={t('common.add')}
              variant="secondary"
              disabled={title.trim().length === 0}
              onPress={() => {
                void run((c, now) => addTask(c, viewerId, { title }, now), 'success').then((ok) => {
                  if (ok) setTitle('');
                });
              }}
              testID="task-add"
            />
          </Card>
        </>
      ) : null}
    </CollabShell>
  );
}

function TaskRow({ task, ctx }: { task: EventTask; ctx: CollabContext }) {
  const { colors } = useTheme();
  const { t, locale, event, run, viewerId, name, isHost } = ctx;
  const title = localized(task.title, task.titleI18n, locale);
  const done = !!task.doneAt;
  const mine = task.assigneeId === viewerId;
  const canToggle = !task.assigneeId || mine || isHost;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[3] }} testID={`task-${task.id}`}>
      <PressableScale
        onPress={() => {
          void run((c, now) => setTaskDone(c, task.id, viewerId, !done, now), done ? 'light' : 'success');
        }}
        disabled={!canToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done, disabled: !canToggle }}
        accessibilityLabel={t(done ? 'tasks.markOpen' : 'tasks.markDone', { title })}
        pressedScale={0.9}
        testID={`task-toggle-${task.id}`}
        style={{
          width: touch.min,
          height: touch.min,
          borderRadius: radii.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: done ? colors.accentFill : colors.elevated,
        }}
      >
        {done ? <Check color={colors.onAccentFill} size={22} /> : null}
      </PressableScale>
      <View style={{ flex: 1, gap: space[1], alignItems: 'flex-start' }}>
        <Text variant="bodyL" color={done ? 'textSecondary' : 'textPrimary'}>
          {title}
        </Text>
        <Text variant="label" color="textSecondary">
          {[
            task.assigneeId ? t('tasks.assignee', { name: name(task.assigneeId) }) : t('tasks.free'),
            task.dueAt && event ? t('tasks.due', { date: formatShortDate(task.dueAt, locale, event.timeZone) }) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        {!done && !task.assigneeId ? (
          <Button
            label={t('tasks.take')}
            variant="secondary"
            onPress={() => void run((c) => takeTask(c, task.id, viewerId))}
            testID={`task-take-${task.id}`}
          />
        ) : null}
        {!done && mine ? (
          <Button
            label={t('tasks.release')}
            variant="tertiary"
            onPress={() => void run((c) => releaseTask(c, task.id, viewerId))}
            testID={`task-release-${task.id}`}
          />
        ) : null}
      </View>
    </View>
  );
}
