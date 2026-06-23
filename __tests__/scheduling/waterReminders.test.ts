/// <reference types="jest" />
import { computeWaterReminderTimes } from '../../src/scheduling/waterReminders';

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

describe('computeWaterReminderTimes', () => {
  // ---- happy path: evenly spaced ---------------------------------------

  it('spreads evenly across the active window', () => {
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '21:00' },
      8,
      dt(2026, 6, 23, 15, 0), // anchor today at 15:00
      dt(2026, 6, 23, 7, 0),  // now = 07:00 (before window)
    );

    expect(times).toHaveLength(8);
    // First fire at 08:00
    expect(times[0]).toEqual(dt(2026, 6, 23, 8, 0));
    // Last fire is strictly before 21:00
    expect(times[7].getTime()).toBeLessThan(dt(2026, 6, 23, 21, 0).getTime());
    // Times are monotonically increasing
    for (let i = 1; i < times.length; i++) {
      expect(times[i].getTime()).toBeGreaterThan(times[i - 1].getTime());
    }
  });

  it('spaces evenly across the window (goal=4, interval divides evenly)', () => {
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '12:00' },
      4,
      dt(2026, 6, 23, 10, 0),
      dt(2026, 6, 23, 7, 0),
    );

    expect(times).toHaveLength(4);
    expect(times[0]).toEqual(dt(2026, 6, 23, 8, 0));
    expect(times[1]).toEqual(dt(2026, 6, 23, 9, 0));
    expect(times[2]).toEqual(dt(2026, 6, 23, 10, 0));
    expect(times[3]).toEqual(dt(2026, 6, 23, 11, 0));
  });

  // ---- edge: goal <= 0 --------------------------------------------------

  it('returns empty when goal is 0', () => {
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '21:00' },
      0,
      dt(2026, 6, 23, 10, 0),
    );
    expect(times).toHaveLength(0);
  });

  it('returns empty when goal is negative', () => {
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '21:00' },
      -1,
      dt(2026, 6, 23, 10, 0),
    );
    expect(times).toHaveLength(0);
  });

  // ---- edge: window too short -------------------------------------------

  it('returns empty when start equals end', () => {
    const times = computeWaterReminderTimes(
      { start: '10:00', end: '10:00' },
      8,
      dt(2026, 6, 23, 10, 0),
    );
    expect(times).toHaveLength(0);
  });

  it('returns empty when start is after end', () => {
    const times = computeWaterReminderTimes(
      { start: '21:00', end: '08:00' },
      8,
      dt(2026, 6, 23, 10, 0),
    );
    expect(times).toHaveLength(0);
  });

  // ---- edge: boundary at active-hours end --------------------------------

  it('never includes a time exactly at end', () => {
    // 4 glasses, 08:00-12:00, interval=60min → times at 08:00,09:00,10:00,11:00
    // None at 12:00.
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '12:00' },
      4,
      dt(2026, 6, 23, 10, 0),
      dt(2026, 6, 23, 7, 0),
    );
    const endMs = dt(2026, 6, 23, 12, 0).getTime();
    for (const t of times) {
      expect(t.getTime()).toBeLessThan(endMs);
    }
  });

  // ---- today vs future-day -----------------------------------------------

  it('for today, only returns times after now', () => {
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '21:00' },
      8,
      dt(2026, 6, 23, 15, 0),
      dt(2026, 6, 23, 12, 0), // now = noon — only afternoon+ times
    );
    // All should be after 12:00
    for (const t of times) {
      expect(t.getTime()).toBeGreaterThan(dt(2026, 6, 23, 12, 0).getTime());
    }
  });

  it('for today, returns empty when now is after the window', () => {
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '12:00' },
      4,
      dt(2026, 6, 23, 15, 0),
      dt(2026, 6, 23, 14, 0), // now is after the window
    );
    expect(times).toHaveLength(0);
  });

  it('for tomorrow, returns all times regardless of now', () => {
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '12:00' },
      4,
      dt(2026, 6, 24, 10, 0), // anchor = tomorrow
      dt(2026, 6, 23, 23, 0), // now = late tonight
    );
    expect(times).toHaveLength(4);
    expect(times[0]).toEqual(dt(2026, 6, 24, 8, 0));
  });

  // ---- contract: returns full set regardless of current count -----------

  it('returns full fire times regardless of current water count', () => {
    // The function is pure time geometry — goal-met is a service concern.
    // Even with a high "count" (simulated by a late now that filters
    // today), tomorrow's full set should still arrive.
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '21:00' },
      8,
      dt(2026, 6, 24, 10, 0), // anchor = tomorrow
      dt(2026, 6, 23, 23, 0),
    );
    expect(times).toHaveLength(8);
  });

  // ---- local-day stability -----------------------------------------------

  it('all times are on the anchor calendar day', () => {
    const times = computeWaterReminderTimes(
      { start: '08:00', end: '22:00' },
      8,
      dt(2026, 6, 23, 10, 0),
      dt(2026, 6, 23, 5, 0),
    );
    for (const t of times) {
      expect(t.getFullYear()).toBe(2026);
      expect(t.getMonth()).toBe(5); // June = 5 (0-indexed)
      expect(t.getDate()).toBe(23);
    }
  });
});
