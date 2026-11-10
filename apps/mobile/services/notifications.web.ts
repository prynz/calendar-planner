import type { PlannedReminder } from '@/features/reminders/plan';

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

/** Web preview: the browser cannot deliver scheduled local reminders – the UI says so honestly. */
export async function getPermission(): Promise<PermissionState> {
  return 'unavailable';
}

export async function requestPermission(_channelName: string): Promise<PermissionState> {
  return 'unavailable';
}

export function openSystemSettings(): void {
  // Nothing to open on the web; the button is never shown for 'unavailable'.
}

export async function replaceScheduled(
  _plan: readonly PlannedReminder[],
  _channelName: string,
): Promise<Map<string, number>> {
  return new Map();
}
