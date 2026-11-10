import { COLLAB_LIMITS, CollabError, nextId, type EventCollab, type EventTask } from './model';
import { memberIds } from './rsvp';

export function taskProgress(tasks: readonly EventTask[]): { done: number; total: number } {
  return { done: tasks.filter((t) => t.doneAt).length, total: tasks.length };
}

/** Open tasks first (soonest due first), then done ones. */
export function sortTasks(tasks: readonly EventTask[]): EventTask[] {
  const due = (t: EventTask) => t.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return [...tasks].sort((a, b) => Number(!!a.doneAt) - Number(!!b.doneAt) || due(a) - due(b));
}

export function addTask(
  c: EventCollab,
  actorId: string,
  input: { title: string; dueAt?: Date; assigneeId?: string },
  now: Date,
): EventCollab {
  const members = memberIds(c);
  if (!members.includes(actorId)) throw new CollabError('not-invited');
  const title = input.title.trim();
  if (title.length === 0 || title.length > COLLAB_LIMITS.title) throw new CollabError('invalid-input');
  if (input.assigneeId !== undefined && !members.includes(input.assigneeId)) throw new CollabError('invalid-input');
  // Assigning someone else is the host's call (TSK-02); everyone may self-assign (TSK-03).
  if (input.assigneeId !== undefined && input.assigneeId !== actorId && actorId !== c.hostId)
    throw new CollabError('not-host');
  const task: EventTask = {
    id: nextId('task', c.tasks, now),
    title,
    ...(input.dueAt ? { dueAt: input.dueAt } : {}),
    ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
  };
  return { ...c, tasks: [...c.tasks, task] };
}

const update = (c: EventCollab, taskId: string, fn: (t: EventTask) => EventTask): EventCollab => {
  if (!c.tasks.some((t) => t.id === taskId)) throw new CollabError('not-found');
  return { ...c, tasks: c.tasks.map((t) => (t.id === taskId ? fn(t) : t)) };
};

/** "I'll do it" – first one wins; the second gets `already-taken` with the name (tasks.md). */
export function takeTask(c: EventCollab, taskId: string, personId: string): EventCollab {
  if (!memberIds(c).includes(personId)) throw new CollabError('not-invited');
  return update(c, taskId, (t) => {
    if (t.assigneeId && t.assigneeId !== personId) throw new CollabError('already-taken', t.assigneeId);
    return { ...t, assigneeId: personId };
  });
}

export function releaseTask(c: EventCollab, taskId: string, personId: string): EventCollab {
  return update(c, taskId, (t) => {
    if (t.assigneeId !== personId && personId !== c.hostId) throw new CollabError('not-host');
    const { assigneeId: _a, ...rest } = t;
    return rest;
  });
}

/** Marks done (or reopens). Only the assignee or the host; unassigned tasks are taken on the way. */
export function setTaskDone(c: EventCollab, taskId: string, personId: string, done: boolean, now: Date): EventCollab {
  const task = c.tasks.find((t) => t.id === taskId);
  if (!task) throw new CollabError('not-found');
  if (task.assigneeId && task.assigneeId !== personId && personId !== c.hostId)
    throw new CollabError('already-taken', task.assigneeId);
  if (!memberIds(c).includes(personId)) throw new CollabError('not-invited');
  const next = update(c, taskId, (t) => {
    const { doneAt: _d, ...rest } = t;
    return done ? { ...rest, assigneeId: t.assigneeId ?? personId, doneAt: now } : rest;
  });
  if (!done || task.doneAt) return next;
  return {
    ...next,
    messages: [
      ...next.messages,
      {
        id: `sys-done-${taskId}-${now.getTime()}`,
        at: now,
        type: 'system',
        note: { kind: 'task-done', personId, taskId },
      },
    ],
  };
}
