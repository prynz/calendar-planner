import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { palette } from '@nowish/ui/tokens';

import type { PlannedReminder } from '@/features/reminders/plan';

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

const CHANNEL_ID = 'leave-reminders';
const SOURCE = 'nowish-leave';
const CATEGORY = 'leave-actions';

/** Actions on every leave reminder (anti-chaos-engine.md: each reminder offers both). */
export type ReminderAction = 'on-my-way' | 'running-late' | 'open';

export interface ReminderResponse {
  action: ReminderAction;
  eventId: string;
  occurrenceKey: string;
  plannedLeaveAt: Date;
}

/** Registers the two action buttons; labels follow the app language. */
export async function setupActions(labels: { onMyWay: string; runningLate: string }): Promise<void> {
  await Notifications.setNotificationCategoryAsync(CATEGORY, [
    // Records the departure without opening the app.
    { identifier: 'on-my-way', buttonTitle: labels.onMyWay, options: { opensAppToForeground: false } },
    // Opens the event to pick +5/+10/+15/+30.
    { identifier: 'running-late', buttonTitle: labels.runningLate, options: { opensAppToForeground: true } },
  ]);
}

function parseResponse(r: Notifications.NotificationResponse): ReminderResponse | null {
  const data = r.notification.request.content.data as Record<string, unknown> | null;
  if (data?.source !== SOURCE) return null;
  const { eventId, occurrenceKey, plannedLeaveAt } = data;
  if (typeof eventId !== 'string' || typeof occurrenceKey !== 'string' || typeof plannedLeaveAt !== 'string')
    return null;
  const planned = new Date(plannedLeaveAt);
  if (Number.isNaN(planned.getTime())) return null;
  const action: ReminderAction =
    r.actionIdentifier === 'on-my-way' ? 'on-my-way' : r.actionIdentifier === 'running-late' ? 'running-late' : 'open';
  return { action, eventId, occurrenceKey, plannedLeaveAt: planned };
}

/**
 * Taps on reminders and their actions – including the one that launched the app (handled once).
 * Returns the unsubscribe function.
 */
export function onReminderResponse(handler: (r: ReminderResponse) => void): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const parsed = parseResponse(r);
    if (parsed) handler(parsed);
  });
  const last = Notifications.getLastNotificationResponse();
  const parsedLast = last ? parseResponse(last) : null;
  if (parsedLast) {
    Notifications.clearLastNotificationResponse();
    handler(parsedLast);
  }
  return () => sub.remove();
}

/** Show reminders as banners even while the app is open – they are time-critical. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureChannel(channelName: string): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: channelName,
    importance: AndroidImportance.HIGH,
    lightColor: palette.lime400,
    vibrationPattern: [0, 180, 120, 180],
  });
}

export async function getPermission(): Promise<PermissionState> {
  try {
    const p = await Notifications.getPermissionsAsync();
    if (p.granted) return 'granted';
    return p.canAskAgain ? 'undetermined' : 'denied';
  } catch (error) {
    console.warn('[notifications] permission check failed', error instanceof Error ? error.message : 'unknown');
    return 'unavailable';
  }
}

/** Asks the OS – only called after the user tapped "allow reminders" (explained beforehand). */
export async function requestPermission(channelName: string): Promise<PermissionState> {
  await ensureChannel(channelName);
  const p = await Notifications.requestPermissionsAsync();
  if (p.granted) return 'granted';
  return p.canAskAgain ? 'undetermined' : 'denied';
}

export function openSystemSettings(): void {
  Linking.openSettings().catch((error: unknown) => {
    console.warn('[notifications] cannot open settings', error instanceof Error ? error.message : 'unknown');
  });
}

/**
 * Replaces all of our scheduled reminders with `plan` (other apps' notifications are untouched).
 * Returns how many were scheduled per event.
 */
export async function replaceScheduled(
  plan: readonly PlannedReminder[],
  channelName: string,
): Promise<Map<string, number>> {
  await ensureChannel(channelName);
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((n) => (n.content.data as { source?: unknown } | null)?.source === SOURCE)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  const perEvent = new Map<string, number>();
  for (const r of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: r.id,
      content: {
        title: r.title,
        body: r.body,
        data: {
          source: SOURCE,
          eventId: r.eventId,
          occurrenceKey: r.occurrenceKey,
          plannedLeaveAt: r.plannedLeaveAt.toISOString(),
          stage: r.stage,
        },
        categoryIdentifier: CATEGORY,
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL_ID },
    });
    perEvent.set(r.eventId, (perEvent.get(r.eventId) ?? 0) + 1);
  }
  return perEvent;
}
