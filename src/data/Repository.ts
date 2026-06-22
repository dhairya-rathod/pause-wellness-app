import type { Settings } from '../types/settings';

/**
 * App data surface.
 *
 * v1 exposes only settings; later slices add log and scheduled-notification
 * methods. Both SqliteRepository and InMemoryRepository satisfy this contract.
 * App code consumes THIS interface — never a concrete impl directly.
 */
export interface Repository {
  getSettings(): Promise<Settings>;
  setSettings(settings: Settings): Promise<void>;
}
