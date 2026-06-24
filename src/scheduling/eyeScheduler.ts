import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import type { Repository } from '../data/Repository';
import { computeEyeBreakTimes } from './eyeReminders';

export type EyeSchedulerDeps = {
  repo: Repository;
  notifications: typeof Notifications;
  now?: () => Date;
};

/**
 * Cancel all currently scheduled eye notifications and re-queue them for
 * today + the next 2 days using inexact `Date` triggers.
 *
 * - Reads settings from the repository; if `eyeEnabled` is false or `eyePaused`
 *   is true, cancels all eye notifications and returns immediately.
 * - Each notification carries `data: { feature: 'eye' }` so the response
 *   listener can route the tap to the EyeRest modal.
 * - The `channelId` is `'eye'` (chime + vibration) when
 *   `settings.soundEnabled === true`; `'eye_muted'` (vibration only)
 *   otherwise.
 *
 * On Android 12+ (API 31+) without `SCHEDULE_EXACT_ALARM`, `Date` triggers
 * are inexact (up to ~1 min drift) — exactly the timing the PRD calls for.
 */
export async function rescheduleEyeReminders(
  deps: EyeSchedulerDeps,
): Promise<void> {
  const { repo, notifications, now } = deps;
  const settings = await repo.getSettings();

  // ---- feature disabled or paused → cancel everything ------------------

  if (!settings.eyeEnabled || settings.eyePaused) {
    await cancelAllEye(repo, notifications);
    return;
  }

  // ---- cancel + re-queue -----------------------------------------------

  await cancelAllEye(repo, notifications);

  const currentMs = (now?.() ?? new Date()).getTime();
  const activeHours = {
    start: settings.activeHoursStart,
    end: settings.activeHoursEnd,
  };
  const channelId = settings.soundEnabled ? 'eye' : 'eye_muted';

  for (let offset = 0; offset <= 2; offset++) {
    const anchor = new Date(currentMs);
    anchor.setDate(anchor.getDate() + offset);

    const times = computeEyeBreakTimes(
      activeHours,
      anchor,
      offset === 0 ? new Date(currentMs) : new Date(0), // "now" only matters for today
    );

    for (const t of times) {
      try {
        const id = await notifications.scheduleNotificationAsync({
          content: {
            title: 'Pause · Eye',
            body: 'Time to rest your eyes',
            data: { feature: 'eye' },
          },
          trigger: {
            type: SchedulableTriggerInputTypes.DATE,
            date: t.getTime(),
            channelId,
          },
        });
        await repo.addScheduledId('eye', t.toISOString(), id);
      } catch {
        // Individual notification scheduling failure (e.g. platform limit) —
        // continue with the remaining fire times.
      }
    }
  }
}

/**
 * Cancel every scheduled eye notification (via the OS) and clear the
 * tracking rows from the repository. Idempotent — safe to call even when
 * there are none.
 */
async function cancelAllEye(
  repo: Repository,
  notifications: typeof Notifications,
): Promise<void> {
  const rows = await repo.getScheduledIds('eye');

  for (const row of rows) {
    try {
      await notifications.cancelScheduledNotificationAsync(
        row.notificationId,
      );
    } catch {
      // Already cancelled or invalid — ignore and continue.
    }
  }

  await repo.clearScheduledIds('eye');
}
