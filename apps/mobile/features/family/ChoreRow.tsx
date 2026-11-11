import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import { localized, toggleChoreDone, type Chore, type DayKey } from '@nowish/domain';
import { PressableScale, radii, space, Text, touch, useTheme } from '@nowish/ui';

import { memberName } from './names';
import type { FamilyContext } from './use-family';

/** One due chore with whose turn it is; tapping ticks it for that day (any adult may tick for a child). */
export function ChoreRow({
  ctx,
  chore,
  day,
  turn,
  done,
}: {
  ctx: FamilyContext;
  chore: Chore;
  day: DayKey;
  turn: string | undefined;
  done: boolean;
}) {
  const { household, t, locale, run, viewerId } = ctx;
  const { colors } = useTheme();
  if (!household) return null;
  const who =
    turn === viewerId ? t('chores.turnYou') : t('chores.turn', { name: memberName(household, turn ?? '', t) });
  const title = `${chore.emoji ? `${chore.emoji} ` : ''}${localized(chore.title, chore.titleI18n, locale)}`;
  return (
    <PressableScale
      onPress={() => void run((h) => toggleChoreDone(h, viewerId, chore.id, day), done ? 'light' : 'success')}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${title}, ${who}`}
      testID={`chore-${chore.id}`}
      pressedScale={0.98}
      style={{
        minHeight: touch.cta,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingHorizontal: space[3],
        borderRadius: radii.md,
        backgroundColor: colors.elevated,
      }}
    >
      <View
        style={{
          width: space[6],
          height: space[6],
          borderRadius: radii.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: done ? colors.accentFill : colors.surface,
        }}
      >
        {done ? <Check color={colors.onAccentFill} size={16} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyL" color={done ? 'textSecondary' : 'textPrimary'}>
          {title}
        </Text>
        <Text variant="label" color="textSecondary">
          {done ? t('chores.doneBy') : who}
        </Text>
      </View>
    </PressableScale>
  );
}
