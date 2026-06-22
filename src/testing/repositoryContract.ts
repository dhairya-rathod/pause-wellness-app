import { DEFAULT_SETTINGS } from '../types/settings';
import type { Repository } from '../data/Repository';

/**
 * Shared contract test factory — runs the standard settings round-trip
 * assertions against any {@link Repository} implementation.
 *
 * The same factory is used for the in-memory fake (this slice) and, later,
 * a sqlite-backed implementation. Assertions are on read-after-write VALUES
 * only (per project test philosophy).
 */
export function runRepositoryContract(
  name: string,
  makeRepo: () => Repository | Promise<Repository>
) {
  describe(`${name} Repository contract`, () => {
    it('returns DEFAULT_SETTINGS when empty', async () => {
      const repo = await makeRepo();
      const settings = await repo.getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('persists a full settings round-trip', async () => {
      const repo = await makeRepo();
      const next = {
        ...DEFAULT_SETTINGS,
        waterGoalGlasses: 10,
        soundEnabled: false,
        themeMode: 'dark' as const,
        onboardingComplete: true,
      };
      await repo.setSettings(next);
      expect(await repo.getSettings()).toEqual(next);
    });

    it('persists onboardingComplete across reads', async () => {
      const repo = await makeRepo();
      await repo.setSettings({
        ...DEFAULT_SETTINGS,
        onboardingComplete: true,
      });
      expect((await repo.getSettings()).onboardingComplete).toBe(true);

      // Toggle off to make sure it's not sticky
      await repo.setSettings({
        ...DEFAULT_SETTINGS,
        onboardingComplete: false,
      });
      expect((await repo.getSettings()).onboardingComplete).toBe(false);
    });
  });
}
