import { displayTitle, type CalendarEvent, type GroupNote } from '@nowish/domain';
import type { Locale, Translate } from '@nowish/i18n';

import { VIEWER_ID } from '../agenda/presenters';
import { nameOf } from '../collab/text';

/** System notes of the group chat, rendered through i18n (never stored as prose). */
export function groupNoteText(note: GroupNote, events: readonly CalendarEvent[], t: Translate, locale: Locale): string {
  const you = note.personId === VIEWER_ID;
  const name = nameOf(note.personId, t);
  switch (note.kind) {
    case 'created':
      return you ? t('group.system.you.created') : t('group.system.created', { name });
    case 'joined':
      return you ? t('group.system.you.joined') : t('group.system.joined', { name });
    case 'left':
      return t('group.system.left', { name });
    case 'removed':
      return t('group.system.removed', { name });
    case 'meeting': {
      const e = events.find((x) => x.id === note.eventId);
      const title = e ? displayTitle(e, locale) : t('group.system.deletedEvent');
      return you ? t('group.system.you.meeting', { title }) : t('group.system.meeting', { name, title });
    }
  }
}
