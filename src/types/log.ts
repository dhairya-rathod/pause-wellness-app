/**
 * Daily activity log — one row per calendar date.
 *
 * Slice 03 introduces waterGlasses; eyeBreaks is wired in slice 05.
 * All dates are stored as "YYYY-MM-DD" in the user's local timezone.
 */
export type DailyLog = {
  date: string;
  eyeBreaks: number;
  waterGlasses: number;
};

/** Returns a zeroed {@link DailyLog} for the given date key. */
export function emptyLog(date: string): DailyLog {
  return { date, eyeBreaks: 0, waterGlasses: 0 };
}

/**
 * Format a `Date` as a local "YYYY-MM-DD" key.
 *
 * Uses `getFullYear` / `getMonth` / `getDate` so the key always matches the
 * user's wall-clock day (no UTC rollover surprises).
 */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Convenience alias for {@link dateKey}(new Date()). */
export function todayKey(): string {
  return dateKey(new Date());
}

/**
 * Parse a local "YYYY-MM-DD" key back into a Date at midnight local time.
 *
 * Inverse of {@link dateKey}; used for date arithmetic like generating the
 * previous N calendar days for the 7-day dot grids.
 */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Return the `count` most recent calendar dates ending at `endKey`, inclusive.
 *
 * Result is ordered oldest → newest so it renders left-to-right as a timeline.
 */
export function previousDays(endKey: string, count: number): string[] {
  const end = parseDateKey(endKey);
  const days: string[] = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const d = new Date(end);
    d.setDate(d.getDate() - offset);
    days.push(dateKey(d));
  }
  return days;
}
