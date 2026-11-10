import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { Button, space, useTheme, ValueRow } from '@nowish/ui';

/**
 * Native date/time picker behind a value row. Android shows the system dialog; iOS shows the inline
 * spinner below the row with a "done" button – both are the platform's own, accessible pickers.
 */
export function DateTimeField({
  label,
  valueText,
  value,
  mode,
  onChange,
  doneLabel,
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
  const [open, setOpen] = useState(false);
  const { name } = useTheme();
  const handle = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (e.type === 'set' && d) onChange(d);
  };
  return (
    <View style={{ gap: space[2] }}>
      <ValueRow label={label} value={valueText} onPress={() => setOpen((o) => !o)} testID={testID} />
      {open ? (
        <>
          <DateTimePicker
            value={value}
            mode={mode}
            is24Hour
            minuteInterval={5}
            display={Platform.OS === 'ios' ? (mode === 'date' ? 'inline' : 'spinner') : 'default'}
            themeVariant={name}
            onChange={handle}
            testID={`${testID}-picker`}
          />
          {Platform.OS === 'ios' ? (
            <Button label={doneLabel} variant="secondary" onPress={() => setOpen(false)} />
          ) : null}
        </>
      ) : null}
    </View>
  );
}
