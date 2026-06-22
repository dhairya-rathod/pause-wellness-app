import * as Notifications from 'expo-notifications';

export type PermissionResult = 'granted' | 'denied' | 'unknown';

/**
 * Create the notification channel (required on Android 13+ before the
 * POST_NOTIFICATIONS prompt will appear) then request permission.
 *
 * Both steps are wrapped in try/catch so the caller can always complete its
 * flow — a deny or an unavailable channel is never a crash.
 *
 * The `reminders` channel is reused by the later scheduling slice.
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  try {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  } catch {
    // iOS, already exists, or headless — safe to ignore
  }

  try {
    const { granted } = await Notifications.requestPermissionsAsync();
    return granted ? 'granted' : 'denied';
  } catch {
    return 'unknown';
  }
}
