import { Alert } from 'react-native';

export interface ConfirmChoice {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

/** Native confirmation sheet with a cancel button and one or more choices. */
export function confirm(title: string, message: string, cancelLabel: string, choices: readonly ConfirmChoice[]): void {
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    ...choices.map((c) => ({
      text: c.label,
      style: c.destructive ? ('destructive' as const) : ('default' as const),
      onPress: c.onPress,
    })),
  ]);
}
