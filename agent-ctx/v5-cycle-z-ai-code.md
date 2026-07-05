# v5-cycle — Cycle Tracker v5.0 Enhancements

**Agent:** z.ai code (fullstack)
**Task ID:** v5-cycle
**Date:** 2025-07-05
**Status:** ✅ Complete

## Scope
Enhance the Cycle Tracker for "Dear Abantika v5.0" with expanded symptoms, PCOS mode, and period predictions. Edit only `src/components/forms/cycle-entry-form.tsx` and `src/components/pages/cycle-tracker.tsx`.

## Files read before starting
- `/home/z/my-project/worklog.md` (project history + prior agent work, e.g. dashboard v5.0)
- `/home/z/my-project/src/components/pages/cycle-tracker.tsx` (857 lines — 3-view tracker: calendar/list/insights, lifecycle features intact)
- `/home/z/my-project/src/components/forms/cycle-entry-form.tsx` (312 lines — period toggle, flow ×3, symptoms ×11, weight, BBT, medication, notes)
- `/home/z/my-project/src/lib/types.ts` (extended `CycleEntry` with painScale/sleepHours/moodTag/libido/discharge/supplements/clots/bowelChanges/isSpotting/isBreakthrough; `SYMPTOMS` ×30; `PCOS_SYMPTOMS`; `MOODS`; `MEDICAL_DISCLAIMER`; `PCOSSettings`)
- `/home/z/my-project/src/lib/store.ts` (confirmed `cycleEntries`, `addCycleEntry`, `updateCycleEntry`, `deleteCycleEntry`, `archiveCycleEntry`, `settings.pcos` API + `setPCOS`)
- `/home/z/my-project/src/lib/helpers.ts` (`dateKey`, `todayStr`)
- `/home/z/my-project/src/components/premium/primitives.tsx` (SurfaceCard, SectionHeader, IconBadge, EmptyState, AnimatedCounter, StaggerItem, Pressable, Chip)
- `globals.css` (chart-1..5, divider, surface, gradient-primary, shadow-glow vars across 6 themes)

## Changes delivered

### cycle-entry-form.tsx
- FLOWS expanded to 4 (spotting/light/medium/heavy) in a 4-col grid
- Pain scale slider 0–10 (native range, `accent-color: var(--primary)`) with live emoji 😌😟😣😭 + zone labels + active-zone highlight
- Sleep hours MetricField (inputMode numeric)
- Mood tag picker — horizontal scroll of all `MOODS`, tap-to-toggle
- Libido segmented control (Low 🌙 / Normal 💫 / High 🔥)
- Discharge + Supplements text inputs (2-col)
- Clots + Bowel changes toggle chips (new `MiniToggle` component)
- isSpotting + isBreakthrough toggles — rendered inside flow section only when `pcosEnabled` prop is true
- New optional `pcosEnabled?: boolean` prop
- All existing fields/behavior preserved; save() writes new fields with `|| undefined`

### cycle-tracker.tsx
- Imports: added recharts (AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine), date-fns (addDays, subDays, differenceInDays), lucide (HeartPulse, Activity, AlertTriangle, CalendarClock, ShieldAlert, Brain), types (MEDICAL_DISCLAIMER, PCOS_SYMPTOMS)
- `settings` destructured from store; `pcosEnabled = settings.pcos.enabled`
- Module-level pure cycle-math helpers: `getPeriodStarts`, `getCycleLengths`, `avgCycleLength`, `cycleStddev`, `predictionConfidence`, `CONFIDENCE_LABEL`
- Header now flex-row: SectionHeader + conditional "PCOS Mode" badge (HeartPulse)
- Calendar: `cnDay` extended with `isPredicted` + `isPredictedCenter` flags → dashed primary-tinted overlay on prediction window, dot+ring on predicted center day; legend gains "Predicted" swatch
- Prediction card below calendar: next-period date, "est. X days away/today/overdue", window range, avg cycle, ±2d (normal) / ±5d (PCOS), confidence badge when PCOS, MEDICAL_DISCLAIMER callout
- Insights view: 2×2 summary cards (added avg cycle + cycles logged); Cycle history AreaChart with avg ReferenceLine + gradient fill; Symptom heatmap (3-month GitHub-style grid, 5-step opacity scale, Less/More legend, h-scroll); Pain trend LineChart (conditional); PCOS panel (conditional: irregularity stddev, ovulation certainty %, PCOS_SYMPTOMS trend chips, MEDICAL_DISCLAIMER); existing top-symptoms + recent-entries preserved
- `pcosEnabled` passed to `<CycleEntryForm>`
- All existing lifecycle features (search, filter, sort, swipeable rows, multi-select, archive, undo, FAB, confirm dialog) untouched

## Confidence formula
`base = max(30, 95 − stddev×7)`; −12 per cycle short of 3; cap 70 in PCOS mode; clamp [15, 95]. Label thresholds: ≥75 High, ≥50 Moderate, else Low; 0 cycles → "Not enough data".

## Verification
- `bun run lint` → 0 errors (1 pre-existing warning in `upload/extracted/postcss.config.mjs`, unrelated)
- Dev server: `✓ Compiled` + `GET / 200` (3 ms recompile after edits)
- Only the two permitted files edited; no other source touched

## Notes for downstream agents
- The form's `pcosEnabled` prop is optional and defaults to undefined (toggles hidden) — safe for any caller that doesn't pass it.
- Cycle-math helpers are exported as module-level functions (not exported via `export`), so if another page needs them, factor them into `lib/cycle-math.ts` rather than re-importing from the component.
- Recharts charts use CSS-var colors → automatically theme-aware across all 6 themes + dark mode; no hard-coded hex.
- The prediction window intentionally skips days that already have a logged period entry (avoids double-tinting).
