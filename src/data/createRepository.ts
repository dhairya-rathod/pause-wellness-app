import * as SQLite from 'expo-sqlite';
import type { Repository } from './Repository';
import { migrate } from './sqlite/schema';
import { SqliteRepository } from './sqlite/SqliteRepository';

/**
 * Open (or create) the app database, run migrations, and return a `Repository`
 * backed by expo-sqlite.
 *
 * This is the ONLY place that knows about the concrete `SqliteRepository` —
 * everything downstream consumes the `Repository` interface.
 */
export async function createRepository(): Promise<Repository> {
  const db = await SQLite.openDatabaseAsync('pause.db');
  await migrate(db);
  return new SqliteRepository(db);
}
