# 05 — Eye-rest screen + break logging

Status: ready-for-agent

## Parent

`.scratch/pause-wellness-app/PRD.md` — Pause (calm zen wellness app)

## What to build

Build the guided 20-second eye-rest experience and wire break logging into the daily state machine — without scheduling yet (reminders come in slice 06):

- The **EyeRest modal**: a 20-second countdown driven by a timer, a slow **breathing animation** (~5s in / 5s out, ~2 cycles), an animated **countdown ring** (SVG arc), and a soft "look 20 ft away · breathe" prompt on a calm gradient.
- **Completion rule:** completing the full 20 seconds fires `onBreakComplete`, which dispatches a `CompleteBreak` action (logs one break, persists via the `daily_log` table's eyeBreaks column) and dismisses the screen.
- **Early dismissal** (back/gesture) logs nothing and dismisses.
- A way to open the EyeRest modal from Home (the button from slice 01 now opens the real screen).

Demoable: tap "take a break" on Home → see breathing animation + countdown ring → let it run to 0 → today's break count increments and persists → take another and dismiss early → count does not increment.

## Acceptance criteria

- [ ] Opening the eye-rest screen starts a 20-second countdown with a breathing animation and countdown ring.
- [ ] Reaching 0 fires `onBreakComplete`, logs one break, persists, and dismisses.
- [ ] Dismissing before 0 logs nothing.
- [ ] Today's break count persists across app restarts.
- [ ] The screen stays calm (no jarring transitions) and respects the theme.
- [ ] An RNTL test covers: countdown to 0 → break logged; early dismiss → not logged.

## Blocked by

- `03-water-log-screen-daily-state-machine.md` (shares the daily state machine + daily_log table)
