import { DEFAULT_SETTINGS, type Settings } from '../types/settings';
import { emptyLog, type DailyLog } from '../types/log';
import type { Feature } from '../types/feature';
import type { Repository, ScheduledNotificationRecord } from './Repository';

/**
 * In-memory implementation of {@link Repository} — used by contract tests and as
 * the default repository in unit tests.
 *
 * Holds a single {@link Settings} field initialised to {@link DEFAULT_SETTINGS}
 * and a {@link Map} of {@link DailyLog} keyed by date. An optional constructor
 * override lets tests seed specific fields (e.g. `onboardingComplete: true`)
 * without a setSettings call.
 */
export class InMemoryRepository implements Repository {
  private settings: Settings;
  private logs = new Map<string, DailyLog>();
  private scheduled = new Map<Feature, ScheduledNotificationRecord[]>();

  constructor(initial?: Partial<Settings>) {
    this.settings = { ...DEFAULT_SETTINGS, ...initial };
  }

  // ---- settings ---------------------------------------------------------

  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }

  async setSettings(settings: Settings): Promise<void> {
    this.settings = { ...settings };
  }

  // ---- daily log --------------------------------------------------------

  async getLog(date: string): Promise<DailyLog> {
    return this.logs.get(date) ?? emptyLog(date);
  }

  async getRecentLogs(days: number): Promise<DailyLog[]> {
    return [...this.logs.values()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days);
  }

  async upsertLog(log: DailyLog): Promise<void> {
    this.logs.set(log.date, { ...log });
  }

  // ---- scheduled notifications ------------------------------------------

  async getScheduledIds(
    feature: Feature,
  ): Promise<ScheduledNotificationRecord[]> {
    const entries = this.scheduled.get(feature) ?? [];
    return entries.map((e) => ({ ...e }));
  }

  async addScheduledId(
    feature: Feature,
    triggerTime: string,
    notificationId: string,
  ): Promise<void> {
    const entries = this.scheduled.get(feature) ?? [];
    entries.push({ feature, triggerTime, notificationId });
    this.scheduled.set(feature, entries);
  }

  async clearScheduledIds(feature: Feature): Promise<void> {
    this.scheduled.set(feature, []);
  }
}
