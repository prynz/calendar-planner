import * as Haptics from 'expo-haptics';

import type { HapticIntent } from '@nowish/ui';

let enabled = true;

/** Mirrors the "Vibrate on actions" setting (set by SettingsProvider). */
export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

/** Maps design-system haptic intents to expo-haptics. Failures (e.g. no haptic engine) are non-fatal. */
export function haptic(intent: HapticIntent): void {
  if (!enabled) return;
  const run = (): Promise<void> => {
    switch (intent) {
      case 'selection':
        return Haptics.selectionAsync();
      case 'light':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'heavy':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };
  run().catch((error: unknown) => {
    console.warn('[haptics] unavailable', error instanceof Error ? error.name : 'unknown');
  });
}
