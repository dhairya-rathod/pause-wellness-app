# 01 — Scaffold: Expo project, theme, navigation, test setup

Status: ready-for-agent

## Parent

`.scratch/pause-wellness-app/PRD.md` — Pause (calm zen wellness app)

## What to build

Scaffold the greenfield React Native + TypeScript app on **Expo managed workflow with `expo-dev-client`**, and establish the shared foundations every later slice depends on:

- A working Expo project (Android-first, min SDK 26) that builds a dev client.
- The **theme system**: token-based soft sage & warm sand palette (cream/sand/sage/terracotta) + a charcoal-green dark theme that follows the system setting by default. Theme tokens consumed via a theme provider.
- **Inter** font loaded and applied with a generous spacing scale; light/regular weights.
- **React Navigation**: bottom tabs (Home / Stats / Settings) plus modal stack routes for EyeRest and WaterLog, presented over the tabs, with a navigation linking config (deep-link routes reserved for later slices).
- A minimal **Home** screen with two buttons that open the EyeRest and WaterLog modals (modals can be placeholder screens for now).
- On-theme **app icon + splash** placeholders (name "Pause").
- **Test setup**: Jest + React Native Testing Library configured and runnable, with one trivial passing test as proof.

This slice is a thin vertical path: theme tokens → provider → screens → navigation → a runnable test. It is demoable by launching the app, seeing the calm themed tabs, and opening the two placeholder modals from Home.

## Acceptance criteria

- [ ] `npx expo run:android` (via dev client) launches the app on a device/emulator without Expo Go.
- [ ] Bottom tabs Home / Stats / Settings render and switch.
- [ ] Home's two buttons open the EyeRest and WaterLog modal routes.
- [ ] Light theme shows the sage/sand palette; toggling the device to dark mode switches to the charcoal-green dark theme.
- [ ] Inter font renders throughout; spacing looks calm (not cramped).
- [ ] App icon and splash render on-theme (placeholders acceptable).
- [ ] `npm test` runs Jest + RNTL and passes at least one test.

## Blocked by

None - can start immediately
