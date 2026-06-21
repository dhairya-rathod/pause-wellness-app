# 07 — Stats: 7-day dot grids + daily rollover

Status: ready-for-agent

## Parent

`.scratch/pause-wellness-app/PRD.md` — Pause (calm zen wellness app)

## What to build

Add low-pressure progress tracking and correct day boundaries:

- The **`rollover(state, today)`** pure function: on app open, compare the stored "current day" to today; if different, archive yesterday's counts into the recent log, reset today's counts to 0, clear hydrated, and recompute scheduling. Keep only the **last 7 days** for the dot grids. **No background rollover** — "today" becomes correct the first time the app is opened after midnight.
- A **`shouldCancelRemainingWater(state)`** predicate used by the scheduling layer.
- The **Stats tab**: today's counts for each feature + soft **7-day dot grids** (filled/empty dots, no numbers, no streaks, no shame) for eye breaks and water glasses, rendered from the recent log.
- Wire rollover into app open so counts are accurate each day.

Demoable: log breaks and water across two simulated days → Stats shows today's counts + a 7-day dot grid reflecting activity → reopen after a day boundary → today resets and yesterday appears in the grid.

## Acceptance criteria

- [ ] Stats shows today's eye-break and water counts plus a 7-day dot grid per feature.
- [ ] Dot grids show filled/empty only — no streak numbers, no targets.
- [ ] `rollover` archives yesterday, resets today, clears hydrated; unit test covers the day-boundary case.
- [ ] Only the last 7 days are retained.
- [ ] Reopening after midnight resets today's counts and surfaces yesterday in the grid.
- [ ] `shouldCancelRemainingWater` returns true once the goal is met.

## Blocked by

- `04-water-reminders-scheduling-goal-hit.md`
- `06-eye-reminders-scheduling-pause.md`
