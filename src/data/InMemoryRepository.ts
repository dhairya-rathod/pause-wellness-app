import { DEFAULT_SETTINGS, type Settings } from '../types/settings';
import type { Repository } from './Repository';

/**
 * In-memory implementation of {@link Repository} — used by contract tests and as
 * the default repository in unit tests.
 *
 * Holds a single {@link Settings} field initialised to {@link DEFAULT_SETTINGS}.
 * An optional constructor override lets tests seed specific fields (e.g.
 * `onboardingComplete: true`) without a setSettings call.
 */
export class InMemoryRepository implements Repository {
  private settings: Settings;

  constructor(initial?: Partial<Settings>) {
    this.settings = { ...DEFAULT_SETTINGS, ...initial };
  }

  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }

  async setSettings(settings: Settings): Promise<void> {
    this.settings = { ...settings };
  }
}
