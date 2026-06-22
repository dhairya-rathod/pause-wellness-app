import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 1;

/**
 * Static DDL for the `settings` singleton table.
 *
 * Safe for `execAsync` because it contains no user-supplied values.
 * Booleans are stored as INTEGER (0/1) and mapped in `SqliteRepository`.
 * The `CHECK (id = 1)` constraint enforces the singleton-row design.
 */
export const CREATE_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  activeHoursStart TEXT NOT NULL,
  activeHoursEnd TEXT NOT NULL,
  waterGoalGlasses INTEGER NOT NULL,
  soundEnabled INTEGER NOT NULL,
  themeMode TEXT NOT NULL,
  eyeEnabled INTEGER NOT NULL,
  waterEnabled INTEGER NOT NULL,
  onboardingComplete INTEGER NOT NULL
);
`;

/**
 * Run schema migrations against `db` using `PRAGMA user_version`.
 *
 * v0 → v1: enable WAL, create the `settings` table.
 * Later slices add further `user_version` branches here.
 */
export async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const user_version = row?.user_version ?? 0;
  if (user_version >= DATABASE_VERSION) return;

  if (user_version === 0) {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);
    await db.execAsync(CREATE_SETTINGS_TABLE);
  }
  // Future: if (user_version === 1) { … }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
