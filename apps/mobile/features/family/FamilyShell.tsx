import type { ReactNode } from 'react';

import { DetailShell } from '../shell/DetailShell';
import { householdName } from './names';
import type { FamilyContext } from './use-family';

/** Family sub-screens (rides, shopping, chores, members) in the shared detail frame. */
export function FamilyShell({
  ctx,
  title,
  testID,
  children,
  footer,
}: {
  ctx: FamilyContext;
  title: string;
  testID: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { household, t, locale, error } = ctx;
  return (
    <DetailShell
      eyebrow={household ? householdName(household, locale) : undefined}
      title={title}
      demo={!!household?.id.startsWith('demo-')}
      error={error}
      missing={
        household ? null : { title: t('family.empty.title'), body: t('family.empty.body'), testID: 'family-missing' }
      }
      testID={testID}
      backTestID="family-back"
      footer={footer}
    >
      {children}
    </DetailShell>
  );
}
