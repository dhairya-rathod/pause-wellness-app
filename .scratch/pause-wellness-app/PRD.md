# PRD — Pause (calm zen wellness app)

Status: ready-for-agent

## Problem Statement

People who spend long stretches at screens forget to rest their eyes and forget to drink water. Existing reminder apps solve this with loud notifications, streak counters, daily targets, and guilt-driven gamification — none of which feel restful. A user who wants gentle, zen-like nudges toward two simple wellness habits (the 20-20-20 eye rule and steady hydration) has no app that matches that mood: calm visuals, soft sound, no pressure, no shame.

## Solution

**Pause** is a calm, zen-themed Android wellness app that, in v1, supports exactly two reminder habits:

1. **20-20-20 eye reminder** — every 20 minutes during configurable active hours, a soft chime nudges the user to rest their eyes. Tapping it opens a guided 20-second eye-rest screen with a slow breathing animation, a countdown ring, and a gentle "look 20 ft away · breathe" prompt. Completing the full 20 seconds logs one break.
2. **Hydration reminder** — water reminders are goal-paced across the same active hours toward a configurable daily goal (default 8 glasses). Tapping one opens a quick water-log screen where a single tap logs a glass. When the daily goal is reached, remaining water reminders stop and a gentle "hydrated" state shows.

