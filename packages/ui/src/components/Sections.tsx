import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { cardShadow, radii, space, touch } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

/**
 * Phase 8 building blocks for calm, clearly separated screens: every area is a section with a header and one white
 * card; long lists show a few rows and an "all" action instead of a wall of text.
 */

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onPress: () => void; testID?: string };
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] }}>
      <View style={{ flex: 1 }}>
        <Text variant="titleM" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={8}
          style={{ minHeight: touch.min, justifyContent: 'center' }}
          {...(action.testID ? { testID: action.testID } : {})}
        >
          <Text variant="label" color="textSecondary">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** White card (with a soft shadow on light) – the one container type of the Phase 8 screens. */
export function SoftCard({
  children,
  testID,
  padded = true,
}: {
  children: ReactNode;
  testID?: string;
  padded?: boolean;
}) {
  const { colors, name } = useTheme();
  return (
    <View
      {...(testID ? { testID } : {})}
      style={{
        backgroundColor: colors.elevated,
        borderRadius: radii.lg,
        padding: padded ? space[4] : 0,
        paddingHorizontal: space[4],
        gap: space[3],
        ...cardShadow(name),
      }}
    >
      {children}
    </View>
  );
}

/** Rows inside one SoftCard, separated by hairlines. */
export function ListCard({ children, testID }: { children: ReactNode; testID?: string }) {
  const { colors } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <SoftCard padded={false} {...(testID ? { testID } : {})}>
      <View>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={{ height: 1, backgroundColor: colors.surface }} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </SoftCard>
  );
}

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Right column, e.g. a time. */
  trailing?: string;
  /** Small note under `trailing`, e.g. "tight". Shown in the danger colour, never alone (also in the label). */
  note?: string;
  /** Category colour as a dot; `dashed` marks free time. */
  marker?: { color: string } | 'dashed';
  /** Avatar initials instead of a dot. */
  avatar?: { initials: string; color: string };
  onPress?: () => void;
  accessibilityLabel: string;
  testID?: string;
  /** Optional element at the far right (e.g. a small button). */
  action?: ReactNode;
}

export function ListRow({
  title,
  subtitle,
  trailing,
  note,
  marker,
  avatar,
  onPress,
  accessibilityLabel,
  testID,
  action,
}: ListRowProps) {
  const { colors } = useTheme();
  const body = (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 64, paddingVertical: space[3] }}
    >
      {avatar ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.pill,
            backgroundColor: avatar.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="label" color="onCategoryFill" maxFontSizeMultiplier={1.3}>
            {avatar.initials}
          </Text>
        </View>
      ) : marker ? (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: radii.pill,
            ...(marker === 'dashed'
              ? { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border }
              : { backgroundColor: marker.color }),
          }}
        />
      ) : null}
      <View style={{ flex: 1, gap: space[0.5] }}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? (
          <Text variant="bodyM" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing || note ? (
        <View style={{ alignItems: 'flex-end', gap: space[0.5] }}>
          {trailing ? (
            <Text variant="label" tabular>
              {trailing}
            </Text>
          ) : null}
          {note ? (
            <Text variant="label" color="dangerText">
              {note}
            </Text>
          ) : null}
        </View>
      ) : null}
      {action}
    </View>
  );
  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={accessibilityLabel}
        style={{ paddingHorizontal: space[4] }}
        {...(testID ? { testID } : {})}
      >
        {body}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      pressedScale={0.98}
      style={{ paddingHorizontal: space[4] }}
      {...(testID ? { testID } : {})}
    >
      {body}
    </PressableScale>
  );
}

/** Key figure tile: big number, short label. */
export function StatTile({ value, label, testID }: { value: string; label: string; testID?: string }) {
  return (
    <View style={{ flex: 1 }} accessible accessibilityLabel={`${value} ${label}`} {...(testID ? { testID } : {})}>
      <SoftCard>
        <Text variant="titleL" tabular>
          {value}
        </Text>
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
      </SoftCard>
    </View>
  );
}
