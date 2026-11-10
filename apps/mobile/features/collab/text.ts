import { personName } from '@nowish/demo';
import {
  localized,
  templateById,
  type ChatMessage,
  type EventCollab,
  type EventTemplate,
  type PollOption,
  type SystemNote,
} from '@nowish/domain';
import { formatShortDate, formatTime, type Locale, type MessageKey, type Translate } from '@nowish/i18n';

import { VIEWER_ID } from '../agenda/presenters';

export const nameOf = (id: string, t: Translate) => (id === VIEWER_ID ? t('collab.you') : personName(id));

export function optionLabel(o: PollOption, locale: Locale, timeZone: string): string {
  if (o.type === 'text') return localized(o.label, o.labelI18n, locale);
  return `${formatShortDate(o.start, locale, timeZone)} · ${formatTime(o.start, locale, timeZone)}`;
}

/**
 * Template texts live in i18n under `template.<id>.<part>`; the key set is checked against every
 * template in __tests__/collab.test.tsx (DE and EN), which is what makes this cast safe.
 */
export function templateText(
  t: Translate,
  id: EventTemplate['id'],
  part: 'title' | 'description' | `task.${string}` | `bring.${string}`,
): string {
  return t(`template.${id}.${part}` as MessageKey);
}

export function noteText(note: SystemNote, c: EventCollab, t: Translate, locale: Locale, timeZone: string): string {
  switch (note.kind) {
    case 'rsvp':
      // German/English conjugate differently for "you" – own keys instead of "Du ist dabei".
      return note.personId === VIEWER_ID
        ? t(`chat.system.you.rsvp.${note.answer}`)
        : t(`chat.system.rsvp.${note.answer}`, { name: nameOf(note.personId, t) });
    case 'invited':
      return t('chat.system.invited', { names: note.personIds.map((id) => nameOf(id, t)).join(', ') });
    case 'poll-created': {
      const p = c.polls.find((x) => x.id === note.pollId);
      return t('chat.system.poll-created', { question: p ? localized(p.question, p.questionI18n, locale) : '' });
    }
    case 'poll-decided': {
      const p = c.polls.find((x) => x.id === note.pollId);
      const o = p?.options.find((x) => x.id === p.chosenOptionId);
      return t('chat.system.poll-decided', { option: o ? optionLabel(o, locale, timeZone) : '' });
    }
    case 'task-done': {
      const task = c.tasks.find((x) => x.id === note.taskId);
      const title = task ? localized(task.title, task.titleI18n, locale) : '';
      return note.personId === VIEWER_ID
        ? t('chat.system.you.task-done', { task: title })
        : t('chat.system.task-done', { name: nameOf(note.personId, t), task: title });
    }
  }
}

export function messagePreview(m: ChatMessage, c: EventCollab, t: Translate, locale: Locale, tz: string): string {
  if (m.type === 'system') return noteText(m.note, c, t, locale, tz);
  return `${nameOf(m.authorId, t)}: ${localized(m.body, m.bodyI18n, locale)}`;
}

export const templateFor = (id: string | undefined) => (id ? templateById(id) : undefined);
