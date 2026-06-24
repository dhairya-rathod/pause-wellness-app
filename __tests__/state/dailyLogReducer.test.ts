/// <reference types="jest" />
import {
  dailyReducer,
  rollover,
  shouldCancelRemainingWater,
} from '../../src/state/dailyLogReducer';
import type { DailyState } from '../../src/state/dailyLogReducer';

function makeState(overrides: Partial<DailyState> = {}): DailyState {
  return {
    date: '2026-06-23',
    waterGlasses: 0,
    eyeBreaks: 0,
    goal: 8,
    hydrated: false,
    recent: [],
    ...overrides,
  };
}

describe('dailyReducer', () => {
  // ---- LogGlass ---------------------------------------------------------

  it('LogGlass increments waterGlasses by 1', () => {
    const s = dailyReducer(makeState(), { type: 'LogGlass' });
    expect(s.waterGlasses).toBe(1);
  });

  it('LogGlass does not affect eyeBreaks', () => {
    const s = dailyReducer(makeState(), { type: 'LogGlass' });
    expect(s.eyeBreaks).toBe(0);
  });

  it('LogGlass sets hydrated when count reaches goal', () => {
    const s = dailyReducer(makeState({ waterGlasses: 7, goal: 8 }), {
      type: 'LogGlass',
    });
    expect(s.waterGlasses).toBe(8);
    expect(s.hydrated).toBe(true);
  });

  it('LogGlass keeps hydrated true when already above goal', () => {
    const s = dailyReducer(makeState({ waterGlasses: 10, goal: 8, hydrated: true }), {
      type: 'LogGlass',
    });
    expect(s.waterGlasses).toBe(11);
    expect(s.hydrated).toBe(true);
  });

  // ---- UndoGlass --------------------------------------------------------

  it('UndoGlass decrements waterGlasses by 1', () => {
    const s = dailyReducer(makeState({ waterGlasses: 5 }), { type: 'UndoGlass' });
    expect(s.waterGlasses).toBe(4);
  });

  it('UndoGlass does not go below 0', () => {
    const s = dailyReducer(makeState({ waterGlasses: 0 }), { type: 'UndoGlass' });
    expect(s.waterGlasses).toBe(0);
  });

  it('UndoGlass clears hydrated when dropping below goal', () => {
    const s = dailyReducer(
      makeState({ waterGlasses: 8, goal: 8, hydrated: true }),
      { type: 'UndoGlass' }
    );
    expect(s.waterGlasses).toBe(7);
    expect(s.hydrated).toBe(false);
  });

  // ---- CompleteBreak -----------------------------------------------------

  it('CompleteBreak increments eyeBreaks by 1', () => {
    const s = dailyReducer(makeState(), { type: 'CompleteBreak' });
    expect(s.eyeBreaks).toBe(1);
  });

  it('CompleteBreak does not affect waterGlasses or hydrated', () => {
    const s = dailyReducer(
      makeState({ waterGlasses: 5 }),
      { type: 'CompleteBreak' }
    );
    expect(s.waterGlasses).toBe(5);
    expect(s.hydrated).toBe(false);
  });

  // ---- Rollover ---------------------------------------------------------

  it('Rollover resets waterGlasses and eyeBreaks to 0 with a new date', () => {
    const s = dailyReducer(
      makeState({ waterGlasses: 6, eyeBreaks: 3 }),
      { type: 'Rollover', date: '2026-06-24' }
    );
    expect(s.date).toBe('2026-06-24');
    expect(s.waterGlasses).toBe(0);
    expect(s.eyeBreaks).toBe(0);
  });

  it('Rollover makes hydrated false when goal > 0', () => {
    const s = dailyReducer(
      makeState({ waterGlasses: 8, goal: 8, hydrated: true }),
      { type: 'Rollover', date: '2026-06-24' }
    );
    expect(s.hydrated).toBe(false);
  });

  // ---- rollover (pure day-boundary helper) ------------------------------

  describe('rollover', () => {
    it('returns the same state when the date has not changed', () => {
      const before = makeState({ date: '2026-06-23' });
      const after = rollover(before, '2026-06-23');
      expect(after).toBe(before);
    });

    it('archives the old day and resets today', () => {
      const before = makeState({
        date: '2026-06-23',
        waterGlasses: 5,
        eyeBreaks: 3,
        hydrated: true,
      });
      const after = rollover(before, '2026-06-24');

      expect(after.date).toBe('2026-06-24');
      expect(after.waterGlasses).toBe(0);
      expect(after.eyeBreaks).toBe(0);
      expect(after.hydrated).toBe(false);
      expect(after.recent).toContainEqual({
        date: '2026-06-23',
        waterGlasses: 5,
        eyeBreaks: 3,
      });
    });

    it('keeps only the last 7 days', () => {
      const recent = Array.from({ length: 8 }, (_, i) => ({
        date: `2026-06-${15 + i}`,
        eyeBreaks: 1,
        waterGlasses: 1,
      }));
      const before = makeState({ date: '2026-06-23', recent });
      const after = rollover(before, '2026-06-24');

      expect(after.recent).toHaveLength(7);
      const dates = after.recent.map((log) => log.date);
      expect(dates).not.toContain('2026-06-15'); // oldest dropped
      expect(dates).toContain('2026-06-23'); // newly archived
    });

    it('replaces an existing entry for the old day instead of duplicating', () => {
      const before = makeState({
        date: '2026-06-23',
        waterGlasses: 5,
        eyeBreaks: 3,
        recent: [{ date: '2026-06-23', waterGlasses: 1, eyeBreaks: 1 }],
      });
      const after = rollover(before, '2026-06-24');

      expect(after.recent).toHaveLength(1);
      expect(after.recent[0]).toEqual({
        date: '2026-06-23',
        waterGlasses: 5,
        eyeBreaks: 3,
      });
    });

    it('drops future-dated rows from recent (stale guard)', () => {
      const before = makeState({
        date: '2026-06-23',
        recent: [{ date: '2026-06-25', waterGlasses: 1, eyeBreaks: 1 }],
      });
      const after = rollover(before, '2026-06-24');

      expect(after.recent.map((log) => log.date)).not.toContain('2026-06-25');
    });
  });

  // ---- shouldCancelRemainingWater ---------------------------------------

  describe('shouldCancelRemainingWater', () => {
    it('returns true when hydrated and goal > 0', () => {
      expect(shouldCancelRemainingWater({ hydrated: true, goal: 8 })).toBe(true);
    });

    it('returns false when hydrated but goal is 0', () => {
      expect(shouldCancelRemainingWater({ hydrated: true, goal: 0 })).toBe(false);
    });

    it('returns false when not hydrated', () => {
      expect(shouldCancelRemainingWater({ hydrated: false, goal: 8 })).toBe(false);
    });
  });

  // ---- UpdateSettings ---------------------------------------------------

  it('UpdateSettings changes the goal', () => {
    const s = dailyReducer(makeState({ goal: 8 }), {
      type: 'UpdateSettings',
      goal: 6,
    });
    expect(s.goal).toBe(6);
  });

  it('UpdateSettings recomputes hydrated when the new goal is already met', () => {
    const s = dailyReducer(makeState({ waterGlasses: 6, goal: 8, hydrated: false }), {
      type: 'UpdateSettings',
      goal: 5,
    });
    expect(s.hydrated).toBe(true);
  });

  it('UpdateSettings clears hydrated when the goal raises above current count', () => {
    const s = dailyReducer(makeState({ waterGlasses: 6, goal: 6, hydrated: true }), {
      type: 'UpdateSettings',
      goal: 8,
    });
    expect(s.hydrated).toBe(false);
  });
});
