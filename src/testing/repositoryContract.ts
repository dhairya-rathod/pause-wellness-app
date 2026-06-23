import { DEFAULT_SETTINGS } from '../types/settings';
import type { Repository } from '../data/Repository';

/**
 * Shared contract test factory — runs the standard settings + daily-log
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
    // ---- settings (slice 02) --------------------------------------------

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

    // ---- daily log (slice 03) -------------------------------------------

    it('returns an empty log for a date that has not been stored', async () => {
      const repo = await makeRepo();
      const log = await repo.getLog('2026-06-23');
      expect(log).toEqual({
        date: '2026-06-23',
        eyeBreaks: 0,
        waterGlasses: 0,
      });
    });

    it('round-trips a daily log via upsert + get', async () => {
      const repo = await makeRepo();
      await repo.upsertLog({
        date: '2026-06-23',
        eyeBreaks: 2,
        waterGlasses: 5,
      });
      const log = await repo.getLog('2026-06-23');
      expect(log).toEqual({
        date: '2026-06-23',
        eyeBreaks: 2,
        waterGlasses: 5,
      });
    });

    it('upsert replaces an existing log for the same date', async () => {
      const repo = await makeRepo();
      await repo.upsertLog({
        date: '2026-06-23',
        eyeBreaks: 0,
        waterGlasses: 3,
      });
      await repo.upsertLog({
        date: '2026-06-23',
        eyeBreaks: 0,
        waterGlasses: 4,
      });
      const log = await repo.getLog('2026-06-23');
      expect(log.waterGlasses).toBe(4);
      expect(log.eyeBreaks).toBe(0);
    });

    it('getRecentLogs returns at most N most-recent logs', async () => {
      const repo = await makeRepo();
      await repo.upsertLog({ date: '2026-06-21', eyeBreaks: 0, waterGlasses: 1 });
      await repo.upsertLog({ date: '2026-06-22', eyeBreaks: 0, waterGlasses: 2 });
      await repo.upsertLog({ date: '2026-06-23', eyeBreaks: 0, waterGlasses: 3 });

      const recent = await repo.getRecentLogs(2);
      expect(recent).toHaveLength(2);
      // Most-recent first
      expect(recent[0].date).toBe('2026-06-23');
      expect(recent[1].date).toBe('2026-06-22');
    });
  });
}
