import type { SQLiteDatabase } from 'expo-sqlite';
import {
  DEFAULT_SETTINGS,
  type Settings,
  type ThemeMode,
} from '../../types/settings';
import type { Repository } from '../Repository';

/**
 * Shape of a `settings` row as stored in sqlite.
 *
 * Booleans are INTEGER (0/1); all columns are NOT NULL.
 */
type SettingsRow = {
  activeHoursStart: string;
  activeHoursEnd: string;
  waterGoalGlasses: number;
  soundEnabled: number;
  themeMode: string;
  eyeEnabled: number;
  waterEnabled: number;
  onboardingComplete: number;
};

/**
 * Production `Repository` backed by expo-sqlite.
 *
 * Reads and writes a singleton `settings` row keyed `id = 1`.
 * `getSettings` merges the stored row over `DEFAULT_SETTINGS` so new fields
 * added in later slices always receive their defaults (never throws when a
 * column is missing from a future migration).
 */
export class SqliteRepository implements Repository {
  constructor(private db: SQLiteDatabase) {}

  async getSettings(): Promise<Settings> {
    const row = await this.db.getFirstAsync<SettingsRow>(
      'SELECT * FROM settings WHERE id = 1'
    );
    if (!row) return { ...DEFAULT_SETTINGS };

    return {
      ...DEFAULT_SETTINGS,
      activeHoursStart: row.activeHoursStart,
      activeHoursEnd: row.activeHoursEnd,
      waterGoalGlasses: row.waterGoalGlasses,
      soundEnabled: !!row.soundEnabled,
      themeMode: row.themeMode as ThemeMode,
      eyeEnabled: !!row.eyeEnabled,
      waterEnabled: !!row.waterEnabled,
      onboardingComplete: !!row.onboardingComplete,
    };
  }

  async setSettings(settings: Settings): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO settings
        (id, activeHoursStart, activeHoursEnd, waterGoalGlasses, soundEnabled,
         themeMode, eyeEnabled, waterEnabled, onboardingComplete)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      settings.activeHoursStart,
      settings.activeHoursEnd,
      settings.waterGoalGlasses,
      settings.soundEnabled ? 1 : 0,
      settings.themeMode,
      settings.eyeEnabled ? 1 : 0,
      settings.waterEnabled ? 1 : 0,
      settings.onboardingComplete ? 1 : 0
    );
  }
}
