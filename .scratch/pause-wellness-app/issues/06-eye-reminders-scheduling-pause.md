# 06 — Eye reminders: 20-min scheduling + pause

Status: ready-for-agent

## Parent

`.scratch/pause-wellness-app/PRD.md` — Pause (calm zen wellness app)

## What to build

Make 20-20-20 reminders fire and add the pause toggle:

- **`computeEyeBreakTimes(activeHours, anchorDate)`** — a pure function producing 20-minute fire times within active hours, starting at active-hours start; only future times for "today". Edges: window shorter than one interval, first fire after "now", boundary at active-hours end.
- **Per-day batch scheduling** (reuse the mechanism from slice 04): on app open and after settings changes, compute fire times for today + next 2 days, cancel the eye feature's existing notifications, reschedule. Uses the `eye` channel created in slice 04.
- **Per-feature pause toggle** on Home: pausing cancels the eye feature's scheduled notifications; resuming reschedules. Independent from the eye enabled/disabled setting.
- **Deep link:** an eye notification response routes to the EyeRest modal via the navigation linking config.

Demoable: enable eye, close the app, receive a 20-min reminder, tap it → EyeRest opens → complete → break logged. Pause the toggle → no reminders fire → resume → reminders resume.

## Acceptance criteria

- [ ] `computeEyeBreakTimes` produces 20-min-spaced future fire times within active hours; unit tests cover short window, first-fire-after-now, boundary edge.
- [ ] Eye reminders fire (inexact) when the app is closed, on a device.
- [ ] Tapping an eye notification opens the EyeRest modal.
- [ ] On app open, today + next 2 days of eye reminders are queued (3-days-ahead).
- [ ] The pause toggle on Home cancels eye reminders when paused and reschedules when resumed.
- [ ] A notification→modal routing test confirms an eye response routes to EyeRest.

## Blocked by

- `04-water-reminders-scheduling-goal-hit.md` (reuses its scheduling mechanism, channels, and scheduled_notifications table)
- `05-eye-rest-screen-break-logging.md` (the modal it deep-links to)
