import { useEffect, useRef } from 'react';
import { FlatList, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface DateStripDay {
  key: string;
  dayNumber: string;
  weekday: string;
  /** Full spoken label, e.g. "Montag, 9. November, heute". */
  accessibilityLabel: string;
  hasEvents: boolean;
}

export interface DateStripProps {
  days: readonly DateStripDay[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

const PILL_W = touch.cta;
const GAP = space[2];
const STEP = PILL_W + GAP;

/** Horizontal day pills (reference R2) that snap to whole days and keep the selection in view. */
export function DateStrip({ days, selectedKey, onSelect }: DateStripProps) {
  const { colors } = useTheme();
  const list = useRef<FlatList<DateStripDay>>(null);
  const index = Math.max(
    0,
    days.findIndex((d) => d.key === selectedKey),
  );

  useEffect(() => {
    list.current?.scrollToIndex({ index, viewPosition: 0.35, animated: true });
  }, [index]);

  return (
    <FlatList
      ref={list}
      horizontal
      data={days}
      keyExtractor={(d) => d.key}
      showsHorizontalScrollIndicator={false}
      snapToInterval={STEP}
      decelerationRate="fast"
      initialScrollIndex={index}
      getItemLayout={(_, i) => ({ length: STEP, offset: space[4] + STEP * i, index: i })}
      contentContainerStyle={{ paddingHorizontal: space[4] }}
      ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
      renderItem={({ item: d }) => {
        const selected = d.key === selectedKey;
        return (
          <PressableScale
            testID={`day-${d.key}`}
            onPress={() => onSelect(d.key)}
            accessibilityLabel={d.accessibilityLabel}
            accessibilityState={{ selected }}
            pressedScale={0.92}
            style={{
              width: PILL_W,
              minHeight: 76,
              paddingVertical: space[3],
              borderRadius: radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              gap: space[1],
              backgroundColor: selected ? colors.accentFill : colors.surface,
            }}
          >
            <Text variant="titleM" color={selected ? 'onAccentFill' : 'textPrimary'} tabular>
              {d.dayNumber}
            </Text>
            <Text variant="label" color={selected ? 'onAccentFill' : 'textSecondary'}>
              {d.weekday}
            </Text>
            <View
              style={{
                width: space[1] + space[0.5],
                height: space[1] + space[0.5],
                borderRadius: radii.pill,
                backgroundColor: d.hasEvents ? (selected ? colors.onAccentFill : colors.accentText) : 'transparent',
              }}
            />
          </PressableScale>
        );
      }}
    />
  );
}
