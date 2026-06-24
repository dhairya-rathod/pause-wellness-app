import { isSameDay, minutesToDate, parseMinutes } from './timeHelpers';
import type { ActiveHours } from './waterReminders';

const INTERVAL_MINUTES = 20;

/**
 * 20-20-20 fire times across the active window.
 *
 * Returns one reminder every 20 minutes, starting at the active-hours start
 * and stopping strictly before the active-hours end. Only future times are
 * returned for the anchor's calendar date. The function is **pure** — it
 * takes `now` as a parameter and has no side effects.
 *
 * Edge cases:
 * - Empty or inverted window (start >= end) → `[]`.
 * - Window shorter than one interval → only the start-time fires (if it is
 *   still in the future for today).
 * - First fire time before or at `now` on the anchor's calendar day → skipped.
 */
export function computeEyeBreakTimes(
  activeHours: ActiveHours,
  anchor: Date,
  now: Date = new Date(),
): Date[] {
  const startMin = parseMinutes(activeHours.start);
  const endMin = parseMinutes(activeHours.end);

  if (startMin >= endMin) return [];

  const times: Date[] = [];

  for (let minute = startMin; minute < endMin; minute += INTERVAL_MINUTES) {
    times.push(minutesToDate(minute, anchor));
  }

  // For the anchor's calendar date, keep only times strictly after `now`.
  return times.filter((t) =>
    isSameDay(t, anchor) ? t.getTime() > now.getTime() : true,
  );
}
