import type { ConfirmChoice } from './confirm';

export type { ConfirmChoice };

/**
 * Web preview: react-native-web has no Alert, so we use the browser's own confirm dialog.
 * With several choices each is offered in turn ("Only this one?" → "Whole series?").
 */
export function confirm(title: string, message: string, _cancelLabel: string, choices: readonly ConfirmChoice[]): void {
  for (const choice of choices) {
    if (globalThis.confirm(`${title}\n\n${message}\n\n→ ${choice.label}?`)) {
      choice.onPress();
      return;
    }
  }
}
