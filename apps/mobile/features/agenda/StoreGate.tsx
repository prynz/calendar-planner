import type { ReactNode } from 'react';

import { ErrorState, Gutter, Skeleton } from '@nowish/ui';

import { useEvents } from '@/providers/events';
import { useI18n } from '@/providers/i18n';

/** Loading skeleton / error with retry until the local store is ready (CLAUDE.md: every screen has these states). */
export function StoreGate({ children }: { children: ReactNode }) {
  const { state, retry } = useEvents();
  const { t } = useI18n();
  if (state === 'loading') {
    return (
      <Gutter gap={4}>
        <Skeleton height={120} accessibilityLabel={t('common.loading')} />
        <Skeleton height={96} />
        <Skeleton height={96} />
      </Gutter>
    );
  }
  if (state === 'error') {
    return (
      <ErrorState
        title={t('common.error.title')}
        body={t('common.error.body')}
        retryLabel={t('common.retry')}
        onRetry={retry}
        testID="store-error"
      />
    );
  }
  return <>{children}</>;
}
