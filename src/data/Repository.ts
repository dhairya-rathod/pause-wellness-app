import type { Settings } from '../types/settings';
import type { DailyLog } from '../types/log';

/**
 * App data surface.
 *
 * Slice 03 adds daily-log methods for the water-tracking state machine.
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
}
