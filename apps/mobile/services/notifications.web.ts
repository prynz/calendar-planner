import type { PlannedReminder } from '@/features/reminders/plan';

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';
export type ReminderAction = 'on-my-way' | 'running-late' | 'open';
export interface ReminderResponse {
  action: ReminderAction;
  eventId: string;
  occurrenceKey: string;
  plannedLeaveAt: Date;
}

/** Web preview: no notification actions – "on my way" and "running late" are buttons in the app. */
export async function setupActions(_labels: { onMyWay: string; runningLate: string }): Promise<void> {}

export function onReminderResponse(_handler: (r: ReminderResponse) => void): () => void {
  return () => undefined;
}

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
