import type { DailyLog } from '../types/log';

/**
 * In-memory state for a single day plus the recent history kept for the
 * 7-day dot grids. The reducer operates on this shape and is pure — no side
 * effects, no repository calls.
 */
export type DailyState = {
  date: string;
  waterGlasses: number;
  eyeBreaks: number;
  goal: number;
  hydrated: boolean;
  recent: DailyLog[];
};

export type DailyAction =
  | { type: 'LogGlass' }
  | { type: 'UndoGlass' }
  | { type: 'CompleteBreak' }
  | { type: 'Rollover'; date: string }
  | { type: 'UpdateRecent'; recent: DailyLog[] }
  | { type: 'UpdateSettings'; goal: number };

/**
 * Compute whether the hydrated condition is met for the given count and goal.
 * Extracted so the reducer and the initial-state factory share the same logic.
 */
function computeHydrated(waterGlasses: number, goal: number): boolean {
  return waterGlasses >= goal;
}

/**
 * Replace (or insert) the `state.date` row inside `recent` so the 7-day dot
 * grids reflect today's live counts without a repository round-trip.
 *
 * `recent` is stored newest-first; the inserted/replaced row keeps that order.
 * Capped at 7 entries to match the cap rollover enforces.
 */
function syncTodayInRecent(state: DailyState): DailyLog[] {
  const today: DailyLog = {
    date: state.date,
    eyeBreaks: state.eyeBreaks,
    waterGlasses: state.waterGlasses,
  };
  const without = state.recent.filter((log) => log.date !== state.date);
  return [today, ...without]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
}

/**
 * Roll the state over to a new calendar day.
 *
 * Pure function: if the stored day matches `today`, nothing changes. Otherwise,
 * archive the old day's counts into `recent`, reset today's counts to 0, clear
 * `hydrated`, and trim `recent` to the most recent 7 days.
 *
 * This is the highest-value seam to unit-test: the provider handles the
 * side-effects (persist the new zero row, refresh recent from the repository,
 * reschedule water notifications).
 */
export function rollover(state: DailyState, today: string): DailyState {
  if (state.date === today) return state;

  const archived: DailyLog = {
    date: state.date,
    eyeBreaks: state.eyeBreaks,
    waterGlasses: state.waterGlasses,
  };

  const merged = new Map<string, DailyLog>(state.recent.map((log) => [log.date, log]));
  merged.set(archived.date, archived);

  const recent = [...merged.values()]
    .filter((log) => log.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return {
    ...state,
    date: today,
    waterGlasses: 0,
    eyeBreaks: 0,
    hydrated: computeHydrated(0, state.goal),
    recent,
  };
}

/**
 * True once today's water goal has been met and should stop remaining reminders.
 *
 * A goal of 0 never cancels reminders (avoids a degenerate "always true" case).
 */
export function shouldCancelRemainingWater(state: Pick<DailyState, 'hydrated' | 'goal'>): boolean {
  return state.goal > 0 && state.hydrated;
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
      const next = { ...state, waterGlasses, hydrated: computeHydrated(waterGlasses, state.goal) };
      return { ...next, recent: syncTodayInRecent(next) };
    }
    case 'UndoGlass': {
      const waterGlasses = Math.max(0, state.waterGlasses - 1);
      const next = { ...state, waterGlasses, hydrated: computeHydrated(waterGlasses, state.goal) };
      return { ...next, recent: syncTodayInRecent(next) };
    }
    case 'CompleteBreak': {
      const next = { ...state, eyeBreaks: state.eyeBreaks + 1 };
      return { ...next, recent: syncTodayInRecent(next) };
    }
    case 'Rollover':
      return rollover(state, action.date);
    case 'UpdateRecent':
      return { ...state, recent: action.recent };
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
export function initialStateFromLog(log: DailyLog, goal: number, recent: DailyLog[] = []): DailyState {
  return {
    date: log.date,
    waterGlasses: log.waterGlasses,
    eyeBreaks: log.eyeBreaks,
    goal,
    hydrated: computeHydrated(log.waterGlasses, goal),
    recent,
  };
}
