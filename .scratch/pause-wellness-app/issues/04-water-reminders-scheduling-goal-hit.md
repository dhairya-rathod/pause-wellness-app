# 04 — Water reminders: goal-paced scheduling + goal-hit cancellation

Status: ready-for-agent

## Parent

`.scratch/pause-wellness-app/PRD.md` — Pause (calm zen wellness app)

## What to build

Make water reminders actually fire and stop appropriately:

- **`computeWaterReminderTimes(activeHours, goalGlasses, anchorDate)`** — a pure function producing goal-paced fire times across the active window (interval = activeWindowMinutes / goal, starting at active-hours start; only future times for "today"). Edges: goal already met at start of day, goal = 0, window too short, boundary at active-hours end.
- **Two notification channels** via `expo-notifications`: `eye` and `water`, each with its own soft singing-bowl chime asset and a short low-intensity vibration. (The eye channel is created here but unused until slice 06.)
- **Per-day batch scheduling:** on each app open (and after settings changes), compute fire times for **today + next 2 days**, cancel the water feature's existing notifications, and reschedule. Uses **inexact timing** (no exact-alarm permission).
- A **`scheduled_notifications` table** (feature, triggerTime, notificationId) + repository methods `getScheduledIds(feature)`, `addScheduledId`, `clearScheduledIds(feature)` to support cancel/reschedule.
- **Goal-hit cancellation:** when water count reaches the goal, cancel that day's remaining water notifications and mark hydrated (wired to the state machine from slice 03).
- **Deep link:** a water notification response routes to the WaterLog modal via the navigation linking config.
- A **sound mute** setting (silent/vibration-only) applied to the water channel.

Demoable: enable water, close the app, receive a paced reminder, tap it → WaterLog opens → log glasses until goal → remaining reminders stop → next day's reminders are queued (verify via scheduled-notifications table).

## Acceptance criteria

- [ ] `computeWaterReminderTimes` produces evenly spaced future fire times within active hours; unit tests cover goal-met, goal=0, short window, boundary edge.
- [ ] Water reminders fire (inexact) when the app is closed, on a device.
- [ ] Reaching the daily goal cancels remaining water reminders for today.
- [ ] Tapping a water notification opens the WaterLog modal.
- [ ] On app open, today + next 2 days of water reminders are queued (3-days-ahead).
- [ ] Muting sound silences the water channel's chime (vibration only).
- [ ] A notification→modal routing test confirms a water response routes to WaterLog.

## Blocked by

- `02-onboarding-notification-permission-storage.md`
- `03-water-log-screen-daily-state-machine.md`
