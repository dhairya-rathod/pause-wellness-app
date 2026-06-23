import type { Settings } from '../types/settings';
import type { DailyLog } from '../types/log';
import type { Feature } from '../types/feature';

export type ScheduledNotificationRecord = {
  feature: Feature;
  triggerTime: string;
  notificationId: string;
};

/**
 * App data surface.
 *
 * Slice 03 adds daily-log methods for the water-tracking state machine.
 * Slice 04 adds scheduled-notification methods for the reminder scheduler.
 * Both SqliteRepository and InMemoryRepository satisfy this contract.
 * App code consumes THIS interface — never a concrete impl directly.
 */
export interface Repository {
  getSettings(): Promise<Settings>;
  setSettings(settings: Settings): Promise<void>;

  /** Return the log for `date`, or a zeroed log when no row exists. */
  getLog(date: string): Promise<DailyLog>;

  /** Return at most `days` stored logs, most-recent first (by date desc). */
  getRecentLogs(days: number): Promise<DailyLog[]>;

  /** Insert or replace the row for `log.date`. */
  upsertLog(log: DailyLog): Promise<void>;

  /** Return all scheduled notification records for the given feature. */
  getScheduledIds(feature: Feature): Promise<ScheduledNotificationRecord[]>;

  /** Record a newly scheduled notification. */
  addScheduledId(
    feature: Feature,
    triggerTime: string,
    notificationId: string,
  ): Promise<void>;

  /** Remove every scheduled notification for the given feature. */
  clearScheduledIds(feature: Feature): Promise<void>;
}
