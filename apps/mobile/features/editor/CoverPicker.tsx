import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { EVENT_COVERS, isPremiumCover, type EventCategory, type EventCover } from '@nowish/domain';
import type { Translate } from '@nowish/i18n';
import { CoverBand, FieldLabel, Gutter, PressableScale, radii, space, Text, useTheme } from '@nowish/ui';

import { useAccount } from '@/providers/account';
import { haptic } from '@/services/haptics';

/** Cover choice (events.md). Premium covers are part of Plus; on Free they lead to the plans instead. */
export function CoverPicker({
  value,
  category,
  onChange,
  t,
}: {
  value: EventCover;
  category: EventCategory;
  onChange: (c: EventCover) => void;
  t: Translate;
}) {
  const { limits } = useAccount();
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Gutter gap={2}>
      <FieldLabel>{t('cover.label')}</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space[3] }}>
        {EVENT_COVERS.map((c) => {
          const locked = isPremiumCover(c) && limits.covers !== 'premium';
          const label = isPremiumCover(c) ? t('cover.premium', { name: t(`cover.${c}`) }) : t(`cover.${c}`);
          const selected = value === c;
          return (
            <PressableScale
              key={c}
              onPress={() => {
                haptic('selection');
                if (locked) router.push({ pathname: '/paywall', params: { reason: 'covers' } });
                else onChange(c);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              accessibilityLabel={label}
              testID={`editor-cover-${c}`}
              style={{
                width: 96,
                gap: space[1],
                padding: space[1],
                borderRadius: radii.md,
                borderWidth: 2,
                borderColor: selected ? colors.textPrimary : 'transparent',
                opacity: locked ? 0.6 : 1,
              }}
            >
              <CoverBand cover={c} category={category} height={48} />
              <View>
                <Text variant="label" numberOfLines={2}>
                  {label}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>
    </Gutter>
  );
}
