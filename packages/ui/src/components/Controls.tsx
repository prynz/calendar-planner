import type { ReactNode } from 'react';
import { Switch, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, space, touch, typography, withAlpha } from '../tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  testID,
  tone = 'tonal',
}: {
  icon: (color: string) => ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
  tone?: 'tonal' | 'accent';
}) {
  const { colors } = useTheme();
  const accent = tone === 'accent';
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      {...(testID ? { testID } : {})}
      pressedScale={0.92}
      style={{
        width: touch.min,
        height: touch.min,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: accent ? colors.accentFill : colors.elevated,
      }}
    >
      {icon(accent ? colors.onAccentFill : colors.textPrimary)}
    </PressableScale>
  );
}

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  /** Optional colour dot (e.g. category) – the label always carries the meaning too. */
  swatch?: string;
}

/** Selectable chips; `multiple` turns it into a checkbox group. */
export function ChipGroup<T extends string>({
  options,
  selected,
  onToggle,
  accessibilityLabel,
  testIDPrefix,
  multiple = false,
}: {
  options: readonly ChipOption<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  accessibilityLabel: string;
  testIDPrefix: string;
  multiple?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole={multiple ? 'none' : 'radiogroup'}
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}
    >
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <PressableScale
            key={o.value}
            testID={`${testIDPrefix}-${o.value}`}
            onPress={() => onToggle(o.value)}
            accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityState={multiple ? { checked: on } : { selected: on, checked: on }}
            accessibilityLabel={o.label}
            pressedScale={0.94}
            style={{
              minHeight: touch.min - space[2],
              paddingHorizontal: space[4],
              borderRadius: radii.pill,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[2],
              backgroundColor: on ? colors.accentFill : colors.elevated,
            }}
            hitSlop={space[1]}
          >
            {o.swatch ? (
              <View
                style={{ width: space[3], height: space[3], borderRadius: radii.pill, backgroundColor: o.swatch }}
              />
            ) : null}
            <Text variant="label" color={on ? 'onAccentFill' : 'textPrimary'}>
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export function FieldLabel({ children, error }: { children: string; error?: string | undefined }) {
  return (
    <View style={{ gap: space[1] }}>
      <Text variant="label" color="textSecondary">
        {children}
      </Text>
      {error ? (
        <Text variant="label" color="dangerText" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  testID,
  maxLength,
  autoFocus,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string | undefined;
  testID?: string;
  maxLength?: number;
  autoFocus?: boolean;
  keyboardType?: KeyboardTypeOptions;
}) {
  const { colors } = useTheme();
  const t = typography.bodyL;
  return (
    <View style={{ gap: space[2] }}>
      <FieldLabel error={error}>{label}</FieldLabel>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        {...(placeholder ? { placeholder } : {})}
        placeholderTextColor={withAlpha(colors.textSecondary, 0.8)}
        accessibilityLabel={label}
        {...(maxLength !== undefined ? { maxLength } : {})}
        {...(autoFocus ? { autoFocus } : {})}
        {...(keyboardType ? { keyboardType } : {})}
        maxFontSizeMultiplier={t.maxScale}
        style={{
          minHeight: touch.cta,
          borderRadius: radii.md,
          paddingHorizontal: space[4],
          backgroundColor: colors.elevated,
          color: colors.textPrimary,
          fontFamily: t.fontFamily,
          fontSize: t.fontSize,
          borderWidth: 1.5,
          borderColor: error ? colors.dangerText : 'transparent',
        }}
      />
    </View>
  );
}

/** − value + control for minutes and counts. Each button announces what it changes. */
export function Stepper({
  label,
  valueText,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  canDecrease = true,
  canIncrease = true,
  testIDPrefix,
}: {
  label: string;
  valueText: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel: string;
  increaseLabel: string;
  canDecrease?: boolean;
  canIncrease?: boolean;
  testIDPrefix: string;
}) {
  const { colors } = useTheme();
  const btn = (sign: string, onPress: () => void, a11y: string, enabled: boolean, id: string) => (
    <PressableScale
      testID={`${testIDPrefix}-${id}`}
      onPress={onPress}
      disabled={!enabled}
      accessibilityLabel={a11y}
      pressedScale={0.9}
      style={{
        width: touch.min,
        height: touch.min,
        borderRadius: radii.pill,
        backgroundColor: colors.elevated,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="titleM">{sign}</Text>
    </PressableScale>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] }}>
      <Text variant="bodyL">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        {btn('−', onDecrease, decreaseLabel, canDecrease, 'dec')}
        <View style={{ minWidth: space[16] + space[2], alignItems: 'center' }} accessibilityLiveRegion="polite">
          <Text variant="titleM" tabular testID={`${testIDPrefix}-value`}>
            {valueText}
          </Text>
        </View>
        {btn('+', onIncrease, increaseLabel, canIncrease, 'inc')}
      </View>
    </View>
  );
}

export function SwitchRow({
  label,
  value,
  onChange,
  testID,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: touch.min }}>
      <Text variant="bodyL">{label}</Text>
      <Switch
        {...(testID ? { testID } : {})}
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.accentFill }}
        thumbColor={colors.elevated}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

/** Tappable row showing a value (date, time) that opens a picker. */
export function ValueRow({
  label,
  value,
  onPress,
  testID,
}: {
  label: string;
  value: string;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`${label}: ${value}`}
      {...(testID ? { testID } : {})}
      pressedScale={0.98}
      style={{
        minHeight: touch.min,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space[4],
        borderRadius: radii.md,
        backgroundColor: colors.elevated,
      }}
    >
      <Text variant="bodyL" color="textSecondary">
        {label}
      </Text>
      <Text variant="titleM" tabular>
        {value}
      </Text>
    </PressableScale>
  );
}
