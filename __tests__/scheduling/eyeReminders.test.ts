/// <reference types="jest" />
import { computeEyeBreakTimes } from '../../src/scheduling/eyeReminders';

/**
 * Compute a `Date` in the test's local timezone. All tests use local
 * constructors — no UTC, no drift.
 */
function dt(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
): Date {
  return new Date(year, month - 1, day, hour, minute);
}

describe('computeEyeBreakTimes', () => {
  // ---- happy path: every 20 minutes ------------------------------------

  it('spawns reminders every 20 minutes across the active window', () => {
    const times = computeEyeBreakTimes(
      { start: '08:00', end: '10:00' },
      dt(2026, 6, 23, 9, 0), // anchor today at 09:00
      dt(2026, 6, 23, 7, 0), // now = 07:00 (before window)
    );

    expect(times).toHaveLength(6);
    expect(times[0]).toEqual(dt(2026, 6, 23, 8, 0));
    expect(times[1]).toEqual(dt(2026, 6, 23, 8, 20));
    expect(times[2]).toEqual(dt(2026, 6, 23, 8, 40));
    expect(times[3]).toEqual(dt(2026, 6, 23, 9, 0));
    expect(times[4]).toEqual(dt(2026, 6, 23, 9, 20));
    expect(times[5]).toEqual(dt(2026, 6, 23, 9, 40));
  });

  it('returns times strictly before the active-hours end', () => {
    // 08:00-09:00 → times at :00, :20, :40 (the next step 10:00 is excluded).
    const times = computeEyeBreakTimes(
      { start: '08:00', end: '09:00' },
      dt(2026, 6, 23, 8, 0),
      dt(2026, 6, 23, 7, 0),
    );

    const endMs = dt(2026, 6, 23, 9, 0).getTime();
    for (const t of times) {
      expect(t.getTime()).toBeLessThan(endMs);
    }
  });

  // ---- edge: window too short ------------------------------------------

  it('returns empty when start equals end', () => {
    const times = computeEyeBreakTimes(
      { start: '10:00', end: '10:00' },
      dt(2026, 6, 23, 10, 0),
    );
    expect(times).toHaveLength(0);
  });

  it('returns empty when start is after end', () => {
    const times = computeEyeBreakTimes(
      { start: '21:00', end: '08:00' },
      dt(2026, 6, 23, 10, 0),
    );
    expect(times).toHaveLength(0);
  });

  it('fires only the start time when the window is shorter than one interval', () => {
    // 08:00-08:10 is shorter than 20 min, so only 08:00 fires.
    const times = computeEyeBreakTimes(
      { start: '08:00', end: '08:10' },
      dt(2026, 6, 23, 7, 0),
      dt(2026, 6, 23, 7, 0),
    );

    expect(times).toHaveLength(1);
    expect(times[0]).toEqual(dt(2026, 6, 23, 8, 0));
  });

  // ---- today vs future-day ---------------------------------------------

  it('for today, only returns times after now', () => {
    const times = computeEyeBreakTimes(
      { start: '08:00', end: '10:00' },
      dt(2026, 6, 23, 9, 0), // anchor today
      dt(2026, 6, 23, 8, 30), // now = 08:30
    );

    // 08:00 and 08:20 should be filtered out.
    expect(times).toHaveLength(4);
    expect(times[0]).toEqual(dt(2026, 6, 23, 8, 40));
  });

  it('for today, returns empty when now is after the window', () => {
    const times = computeEyeBreakTimes(
      { start: '08:00', end: '10:00' },
      dt(2026, 6, 23, 12, 0),
      dt(2026, 6, 23, 11, 0), // now is after the window
    );
    expect(times).toHaveLength(0);
  });

  it('for tomorrow, returns all times regardless of now', () => {
    const times = computeEyeBreakTimes(
      { start: '08:00', end: '09:00' },
      dt(2026, 6, 24, 8, 0), // anchor = tomorrow
      dt(2026, 6, 23, 23, 0), // now = late tonight
    );

    expect(times).toHaveLength(3);
    expect(times[0]).toEqual(dt(2026, 6, 24, 8, 0));
    expect(times[2]).toEqual(dt(2026, 6, 24, 8, 40));
  });

  // ---- local-day stability ----------------------------------------------

  it('all times are on the anchor calendar day', () => {
    const times = computeEyeBreakTimes(
      { start: '08:00', end: '10:00' },
      dt(2026, 6, 23, 9, 0),
      dt(2026, 6, 23, 7, 0),
    );
    for (const t of times) {
      expect(t.getFullYear()).toBe(2026);
      expect(t.getMonth()).toBe(5); // June = 5 (0-indexed)
      expect(t.getDate()).toBe(23);
    }
  });
});
