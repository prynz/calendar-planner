import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { displayTitle } from '@nowish/domain';
import { Badge, EmptyState, IconButton, space, Text, useTheme } from '@nowish/ui';

import { StoreGate } from '../agenda/StoreGate';
import type { CollabContext } from './use-collab';

/**
 * Frame for the event sub-screens (guests, poll, bring list, tasks, chat): back button, title, event name,
 * Demo label, visible error line, and the not-found state. `footer` stays above the keyboard (chat input).
 */
export function CollabShell({
  ctx,
  title,
  testID,
  children,
  footer,
  scrollRef,
}: {
  ctx: CollabContext;
  title: string;
  testID: string;
  children: ReactNode;
  footer?: ReactNode;
  scrollRef?: React.RefObject<React.ComponentRef<typeof ScrollView> | null>;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { event, collab, t, locale, error } = ctx;

  const header = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingTop: insets.top + space[2],
        paddingHorizontal: space[4],
        paddingBottom: space[2],
      }}
    >
      <IconButton
        icon={(c) => <ChevronLeft color={c} size={22} />}
        onPress={() => router.back()}
        accessibilityLabel={t('common.back')}
        testID="collab-back"
      />
      <View style={{ flex: 1 }}>
        {event ? (
          <Text variant="label" color="textSecondary" numberOfLines={1}>
            {displayTitle(event, locale)}
          </Text>
        ) : null}
        <Text variant="titleL" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {event?.isDemo ? <Badge label={t('demo.badge')} tone="demo" /> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {header}
      <ScrollView
        ref={scrollRef}
        testID={testID}
        contentContainerStyle={{ paddingHorizontal: space[5], paddingBottom: space[6], gap: space[4] }}
        keyboardShouldPersistTaps="handled"
      >
        <StoreGate>
          {!event || !collab ? (
            <EmptyState
              title={t('collab.notFound.title')}
              body={t('collab.notFound.body')}
              action={{ label: t('common.back'), onPress: () => router.back() }}
              testID="collab-not-found"
            />
          ) : (
            <>
              {error ? (
                <Text variant="bodyM" color="dangerText" accessibilityRole="alert" testID="collab-error">
                  {error}
                </Text>
              ) : null}
              {children}
            </>
          )}
        </StoreGate>
      </ScrollView>
      {footer && event && collab ? (
        <View style={{ paddingHorizontal: space[4], paddingTop: space[2], paddingBottom: insets.bottom + space[2] }}>
          {footer}
        </View>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </KeyboardAvoidingView>
  );
}
