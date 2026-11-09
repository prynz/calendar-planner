import { View } from 'react-native';

import { categoryColors, radii, space, type EventCategory } from '../tokens';
import { AvatarStack } from './AvatarStack';
import { Text } from './Text';

export interface EventCardProps {
  title: string;
  subtitle?: string;
  timeLabel: string;
  category: EventCategory;
  /** Text in the tab above the card, e.g. "in 2 Std." or "läuft". Never color-only. */
  statusLabel: string;
  people?: { names: readonly string[]; accessibilityLabel: string };
  testID?: string;
}

/**
 * Pastel event card with a status tab (design-system.md §7, derived from reference R2).
 * Not pressable in Phase 1 – event details arrive in Phase 4.
 */
export function EventCard({ title, subtitle, timeLabel, category, statusLabel, people, testID }: EventCardProps) {
  const fill = categoryColors[category];
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={[statusLabel, title, timeLabel, subtitle].filter(Boolean).join(', ')}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View
          style={{
            backgroundColor: fill,
            borderTopStartRadius: radii.md,
            borderTopEndRadius: radii.md,
            paddingHorizontal: space[4],
            paddingTop: space[2],
            paddingBottom: space[1],
          }}
        >
          <Text variant="label" color="onCategoryFill">
            {statusLabel}
          </Text>
        </View>
        {people ? (
          <View style={{ paddingBottom: space[1] }}>
            <AvatarStack names={people.names} accessibilityLabel={people.accessibilityLabel} />
          </View>
        ) : null}
      </View>
      <View
        style={{
          backgroundColor: fill,
          borderRadius: radii.lg,
          borderTopStartRadius: 0,
          padding: space[5],
          gap: space[1],
        }}
      >
        <Text variant="titleM" color="onCategoryFill">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyM" color="onCategoryFill">
            {subtitle}
          </Text>
        ) : null}
        <Text variant="label" color="onCategoryFill" tabular>
          {timeLabel}
        </Text>
      </View>
    </View>
  );
}
