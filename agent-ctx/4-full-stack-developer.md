# Task 4 — full-stack-developer (hydration/reminders/archive lifecycle)

## Files touched
- `src/components/forms/hydration-log-form.tsx` — NEW
- `src/components/forms/mood-log-form.tsx` — NEW
- `src/components/pages/hydration.tsx` — added TodaysLogs + RecentMood + MoodHistorySheet
- `src/components/pages/settings.tsx` — added SortMenu + swipe/selection to RemindersTab + new ArchiveTab
- `worklog.md` — appended Task ID 4 record

## Key decisions
- Used `useSyncExternalStore`-based `Portal` (matches cycle-tracker.tsx) to escape the transformed `PageTransition` ancestor for SelectionBar / ConfirmDialog / MoodHistorySheet.
- Hydration swipe-delete undo calls `addHydrationLog(amount, timestamp)` — restoring both the original amount AND timestamp (store supports the optional timestamp arg).
- Mood swipe-delete undo calls `addMoodLog(mood, note)` — store signature only takes mood+note, so undo restores mood+note with a fresh id/timestamp (acceptable per spec).
- Reminder swipe-delete is permanent after ConfirmDialog (no undo — reminders are easily recreated), per spec.
- Archive tab groups by type, only renders non-empty sections, "Empty archive" wipes all archived items in one confirm.
- Tab labels shortened to fit 4 tabs: Theme / Alerts / Backup / Archive.

## Verification
- `bun run lint`: 0 errors (only pre-existing unrelated postcss warning in upload/extracted).
- `curl http://localhost:3000/` returns 200.
- dev.log shows clean compilation, no runtime/compile errors.
