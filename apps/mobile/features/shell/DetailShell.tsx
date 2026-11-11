import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode, RefObject } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, EmptyState, IconButton, space, Text, useTheme } from '@nowish/ui';

import { StoreGate } from '../agenda/StoreGate';
import { useI18n } from '@/providers/i18n';

/**
 * Frame for pushed detail screens (family, groups): back button, eyebrow + title, Demo label, a visible
 * error line and a "not found" state. `footer` stays above the keyboard (inputs).
 */
export function DetailShell({
  eyebrow,
  title,
  demo,
  error,
  missing,
  testID,
  backTestID,
  children,
  footer,
  scrollRef,
}: {
  eyebrow?: string | undefined;
  title: string;
  demo: boolean;
  error: string | null;
  /** Shown instead of the content when the thing does not exist (anymore). */
  missing: { title: string; body: string; testID: string } | null;
  testID: string;
  backTestID: string;
  children: ReactNode;
  footer?: ReactNode;
  scrollRef?: RefObject<React.ComponentRef<typeof ScrollView> | null>;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    // Android is edge-to-edge (SDK 58): pad on both platforms so inputs stay above the keyboard.
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.canvas }} behavior="padding">
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
          testID={backTestID}
        />
        <View style={{ flex: 1 }}>
          {eyebrow ? (
            <Text variant="label" color="textSecondary" numberOfLines={1}>
              {eyebrow}
            </Text>
          ) : null}
          <Text variant="titleL" accessibilityRole="header">
            {title}
          </Text>
        </View>
        {demo ? <Badge label={t('demo.badge')} tone="demo" /> : null}
      </View>
      <ScrollView
        ref={scrollRef}
        testID={testID}
        contentContainerStyle={{ paddingHorizontal: space[5], paddingBottom: space[6], gap: space[4] }}
        keyboardShouldPersistTaps="handled"
      >
        <StoreGate>
          {missing ? (
            <EmptyState
              title={missing.title}
              body={missing.body}
              action={{ label: t('common.back'), onPress: () => router.back() }}
              testID={missing.testID}
            />
          ) : (
            <>
              {error ? (
                <Text variant="bodyM" color="dangerText" accessibilityRole="alert" testID={`${testID}-error`}>
                  {error}
                </Text>
              ) : null}
              {children}
            </>
          )}
        </StoreGate>
      </ScrollView>
      {footer && !missing ? (
        <View style={{ paddingHorizontal: space[4], paddingTop: space[2], paddingBottom: insets.bottom + space[2] }}>
          {footer}
        </View>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </KeyboardAvoidingView>
  );
}
