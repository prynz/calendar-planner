import { View } from 'react-native';

import { radii, space, Text, touch, typography, useTheme } from '@nowish/ui';

const pad = (n: number) => String(n).padStart(2, '0');

/** Device-local wall clock, same convention as the native picker. */
function toInputValue(d: Date, mode: 'date' | 'time'): string {
  return mode === 'date'
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromInputValue(raw: string, base: Date, mode: 'date' | 'time'): Date | null {
  const next = new Date(base);
  if (mode === 'date') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!m) return null;
    next.setFullYear(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  } else {
    const m = /^(\d{2}):(\d{2})$/.exec(raw);
    if (!m) return null;
    next.setHours(Number(m[1]), Number(m[2]), 0, 0);
  }
  return Number.isNaN(next.getTime()) ? null : next;
}

/**
 * Web preview: the browser's own accessible date/time input instead of the native picker.
 * Same props as the native DateTimeField so the editor stays platform-agnostic.
 */
export function DateTimeField({
  label,
  value,
  mode,
  onChange,
  testID,
}: {
  label: string;
  valueText: string;
  value: Date;
  mode: 'date' | 'time';
  onChange: (d: Date) => void;
  doneLabel: string;
  testID: string;
}) {
  const { colors, name } = useTheme();
  const font = typography.titleM;
  return (
    <View
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
      <input
        type={mode}
        step={mode === 'time' ? 300 : undefined}
        aria-label={label}
        data-testid={testID}
        value={toInputValue(value, mode)}
        onChange={(e) => {
          const next = fromInputValue(e.currentTarget.value, value, mode);
          if (next) onChange(next);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors.textPrimary,
          colorScheme: name,
          fontFamily: font.fontFamily,
          fontSize: font.fontSize,
          minHeight: touch.min,
          textAlign: 'end',
          fontVariantNumeric: 'tabular-nums',
        }}
      />
    </View>
  );
}
