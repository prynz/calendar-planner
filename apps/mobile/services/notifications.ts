import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { palette } from '@nowish/ui/tokens';

import type { PlannedReminder } from '@/features/reminders/plan';

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

const CHANNEL_ID = 'leave-reminders';
const SOURCE = 'nowish-leave';

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
        data: { source: SOURCE, eventId: r.eventId, stage: r.stage },
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL_ID },
    });
    perEvent.set(r.eventId, (perEvent.get(r.eventId) ?? 0) + 1);
  }
  return perEvent;
}
