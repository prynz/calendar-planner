import type { ReactNode } from 'react';
import { View } from 'react-native';

import { space, Text, useTheme } from '@nowish/ui';

import { useI18n } from '@/providers/i18n';

/** Phone width used for the browser preview (ADR 0011). */
const FRAME_MAX_WIDTH = 430;

/**
 * Web preview only: centres the app in a phone-sized column and labels it clearly as a preview,
 * so nobody mistakes it for a finished web product (CLAUDE.md rule 8).
 */
export function PreviewFrame({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surface }}>
      <View style={{ flex: 1, width: '100%', maxWidth: FRAME_MAX_WIDTH, backgroundColor: colors.canvas }}>
        <View
          style={{ paddingVertical: space[1], paddingHorizontal: space[4], backgroundColor: colors.elevated }}
          testID="web-preview-bar"
        >
          <Text variant="label" color="textSecondary" align="center">
            {t('web.previewBar')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </View>
  );
}
