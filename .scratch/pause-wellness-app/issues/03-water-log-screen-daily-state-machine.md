# 03 — Water log screen + daily state machine

Status: ready-for-agent

## Parent

`.scratch/pause-wellness-app/PRD.md` — Pause (calm zen wellness app)

## What to build

Build the water-logging experience and the state machine that drives it — without scheduling yet (reminders come in slice 04):

- A **daily state machine** (pure reducer) over `(state, action)`. Actions: `LogGlass`, `UndoGlass`, `Rollover`, `UpdateSettings`. The reducer computes `hydrated` (waterGlasses >= goal). UI subscribes via a lightweight store (Zustand or Context); persistence side-effects flow through the `Repository`.
- The **`daily_log` table** (date PK, eyeBreaks, waterGlasses) and repository methods `getLog(date)`, `getRecentLogs(days)`, `upsertLog` added to the interface + sqlite impl + in-memory fake.
- The **WaterLog modal**: shows today's count vs goal, a primary one-tap "log a glass" action (+1), an undo, and a gentle **hydrated state** when count >= goal. Logging persists to storage.
- A way to open the WaterLog modal from Home (the button from slice 01 now opens the real screen).

Demoable: tap "log water" on Home → see count increment toward goal → reach goal → hydrated state appears → undo decrements → relaunch and the count persists.

## Acceptance criteria

- [ ] Tapping "log a glass" increments today's water count by 1 and persists.
- [ ] Undo decrements by 1 (not below 0).
- [ ] Reaching the goal shows a gentle hydrated state; dropping below via undo clears it.
- [ ] Today's count persists across app restarts.
- [ ] The daily state machine is a pure reducer with no side effects; `Rollover` archives yesterday and resets today.
- [ ] A reducer unit test covers `LogGlass`, `UndoGlass`, `Rollover`, and the hydrated transition.
- [ ] An RNTL test covers log → increment → persist, undo → decrement, and goal → hydrated state.

## Blocked by

- `02-onboarding-notification-permission-storage.md`
