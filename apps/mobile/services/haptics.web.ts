import type { HapticIntent } from '@nowish/ui';

/** Web preview: browsers have no haptic engine we can rely on – intentionally a no-op. */
export function haptic(_intent: HapticIntent): void {
  // no haptics on the web
}

/** Same API as the native module; the setting has nothing to switch on the web. */
export function setHapticsEnabled(_value: boolean): void {
  // no haptics on the web
}
