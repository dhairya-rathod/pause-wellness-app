/// <reference types="jest" />
import { dailyReducer } from '../../src/state/dailyLogReducer';
import type { DailyState } from '../../src/state/dailyLogReducer';

function makeState(overrides: Partial<DailyState> = {}): DailyState {
  return {
    date: '2026-06-23',
    waterGlasses: 0,
    eyeBreaks: 0,
    goal: 8,
    hydrated: false,
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