The app uses a soft sage-and-warm-sand palette (with dark mode), clean Inter typography, a soft singing-bowl chime, and low-pressure progress (today's count + a 7-day dot grid — no streaks, no targets). It is built with React Native + TypeScript on Expo, Android-first.

## User Stories

### Onboarding & first launch

1. As a new user, I want a brief, calm onboarding, so that I understand what the app does before it starts reminding me.
2. As a new user, I want to be asked for notification permission at the end of onboarding, so that reminders can actually reach me.
3. As a new user, I want to land on the home screen after onboarding, so that I can start using the app immediately.
4. As a returning user who already finished onboarding, I want to skip it on later launches, so that I go straight to home.

### 20-20-20 eye reminder

5. As a screen worker, I want a 20-20-20 reminder every 20 minutes during my active hours, so that I rest my eyes regularly.
6. As a user, I want reminders to stay quiet outside my active hours, so that I'm not bothered at night.
7. As a user, I want to configure my active hours, so that reminders match my schedule.
8. As a user, I want to pause the 20-20-20 reminders temporarily, so that I'm not interrupted when I choose not to be.
9. As a user, I want to resume paused reminders, so that they start again when I'm ready.
10. As a user, when a 20-20-20 reminder fires, I want to tap it and open a guided 20-second eye-rest screen, so that I'm guided through the break.
11. As a user, I want a slow breathing animation during the 20 seconds, so that the break feels calming.
12. As a user, I want a countdown ring showing time remaining, so that I know when the break ends.
13. As a user, I want a soft prompt to look 20 feet away, so that I follow the 20-20-20 rule correctly.
14. As a user, I want the break to count only if I complete the full 20 seconds, so that my stats reflect real breaks.
15. As a user, I want to dismiss the eye-rest screen early, so that I'm not trapped if something urgent comes up.
16. As a user, I want reminders to keep working for a couple of days even if I haven't opened the app, so that I don't miss breaks.
17. As a user, I want to see how many eye breaks I've taken today, so that I have a gentle sense of progress.
18. As a user, I want a soft 7-day dot grid of my breaks, so that I see my pattern without pressure.
19. As a user, I do not want streak numbers or shame, so that the app stays calm.
20. As a user, I want to open the eye-rest screen manually from home, so that I can take a break without waiting for a reminder.

### Hydration reminder

21. As a user, I want water reminders paced across my active hours toward my daily goal, so that I hydrate steadily.
22. As a user, I want a default goal of 8 glasses a day, so that I have a sensible starting target.
23. As a user, I want to configure my daily glass goal, so that it fits my body and routine.
24. As a user, I want to log a glass with one tap, so that tracking is effortless.
25. As a user, I want to undo a logged glass, so that I can fix a mis-tap.
26. As a user, when I hit my daily water goal, I want remaining water reminders to stop, so that I'm not nagged after I'm done.
27. As a user, when I hit my goal, I want a gentle hydrated state, so that I feel acknowledged without a loud celebration.
28. As a user, when a water reminder fires, I want to tap it and open a quick water-log screen, so that I can log right away.
29. As a user, I want my water count to reset each day, so that each day starts fresh.
30. As a user, I want to see today's water progress toward my goal, so that I know how I'm doing.
31. As a user, I want a soft 7-day dot grid of my hydration, so that I see my pattern without pressure.
32. As a user, I want to open the water-log screen manually from home, so that I can log water without waiting for a reminder.

### Notifications & sound

33. As a user, I want reminders to play a soft chime, so that they're gentle, not jarring.
34. As a user, I want to mute reminder sounds, so that I can be notified by vibration only or silently.
35. As a user, I want a short, low vibration with reminders, so that I notice them even on silent.
36. As a user, I want eye and water reminders to be distinguishable, so that I know which one fired.

### Theme & appearance

37. As a user, I want a calm sage-and-sand visual theme, so that the app feels zen.
38. As a user, I want a dark mode, so that the app is easy on my eyes at night.
39. As a user, I want the app to follow my system dark-mode setting by default, so that it matches my device.
40. As a user, I want clean, calm typography, so that reading feels restful.
41. As a user, I want the app icon and splash to match the calm theme, so that the first impression is consistent.

### Settings

42. As a user, I want a settings screen, so that I can adjust active hours, goals, sound, and theme.
43. As a user, I want my settings to persist across app restarts, so that I don't reconfigure each time.
44. As a user, I want to enable or disable each reminder independently, so that I control which features are active.

### Accessibility

45. As a user using TalkBack, I want key controls labeled, so that I can navigate the app non-visually.
46. As a user with large system fonts, I want the app to respect my font size, so that text stays readable.

### Reliability

47. As a user, I want my daily logs to roll over correctly at the start of a new day, so that today's counts are accurate.
48. As a user, I want the app to reschedule upcoming reminders when I change settings, so that changes take effect promptly.
49. As a user, I want the app to recover if notifications were cleared or the app was reopened after more than two days closed, so that reminders resume.

## Implementation Decisions

### Platform & tooling

- **Stack:** React Native + TypeScript on **Expo managed workflow with `expo-dev-client`**; EAS Build for APK/AAB. Android-first; iOS deferred.
- **Min SDK 26 (Android 8.0)** for notification channels; target a recent API level.
- `expo-dev-client` is required (the notification scheduling path needs the native module); Expo Go is not sufficient for the full flow.

### Notifications

- **`expo-notifications`** scheduled local notifications, **inexact timing** — no `SCHEDULE_EXACT_ALARM` permission, accepting up to ~1 min drift (fine for wellness).
- **Two notification channels:** `eye` (20-20-20) and `water`, each with its own soft singing-bowl chime sound asset and a short, low-intensity vibration. Channels make the two reminders distinguishable and let the user mute one independently via system settings.
- **Sound:** a bundled soft chime asset per channel; a settings toggle to mute (silent/vibration-only). v1 ships chime + mute only (no sound picker).

### Scheduling strategy — per-day batch

- **Per-day batch scheduling.** On each app open (and after any settings change), the app computes fire times for **today + the next 2 days (3 days ahead)** for each enabled feature, cancels that feature's existing scheduled notifications, and reschedules. This keeps reminders alive for a couple of days when the app is closed, without a foreground service.
- **Trade-off:** if the app isn't opened for more than ~2 days, reminders pause until the next open. Accepted and documented.
- Fire times are produced by **pure functions** (the highest practical test seam, since real notification firing can't run in CI):
  - **Eye:** every 20 min within active hours, starting at the active-hours start; only future times are scheduled for today (past times today are skipped).
  - **Water (goal-paced):** `goalGlasses` reminders spread evenly across the active window — interval = activeWindowMinutes / goal — starting at the active-hours start; only future times today.
- **Active hours:** a single configurable same-day window (default 08:00–21:00), shared by both features. Does not span midnight.

### Goal-hit & pause behavior

- When the water count reaches the goal, **cancel that day's remaining water notifications** and mark a `hydrated` state. Resets on daily rollover.
- **Per-feature pause toggle** on Home: pausing cancels that feature's scheduled notifications; resuming reschedules. Independent from the enabled/disabled setting.

### Daily rollover

- On app open, compare the stored "current day" to today. If different: archive yesterday's counts into the 7-day log, reset today's counts to 0, clear `hydrated`, and recompute scheduling. **No background rollover** — "today" becomes correct the first time the app is opened after midnight. Keep only the last 7 days for the dot grids.

### Navigation

- **React Navigation:** bottom tabs (**Home / Stats / Settings**) plus modal stack routes (**EyeRest, WaterLog**) presented over the tabs.
- **Deep linking:** a notification response carries the feature (`eye` | `water`); the navigation linking config routes to the matching modal with appropriate params. Tapping a notification opens the app directly into that modal.

### State & data model

- A **daily state machine** (pure reducer) over `(state, action)`; actions include `LogGlass`, `CompleteBreak`, `Rollover`, `TogglePause`, `UpdateSettings`. UI subscribes via a lightweight store (Zustand or React Context); persistence side-effects flow through the repository.
- Proposed core state shape (encodes the data-model decision precisely):
  ```ts
  type Feature = 'eye' | 'water';
  type Settings = {
    activeHoursStart: string; // "08:00"
    activeHoursEnd: string;   // "21:00"
    waterGoalGlasses: number; // default 8
    soundEnabled: boolean;
    themeMode: 'system' | 'light' | 'dark';
    eyeEnabled: boolean;
    waterEnabled: boolean;
    onboardingComplete: boolean;
  };
  type DailyLog = {
    date: string;         // ISO yyyy-mm-dd
    eyeBreaks: number;
    waterGlasses: number;
  };
  type DayState = {
    today: DailyLog;
    hydrated: boolean;    // waterGlasses >= goal
    eyePaused: boolean;
    waterPaused: boolean;
    recent: DailyLog[];   // last 7 days for dot grids
  };
  ```

### Storage

- **`expo-sqlite`** relational DB, abstracted behind a **`Repository` interface** so app code depends on the interface and tests use an in-memory fake. Interface: `getSettings`, `setSettings`, `getLog(date)`, `getRecentLogs(days)`, `upsertLog`, `getScheduledIds(feature)`, `addScheduledId`, `clearScheduledIds(feature)`.
- Tables: `settings` (typed columns), `daily_log` (date PK, eyeBreaks, waterGlasses), `scheduled_notifications` (feature, triggerTime, notificationId) to support cancel/reschedule.

### Theme & typography

- **Token-based palette:** soft sage & warm sand light theme (cream/sand/sage/terracotta) + charcoal-green dark theme. Theme mode follows system by default with a manual override.
- **Inter** font (via expo-google-fonts or bundled), light/regular weights, generous spacing scale.
- App identity: name **"Pause"**, on-theme icon + splash.

### Screens

- **Eye-rest screen:** 20s countdown driven by a timer; breathing animation ~5s in / 5s out (~2 cycles); countdown ring (animated arc/SVG); soft "look 20 ft away · breathe" prompt on a calm gradient. Completing the full 20s fires `onBreakComplete` (persists a break) then dismisses; early dismiss logs nothing.
- **Water-log screen:** shows today's count vs goal, a primary "log a glass" action (+1), undo, and a gentle hydrated state when count ≥ goal.
- **Home:** per-feature enable + pause toggles, today's counts, quick buttons to open either modal manually.
- **Stats:** today's counts + soft 7-day dot grids for each feature (filled/empty, no numbers, no streaks).

### Onboarding & permissions

- 2–3 calm screens (welcome → 20-20-20 → water), ending with a **`POST_NOTIFICATIONS`** request (Android 13+), then Home. An `onboardingComplete` flag is persisted; subsequent launches skip onboarding.

### Accessibility

- TalkBack labels on interactive controls; respect system font scale; maintain sufficient color contrast in both themes.

## Testing Decisions

### What makes a good test

Tests assert on **external behavior only**, never implementation details: the fire times a scheduler produces, the screen state transitions a user sees, the modal a notification routes to, and read-after-write values from storage. They do **not** assert on mock call counts, SQL strings, internal helper functions, or private state. This keeps tests resilient to refactoring while pinning the behavior that matters.

### Modules tested & seams

This is a greenfield project, so all seams are new — each proposed at the **highest practical point**. Real notification firing can't be exercised in CI, so time-based logic is tested at the pure-function seam; user-visible behavior at the component seam.

1. **Scheduling pure functions** (Jest unit) — `computeEyeBreakTimes(activeHours, anchorDate)` and `computeWaterReminderTimes(activeHours, goalGlasses, anchorDate)`. Edges: window too short for one interval, goal already met at start of day, first fire after "now," goal = 0, boundary exactly at active-hours end.
2. **Daily state machine** (Jest unit, pure reducer) — `rollover(state, today)` (archive yesterday, reset today, clear hydrated, recompute) and the `shouldCancelRemainingWater(state)` predicate.
3. **Screen behavior** (React Native Testing Library — highest UI seam):
   - Eye-rest: countdown reaches 0 → `onBreakComplete` fires (break logged); dismissed early → it does not; breathing animation + ring render.
   - Water-log: tap "log a glass" → count increments + persists; reaching goal → hydrated state shown + `onGoalHit` fires; undo decrements.
   - Home: pause/enable toggles reflect and persist; 7-day dots render from logs.
4. **Notification → modal routing** (navigation linking test) — a notification response carrying a feature routes to the correct modal (eye-rest vs water-log) with correct params. Tests the deep-link path without testing the OS.
5. **Storage repository contract** (Jest, interface seam) — the `Repository` interface contract is tested via an in-memory fake used by app code; the `expo-sqlite` implementation is validated by a thin contract suite run against real (or in-memory) sqlite. Tests the contract, not SQL strings.

### Prior art

None — greenfield. These seams establish the project's first test patterns. Stack: **Jest + React Native Testing Library**.

## Out of Scope

- iOS build (Android-first; iOS roughly doubles QA and is deferred).
- Home-screen widget (significant extra native work; v2).
- Sound options picker (v1 ships chime + mute only).
- Cloud sync / multi-device / accounts / auth.
- Posture, stretch, meditation, or any additional reminder types.
- Calendar-aware quiet / Do Not Disturb integration.
- Streaks, daily targets, gamification, social sharing, leaderboards.
- ml / oz units (v1 is glasses only; the goal number is configurable but the unit is not switchable).
- Exact-alarm precision (inexact timing accepted; no `SCHEDULE_EXACT_ALARM`).
- Foreground service / persistent notification.
- Adaptive icon variants beyond a single on-theme icon.

## Further Notes

- App name **"Pause"** is a placeholder — confirm before launch.
- **Daily rollover is on next app open** (no background rollover). "Today's" counts are correct once the app is opened after midnight; until then they reflect the previous session's day.
- **Inexact scheduling** means reminders may fire up to ~1 min late — acceptable for wellness, and it avoids the Android 12+ exact-alarm permission friction.
- **3-days-ahead scheduling** means reminders pause if the app isn't opened for more than ~2 days, resuming on next open. This is an intentional trade-off against a foreground service (which would add a persistent notification — anti-zen — and battery drain).
- **Notification sound assets** (soft singing-bowl chime, one per channel) need to be sourced or created and bundled; a placeholder tone is acceptable until final assets are ready.
- **expo-dev-client** is required for the notification scheduling path; confirm the build flow early since Expo Go won't cover it.
- Vocabulary used throughout (Pause, 20-20-20, active hours, eye-rest screen, water log, glasses, goal-paced, hydrated state, 7-day dots) should be captured in `CONTEXT.md` by `/grill-with-docs` when domain docs are created.
