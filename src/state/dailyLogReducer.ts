import type { DailyLog } from '../types/log';

/**
 * In-memory state for a single day. The reducer operates on this shape
 * and is pure — no side effects, no repository calls.
 */
export type DailyState = {
  date: string;
  waterGlasses: number;
  eyeBreaks: number;
  goal: number;
  hydrated: boolean;
};

export type DailyAction =
  | { type: 'LogGlass' }
  | { type: 'UndoGlass' }
  | { type: 'Rollover'; date: string }
  | { type: 'UpdateSettings'; goal: number };

/**
 * Compute whether the hydrated condition is met for the given count and goal.
 * Extracted so the reducer and the initial-state factory share the same logic.
 */
function computeHydrated(waterGlasses: number, goal: number): boolean {
  return waterGlasses >= goal;
}

/**
 * Pure reducer over {@link DailyState} and {@link DailyAction}.
 *
 * Persistence and side-effects live in the store (`DailyLogProvider`);
 * this function only computes the next state.
 */
export function dailyReducer(state: DailyState, action: DailyAction): DailyState {
  switch (action.type) {
    case 'LogGlass': {
      const waterGlasses = state.waterGlasses + 1;
      return { ...state, waterGlasses, hydrated: computeHydrated(waterGlasses, state.goal) };
    }
    case 'UndoGlass': {
      const waterGlasses = Math.max(0, state.waterGlasses - 1);
      return { ...state, waterGlasses, hydrated: computeHydrated(waterGlasses, state.goal) };
    }
    case 'Rollover':
      return {
        ...state,
        date: action.date,
        waterGlasses: 0,
        eyeBreaks: 0,
        hydrated: computeHydrated(0, state.goal),
      };
    case 'UpdateSettings':
      return {
        ...state,
        goal: action.goal,
        hydrated: computeHydrated(state.waterGlasses, action.goal),
      };
  }
}

/**
 * Build an initial {@link DailyState} from a loaded log and goal.
 * Kept separate from the reducer so async store-load doesn't need a Load action.
 */
export function initialStateFromLog(log: DailyLog, goal: number): DailyState {
  return {
    date: log.date,
    waterGlasses: log.waterGlasses,
    eyeBreaks: log.eyeBreaks,
    goal,
    hydrated: computeHydrated(log.waterGlasses, goal),
  };
}
