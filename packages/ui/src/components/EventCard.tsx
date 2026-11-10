import { View } from 'react-native';

import { categoryColors, palette, radii, space, withAlpha, type EventCategory } from '../tokens';
import { AvatarStack } from './AvatarStack';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface EventCardProps {
  title: string;
  subtitle?: string;
  timeLabel: string;
  category: EventCategory;
  /** Text in the tab above the card, e.g. "in 2 Std." or "läuft". Never colour-only. */
  statusLabel: string;
  /** Compact anti-chaos line, e.g. "los um 18:30" (design-system.md §12). */
  leaveLabel?: string;
  people?: { names: readonly string[]; accessibilityLabel: string };
  onPress?: () => void;
  openHint?: string;
  testID?: string;
}

/** Pastel event card with a status tab (design-system.md §7, derived from reference R2). */
export function EventCard({
  title,
  subtitle,
  timeLabel,
  category,
  statusLabel,
  leaveLabel,
  people,
  onPress,
  openHint,
  testID,
}: EventCardProps) {
  const fill = categoryColors[category];
  const label = [statusLabel, title, timeLabel, leaveLabel, subtitle].filter(Boolean).join(', ');
  const body = (
    <>
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[3] }}>
          <Text variant="label" color="onCategoryFill" tabular>
            {timeLabel}
          </Text>
          {leaveLabel ? (
            <View
              style={{
                backgroundColor: withAlpha(palette.ink900, 0.1),
                borderRadius: radii.pill,
                paddingHorizontal: space[2],
                paddingVertical: space[0.5],
              }}
            >
              <Text variant="label" color="onCategoryFill" tabular>
                {`→ ${leaveLabel}`}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </>
  );
  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      {...(openHint ? { accessibilityHint: openHint } : {})}
      {...(testID ? { testID } : {})}
      pressedScale={0.98}
    >
      {body}
    </PressableScale>
  );
}
