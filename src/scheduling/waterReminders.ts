import { isSameDay, minutesToDate, parseMinutes } from './timeHelpers';

export type ActiveHours = {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
};

/**
 * Goal-paced fire times across the active window.
 *
 * Spreads `goalGlasses` reminders evenly between active-hours start and end
 * (interval = activeWindowMinutes / goal). Only future times are returned
 * for the anchor's calendar date. The function is **pure** — it takes
 * `now` as a parameter and has no side effects.
 *
 * Edge cases (all return `[]`):
 * - `goalGlasses <= 0`
 * - active window is empty or inverted (start >= end)
 */
export function computeWaterReminderTimes(
  activeHours: ActiveHours,
  goalGlasses: number,
  anchor: Date,
  now: Date = new Date(),
): Date[] {
  if (goalGlasses <= 0) return [];

  const startMin = parseMinutes(activeHours.start);
  const endMin = parseMinutes(activeHours.end);
  const windowMinutes = endMin - startMin;

  if (windowMinutes <= 0) return [];

  const times: Date[] = [];
  const interval = windowMinutes / goalGlasses;

  for (let i = 0; i < goalGlasses; i++) {
    const minute = startMin + i * interval;
    // Drop any time that lands exactly on or after `end` (strictly < end).
    if (minute >= endMin) continue;
    times.push(minutesToDate(minute, anchor));
  }

  // For the anchor's calendar date, keep only times strictly after `now`.
  return times.filter((t) => isSameDay(t, anchor) ? t.getTime() > now.getTime() : true);
}
