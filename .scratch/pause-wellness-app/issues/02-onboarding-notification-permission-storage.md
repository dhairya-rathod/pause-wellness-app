# 02 — Onboarding, notification permission, storage foundation

Status: ready-for-agent

## Parent

`.scratch/pause-wellness-app/PRD.md` — Pause (calm zen wellness app)

## What to build

Establish persistent storage and the first-launch flow:

- A **`Repository` interface** for app data, an **`expo-sqlite` implementation**, and an **in-memory fake** for tests. v1 needs only the settings surface: `getSettings`, `setSettings`. (Later slices add log and scheduled-notification methods.)
- The **settings** persisted shape (encodes the data-model decision from the PRD):
  ```ts
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
  ```
- A **`settings` table** in sqlite (typed columns) backing the interface.
- A brief, calm **onboarding** flow: 2–3 screens (welcome → how 20-20-20 works → how water works), ending with a **`POST_NOTIFICATIONS`** permission request (Android 13+), then Home.
- An `onboardingComplete` flag in settings; subsequent launches skip onboarding and go straight to Home.

This slice is demoable by a first launch walking through onboarding, granting notification permission, landing on Home, then force-killing and relaunching to skip onboarding.

## Acceptance criteria

- [ ] First launch shows onboarding (welcome → 20-20-20 → water), then prompts for notification permission, then Home.
- [ ] Granting/denying `POST_NOTIFICATIONS` does not crash; the flow completes either way.
- [ ] Relaunching after completing onboarding goes straight to Home (no onboarding).
- [ ] Settings persist across app restarts (verified by reading back `onboardingComplete` and a changed setting after relaunch).
- [ ] The `Repository` interface is consumed via the interface in app code; the sqlite impl and in-memory fake both satisfy it.
- [ ] A storage repository contract test passes against the in-memory fake.

## Blocked by

- `01-scaffold-expo-theme-navigation-tests.md`
