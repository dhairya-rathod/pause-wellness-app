# 08 — Accessibility pass

Status: ready-for-agent

## Parent

`.scratch/pause-wellness-app/PRD.md` — Pause (calm zen wellness app)

## What to build

Bring the app up to a shippable accessibility baseline across all screens:

- **TalkBack** accessibility labels on interactive controls (toggles, log buttons, open-modal buttons, undo).
- Respect the **system font scale** so text grows with the user's setting without breaking layout.
- Maintain **sufficient color contrast** in both light and dark themes (verify key text/surface pairs).

Demoable: enable TalkBack and navigate Home, Stats, Settings, EyeRest, and WaterLog with spoken labels; set a large system font and confirm text stays readable; confirm contrast in both themes.

## Acceptance criteria

- [x] All interactive controls have TalkBack labels.
- [x] Text scales with the system font setting without clipping or overlap.
- [x] Key text/surface pairs meet contrast thresholds in light and dark themes.
- [x] Navigating the app with TalkBack is coherent (labels describe actions, not generic "button").

## Blocked by

- `07-stats-7-day-dots-rollover.md`
