import type { HapticIntent } from '@nowish/ui';

/** Web preview: browsers have no haptic engine we can rely on – intentionally a no-op. */
export function haptic(_intent: HapticIntent): void {
  // no haptics on the web
}
