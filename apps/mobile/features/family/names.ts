import { personName } from '@nowish/demo';
import { kidById, localized, type Household, type MemberColor } from '@nowish/domain';
import type { Locale, Translate } from '@nowish/i18n';

import { VIEWER_ID } from '../agenda/presenters';

/** Display name of a household member: "You", a child profile name or a demo person. */
export function memberName(h: Household | null, id: string, t: Translate): string {
  if (id === VIEWER_ID) return t('family.you');
  const kid = h ? kidById(h, id) : undefined;
  return kid ? kid.name : personName(id);
}

export const memberColor = (h: Household | null, id: string): MemberColor | undefined =>
  h ? kidById(h, id)?.color : undefined;

/** Adults get a fixed colour so dots stay distinguishable from the children's. */
export function dotColor(h: Household, id: string): MemberColor {
  const kid = kidById(h, id);
  if (kid) return kid.color;
  return h.adultIds.indexOf(id) % 2 === 0 ? 'social' : 'health';
}

export const householdName = (h: Household, locale: Locale) => localized(h.name, h.nameI18n, locale);

/** "Lena, Paul" – for short lists in rows. */
export const namesOf = (h: Household | null, ids: readonly string[], t: Translate) =>
  ids.map((id) => memberName(h, id, t)).join(', ');
