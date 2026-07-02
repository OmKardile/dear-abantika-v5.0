# Premium Wellness App — Transformation Worklog

Project: Transform "Abantika" wellness app (Vite/React) into a flagship Dribbble-quality Next.js 16 mobile experience. Preserve ALL existing features.

## Existing App Features (MUST PRESERVE)
- **Dashboard**: hero greeting, quick actions (Log Water, Log Mood, Cycle Entry, Add Reminder), status cards (Hydration, Mood, Cycle, Reminder), daily wellness tip, mood dialog (10 emojis)
- **Cycle Tracker**: monthly calendar with period/symptom markers, entry form (period toggle, flow, 11 symptoms, weight, BBT, medication, notes), analytics (total entries, period days, top-6 symptoms bar chart)
- **Journal**: Diary tab (search, mood filter chips, journal cards w/ title/sticker/mood/date/reflection, add form) + Wishlist tab (4 categories: save-later, urgent, dream, for-him; item cards w/ image/title/description/notes/link, add form)
- **Hydration**: circular progress ring, droplet, quick add 250/500ml, weekly bar chart, 4 tips, goal info
- **Settings**: Theme tab (6 themes), Reminders tab (reminder cards + add form w/ title/category/time/days), Backup tab (export/import JSON)

## Data Model
- hydration {current, goal, history[{date,amount}]}
- mood {current, date}
- cycleEntries[{id,date,isPeriod,flow,symptoms[],weight,bbt,medication,notes}]
- journalEntries[{id,date,title,mood,reflection,sticker}]
- wishlistItems[{id,title,description,category,notes,link,image}]
- reminders[{id,title,time,category,days[],enabled}]

## Architecture Decisions
- Single `/` route (Next.js App Router). Mobile app shell with client-side tab state (no react-router).
- localStorage persistence (mirrors original offline-first approach).
- 6 premium themes via CSS variables, default = warm elegant light theme.
- Framer Motion for animations, Recharts for charts, Lucide for icons.
- 8px spacing grid, 20–28px radii, soft layered shadows, frosted glass accents.

---
Task ID: 1
Agent: main (orchestrator)
Task: Build design system foundation (globals.css tokens + 6 themes, types, storage, providers)

Work Log:
- Analyzed uploaded zip and existing project structure
- Read all existing pages, contexts, and components to map features
- (Building foundation files next)

Stage Summary:
- Foundation in progress.

---
Task ID: 2-8
Agent: main (orchestrator)
Task: Build app shell, all 5 pages, forms, and verify with Agent Browser

Work Log:
- Built app shell with premium floating bottom nav (layoutId spring animation, glassmorphism)
- Built premium primitives: SurfaceCard, GlassCard, IconBadge, ProgressRing, AnimatedCounter, EmptyState, SectionHeader, Chip, PageTransition, StaggerItem, Pressable
- Dashboard: animated gradient hero greeting, floating quick actions, vibrant wave hydration card, animated mood card, reminder countdown, cycle status, daily encouragement with dot pagination
- Cycle Tracker: premium month calendar with period/symptom markers, day selection, entry form (period toggle, flow, 11 symptoms, metrics, notes), analytics view with animated symptom bars + recent entries
- Journal: tabbed Diary (search, mood filter chips, animated entry cards, floating formatting toolbar in form) + Wishlist (4 category cards with counts, image cards, premium add form)
- Hydration: animated progress ring with droplet, +250/-250/+500 controls, weekly bar chart with today highlight, stat chips, gentle tips
- Settings: theme gallery with mini device previews + swatches + animated checkmark, reminders timeline with toggles + day chips, backup export/import/reset, about card
- 7 premium themes (Linen default, Noir, Sage, Lavender, Rose, Ocean, Sand) with full token system
- Zustand store with localStorage persistence, all CRUD operations preserved from original app
- Verified with Agent Browser: all 5 tabs render, all forms open, theme switching works, data persists (water 750→1250 confirmed in localStorage), no runtime errors
- VLM assessment: 8/10, "Dribbble-worthy and production-ready"
- Lint: 0 errors (1 unrelated warning in upload/extracted folder)

Stage Summary:
- All original features preserved: hydration tracking, mood logging, cycle calendar+analytics, journal diary+wishlist, reminders, theme switching, backup/restore
- Transformed into flagship mobile wellness experience with premium design system, animations, and micro-interactions
- Single / route, mobile-first, responsive, accessible (reduced-motion support, ARIA labels, semantic HTML)
- Production-ready, verified end-to-end in browser

---
Task ID: 2
Agent: full-stack-developer (cycle tracker lifecycle)
Task: Add full lifecycle management to Cycle Tracker (list view with search, filter, sort, swipe, multi-select, archive, undo)

Work Log:
- Read worklog.md for project context (premium "Abantika" wellness app, single / route, Zustand store, Framer Motion, shadcn-style premium primitives)
- Read existing src/components/pages/cycle-tracker.tsx (calendar + analytics views + CycleEntryForm)
- Read src/components/pages/journal.tsx for list design pattern reference (search SurfaceCard, horizontal Chip row, StaggerItem list, FAB)
- Read premium primitives, swipeable-row, selection-bar, sort-menu, confirm-dialog to learn exact APIs
- Read hooks/use-selection.ts (mode, selected, toggle, enterMode, selectAll, clearAll) and providers/undo-provider.tsx (showUndo(message, undo))
- Read lib/types.ts (CycleEntry now has archived/archivedAt; SortOption; SORT_LABELS) and lib/store.ts (archiveCycleEntry, bulkDeleteCycleEntries, bulkArchiveCycleEntries all present)
- Read app-shell.tsx + layout.tsx to discover that page content lives inside PageTransition's transformed motion.div — meaning position:fixed children would be trapped in that transform context. Decided to portal SelectionBar / FAB / ConfirmDialog to document.body for correct viewport-fixed positioning
- Rewrote src/components/pages/cycle-tracker.tsx:
  * Replaced single icon toggle in header action slot with a full-width 3-way segmented control below SectionHeader (Calendar | List | Insights) using layoutId="cycle-view-tab" spring animation, matching journal.tsx tab pattern
  * view state type changed from "calendar" | "analytics" to "calendar" | "list" | "insights"; analytics branch renamed key to "insights" but JSX preserved EXACTLY (summary cards, top symptoms bar chart, recent entries list)
  * Calendar branch preserved exactly; only the day onClick now also calls setEditingEntry(getEntry(day)) so the form opens in edit mode for existing entries. Removed the derived selectedEntry variable in favour of explicit editingEntry state
  * Added new CycleListView component (renders inside an opacity-only motion.div to avoid creating a transform containing-block that would break its fixed children):
    - Search SurfaceCard (Search icon + input + Clear) with SortMenu on the right
    - Horizontal scrollable Chip row: All / Period days / Symptoms only / This month (no-scrollbar)
    - List of SwipeableRow-wrapped CycleEntryCards with AnimatePresence + StaggerItem entrance
    - EmptyState when no entries match (different copy + "New entry" action when there are zero entries at all vs. when filter yields nothing)
    - FAB (hidden in selection mode) for adding a new entry for today
  * Added CycleEntryCard component:
    - Long-press (450ms timer on pointerdown, cleared on pointermove/up/leave/cancel) enters selection mode via sel.enterMode(entry.id); a longPressedRef swallows the subsequent click so the card doesn't also open the edit form
    - In selection mode: tap toggles selection (sel.toggle); shows a circular checkmark on the right; card gets ring-2 ring-inset ring-primary (inset so it isn't clipped by SwipeableRow's overflow-hidden)
    - Not in selection mode: tap opens CycleEntryForm via onEditEntry; shows a ChevronRight
    - Card content: gradient period badge OR symptoms badge, date title, subtitle with flow / "Symptoms only" + symptom count + medication
  * Swipe semantics (per task spec):
    - Swipe "Delete" (red, trash) = archive + showUndo("Entry archived", restore) — soft delete with undo
    - Swipe "Archive" (chart-3, archive icon) = archive (restorable from Settings archive screen, no undo)
    - Multi-select "Delete" button = permanent bulkDeleteCycleEntries after ConfirmDialog ("Delete N entries?" / "Delete this entry?" with "This cannot be undone.")
    - Multi-select "Archive" button = bulkArchiveCycleEntries, then clearAll
    - SwipeableRow disabled in selection mode (no swipe, plain div)
  * SelectionBar wired with sel.selectedCount, onCancel=sel.clearAll, onDelete/onArchive ignore the empty-array arg from the component and operate on sel.selected directly; total=visible.length; onSelectAll=sel.selectAll
  * Sort logic applied to filtered (non-archived) list: newest=date desc, oldest=date asc, alpha=symptom count desc (alpha doesn't fit cycle entries), modified=archivedAt ?? date desc
  * Search matches notes / medication / flow / date / any symptom
  * Local Portal helper using React.useSyncExternalStore (SSR-safe, avoids the react-hooks/set-state-in-effect lint error) wraps SelectionBar, FAB, and ConfirmDialog so they escape the transformed PageTransition ancestor and render truly viewport-fixed
- Ran bun run lint: 0 errors (only the pre-existing unrelated postcss warning in upload/extracted). Initial lint flagged setState-in-effect in Portal; fixed by switching to useSyncExternalStore
- Verified dev server: curl http://localhost:3000/ returns HTTP 200; dev.log shows clean compilation, no runtime/compile errors

Stage Summary:
- Cycle Tracker now has 3 views via a premium segmented control: Calendar (unchanged), List (new, full lifecycle), Insights (analytics, unchanged)
- List view delivers the full data lifecycle: search, 4 filter chips, 4 sort modes, swipe-to-archive / swipe-to-soft-delete-with-undo, long-press multi-select with SelectionBar, multi-select permanent delete via ConfirmDialog, multi-select bulk archive, empty states, and a FAB for new entries
- Archived entries are filtered out of the list (they live in the Settings archive screen per the data model)
- Calendar and Insights views preserved exactly; only the form's existing/onSave wiring was migrated from a derived selectedEntry to explicit editingEntry state (behaviour identical)
- All fixed/overlay UI portaled to document.body to escape the app's transformed page-transition wrapper, ensuring SelectionBar, FAB and ConfirmDialog anchor to the viewport correctly
- Mobile-first, touch-friendly (44px+ targets, long-press + swipe gestures), accessible (aria-pressed/aria-label), animated (staggered list, layoutId tab indicator, AnimatePresence), and consistent with the journal page's design language

---
Task ID: 3
Agent: full-stack-developer (journal lifecycle)
Task: Add full lifecycle management to Journal (Diary + Wishlist: search, sort, swipe, multi-select, archive, undo)

Work Log:
- Read worklog.md for project context (premium "Abantika" wellness app, single / route, Zustand store, Framer Motion, premium primitives, 8px grid / 20–28px radii design system)
- Read existing src/components/pages/journal.tsx to understand current structure: top-level Journal with diary/wishlist segmented tabs (layoutId="journal-tab"), Diary (search SurfaceCard, horizontal MOOD_FILTERS Chip row, StaggerItem list of Pressable-wrapped SurfaceCard entry cards with mood emoji + title + date + sticker + reflection, FAB, DiaryEntryForm), Wishlist (2x2 grid of category buttons with counts, list of image+title+description+notes+link cards, FAB, WishlistItemForm)
- Read src/components/pages/cycle-tracker.tsx (CycleListView + CycleEntryCard) as the canonical reference pattern for: useSelection + useUndo wiring, SwipeableRow wrap (disabled in selection mode), long-press (450ms timer, longPressedRef swallow subsequent click), tap-toggle vs tap-open behavior, SelectionBar portaled to body, ConfirmDialog for permanent multi-delete, AnimatePresence initial={false}, ring-2 ring-inset ring-primary for selected cards, SSR-safe Portal via useSyncExternalStore (NOT setState-in-effect which trips the react-hooks lint rule)
- Read premium components to learn exact APIs: swipeable-row.tsx (onDelete + onArchive(archived), archived prop, disabled prop; Delete = red bg-error, Archive = chart-3 bg), selection-bar.tsx (selectedCount, onCancel, onDelete/onArchive fire with [] so operate on sel.selected directly, onSelectAll, total), sort-menu.tsx (value/onChange/options; uses SORT_LABELS from types), confirm-dialog.tsx (open, onOpenChange, title, description, confirmLabel, variant="destructive", onConfirm)
- Read hooks/use-selection.ts (mode, selected[], selectedCount, isSelected, toggle, enterMode, selectAll, clearAll) and providers/undo-provider.tsx (showUndo(message, undo, durationMs=5000))
- Read lib/types.ts (JournalEntry + WishlistItem now have archived?/archivedAt?; SortOption = newest|oldest|alpha|modified; SORT_LABELS; MOOD_FILTERS; WISHLIST_CATEGORIES) and confirmed store.ts has archiveJournalEntry / bulkDeleteJournalEntries / bulkArchiveJournalEntries / archiveWishlistItem / bulkDeleteWishlistItems / bulkArchiveWishlistItems (sets archivedAt = nowIso() when archived)
- Verified form prop signatures: DiaryEntryForm({ open, onOpenChange, existing?, onSave(Omit<JournalEntry,"id">), onDelete?(id) }) and WishlistItemForm({ open, onOpenChange, defaultCategory?, existing?, onSave, onDelete }) — both preserved
- Rewrote src/components/pages/journal.tsx with full lifecycle on BOTH tabs:
  * Diary tab: kept existing tab switcher + form; added SortMenu next to a redesigned Search SurfaceCard row (flex with min-w-0 to keep input flexible on mobile); kept MOOD_FILTERS horizontal Chip row; new activeEntries memo filters out archived; visible memo applies search (title/reflection) + mood filter + 4 sort modes (newest=date desc, oldest=date asc, alpha=localeCompare title, modified=archivedAt??date desc); each entry card now wrapped in SwipeableRow (disabled in selection mode) with onDelete=archive+undo and onArchive=archive; new DiaryEntryCard component (button with long-press → sel.enterMode, click → sel.toggle in selection mode else openEdit, ChevronRight normally / Check circle when selected, ring-2 ring-inset ring-primary when selected) preserves exact existing visual (mood emoji, title, date w/ Calendar icon, animated sticker, line-clamp-3 reflection); SelectionBar / FAB / ConfirmDialog all portaled to document.body via useSyncExternalStore Portal; multi-select Delete opens ConfirmDialog then bulkDeleteJournalEntries (permanent), multi-select Archive = bulkArchiveJournalEntries(ids, true) + clearAll
  * Wishlist tab: kept 2x2 category grid (counts now reflect non-archived items; switching category also clears selection); added NEW Search SurfaceCard + SortMenu row (search matches title/description/notes); new activeItems memo filters archived; visible memo filters by current cat + search + 4 sort modes (newest=insertion index desc via wishlistItems.findIndex, oldest=insertion index asc, alpha=localeCompare title, modified=archivedAt??"" desc); each item card wrapped in SwipeableRow with same delete=archive+undo, archive semantics; new WishlistItemCard component preserves exact existing visual (80x80 image w/ Sparkles fallback, title, line-clamp-2 description, notes w/ 💭, "View link" w/ ExternalLink) plus ChevronRight / Check circle; SelectionBar / FAB / ConfirmDialog portaled; multi-select delete = permanent bulkDeleteWishlistItems after confirm, multi-select archive = bulkArchiveWishlistItems(ids, true) + clearAll
  * Both tabs: empty state copy differentiates "no matches" (with search/filter active) vs "nothing yet" (with New entry / Add item action); FAB hidden in selection mode; ConfirmDialog title pluralizes ("Delete N entries?" vs "Delete this entry?" / "Delete N items?" vs "Delete this item?")
  * Removed now-unused imports (IconBadge from primitives, Pin/Zap/Heart that only backed the dead CAT_ICONS constant) for a clean lint pass; kept Sparkles (still used as wishlist image fallback)
- Ran `bun run lint`: 0 errors (only the pre-existing, unrelated import/no-anonymous-default-export warning in upload/extracted/postcss.config.mjs)
- Verified dev server: curl http://localhost:3000/ returns HTTP 200; dev.log shows clean compilation with no runtime/compile errors

Stage Summary:
- Journal page now delivers the full data lifecycle on BOTH tabs: search, sort (4 modes), swipe-to-soft-delete-with-undo (archive + showUndo snackbar), swipe-to-archive (restorable from Settings → Archive), long-press to enter selection mode, multi-select with portaled SelectionBar (count + select all + archive + permanent delete via ConfirmDialog), staggered list animations with AnimatePresence enter/exit, archived entries filtered out of the list
- All existing functionality preserved: Diary's search + mood filter chips + entry card visual (mood emoji, title, date, animated sticker, reflection) + add/edit form; Wishlist's 2x2 category grid + image card visual + add/edit form; FAB for quick add; tab switcher with layoutId spring
- All fixed/overlay UI (SelectionBar, FAB, ConfirmDialog) portaled to document.body to escape the app's transformed PageTransition wrapper so they anchor to the viewport correctly
- Mobile-first, touch-friendly (44px+ targets, long-press + swipe gestures), accessible (aria-pressed/aria-label on every interactive control), and visually consistent with the cycle-tracker's list view (same SwipeableRow/SelectionBar/SortMenu/ConfirmDialog patterns, same long-press + selection ring treatment)

---
Task ID: 4
Agent: full-stack-developer (hydration/reminders/archive lifecycle)
Task: Add hydration log lifecycle, mood history, reminder swipe/sort, and Archive management screen

Work Log:
- Read worklog.md for project context (premium "Abantika" wellness app, single / route, Zustand store, Framer Motion, premium primitives)
- Read existing src/components/pages/hydration.tsx (hero ring + quick add + stat chips + weekly chart + tips + goal info — all to be preserved) and src/components/pages/settings.tsx (Theme/Reminders/Backup tabs + About card — all to be preserved)
- Read src/components/forms/reminder-form.tsx for bottom-sheet form pattern reference and src/components/forms/mood-dialog.tsx for the mood grid pattern reference
- Read src/components/pages/cycle-tracker.tsx end-to-end to learn the exact swipe + long-press selection + Portal + ConfirmDialog pattern that this app uses (useSyncExternalStore-based Portal to escape the transformed PageTransition ancestor; SwipeableRow with onDelete; useSelection hook; SelectionBar with onDelete/onSelectAll; long-press 450ms timer swallowing the subsequent click)
- Read all premium components (primitives, swipeable-row, selection-bar, sort-menu, confirm-dialog), useSelection hook, undo-provider, lib/types, lib/helpers, lib/store to confirm exact APIs: HydrationLog/MoodLog shapes, addHydrationLog(amount, timestamp?) accepting original timestamp for undo, addMoodLog(mood, note?) creating new id/timestamp, archiveX/deleteX/bulkDeleteX for all 4 entity types
- Created src/components/forms/hydration-log-form.tsx (NEW) — bottom sheet for editing a hydration log:
  * Sticky header + sticky footer pattern matching reminder-form.tsx
  * Amount control: −50/+50 buttons around a large tabular-nums display, color flips primary (≥0) / error (<0)
  * 3 quick-amount chips (+250, +500, −250) and a manual number input fallback
  * Time input (type="time") defaulting to the existing log's timestamp or now
  * Live preview card ("This will add/remove X ml to/from today's total")
  * Save calls onSave(amount, buildTimestamp(time, existing?.timestamp)); Delete calls onDelete(existing.id)
  * Props exactly match spec: { open, onOpenChange, existing?, onSave(amount, timestamp), onDelete?(id) }
- Created src/components/forms/mood-log-form.tsx (NEW) — bottom sheet for adding/editing a mood log:
  * 5-column grid of MOODS emojis with spring entrance per button, active state gets ring + scale + shadow-glow
  * Optional note textarea (max 300 chars) with live counter
  * Save calls onSave(mood, note||undefined); Delete calls onDelete(existing.id)
  * Props exactly match spec: { open, onOpenChange, existing?, onSave(mood, note?), onDelete?(id) }
- Edited src/components/pages/hydration.tsx — preserved hero ring + stat chips + weekly chart + tips + goal info verbatim, added two new sections between stat chips and weekly chart:
  * TodaysLogs component: SurfaceCard listing hydrationLogs filtered to today's date prefix, sorted newest-first; each row in SwipeableRow with delete action = deleteHydrationLog(id) + showUndo("Log removed", () => addHydrationLog(amount, timestamp)) restoring original amount AND timestamp; tap row opens HydrationLogForm in edit mode; empty state "No logs yet — add water above"; scroll-area max-h-80 for long lists; AnimatePresence for enter/exit
  * RecentMood component: SurfaceCard showing latest 3 moodLogs (timestamp + emoji + note + relative time), each swipeable to delete + showUndo("Mood removed", () => addMoodLog(mood, note)) — addMoodLog signature only takes mood+note so undo restores mood+note with a fresh id/timestamp; "View all" action opens a portaled MoodHistorySheet (full-screen bottom sheet with all mood logs, same swipe + edit pattern); tap row opens MoodLogForm in edit mode
  * MoodHistorySheet portaled to document.body via useSyncExternalStore-based Portal (matches cycle-tracker pattern), with sticky header + scrollable body
- Edited src/components/pages/settings.tsx — preserved ThemeTab/BackupTab/About verbatim, changed tab array from 3 to 4 entries (Theme, Alerts, Backup, Archive) using shorter labels to fit, and made these changes to RemindersTab + added ArchiveTab:
  * RemindersTab: added SortMenu (newest=reverse insertion / oldest=insertion / alpha=title A→Z / modified=by reminder time asc); filtered to non-archived reminders only; wrapped each timeline card in SwipeableRow with permanent Delete action (no undo, opens ConfirmDialog); extracted ReminderRow component with long-press 450ms timer that enters selection mode via sel.enterMode(id) and swallows the subsequent click; in selection mode the row shows a circular checkmark and disables swipe; SelectionBar portaled to body with bulk delete after ConfirmDialog; both single-delete and bulk-delete ConfirmDialogs portaled to body
  * ArchiveTab (NEW): shows archived items across all 4 entity types (cycle, journal, wishlist, reminders) — only renders sections that have ≥1 archived item; each ArchivedItemRow shows type emoji + title + description + "archived X ago" relative time + Restore button (calls archiveX(id, false)) + permanent Delete button (calls deleteX(id) after ConfirmDialog); empty state when nothing is archived ("Nothing archived. Archived items rest here until you restore or delete them." with 🗂️ emoji); "Empty archive" danger button at bottom that permanently deletes ALL archived items across all 4 types after a single ConfirmDialog
  * Portal helper using React.useSyncExternalStore (SSR-safe, avoids setState-in-effect lint error) wraps SelectionBar and all ConfirmDialogs so they escape the transformed PageTransition ancestor and render truly viewport-fixed — consistent with cycle-tracker.tsx
- Ran `bun run lint`: 0 errors (only the pre-existing unrelated postcss warning in upload/extracted). Initial draft had a dead handleDelete function in RecentMood (leftover from a broken undo snippet that referenced useStore.getState().addMoodLog) — removed it; also removed unused IconBadge/EmptyState/ConfirmDialog/Trash2 imports from hydration.tsx and unused ChevronRight import from settings.tsx
- Verified dev server: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` returns 200; dev.log shows clean compilation across multiple edits, no runtime/compile errors

Stage Summary:
- Hydration page now has a full log lifecycle: today's logs list (swipe-delete with undo that restores original amount + timestamp, tap to edit via HydrationLogForm), plus a recent-mood mini-section with view-all history sheet
- Two new bottom-sheet forms: HydrationLogForm (amount stepper + quick chips + custom input + time picker + live preview + save/delete) and MoodLogForm (10-emoji grid + optional note + save/delete) — both match reminder-form.tsx's sticky-header/sticky-footer pattern
- Settings Reminders tab upgraded with SortMenu (4 modes), SwipeableRow permanent delete (ConfirmDialog, no undo), long-press multi-select with portaled SelectionBar + bulk delete; archived reminders filtered out
- New Archive tab (4th) groups all archived items by type (Cycle / Journal / Wishlist / Reminders), each with Restore + permanent Delete (ConfirmDialog), empty state, and an "Empty archive" danger button that wipes all archived items in one confirm
- All fixed/overlay UI (SelectionBar, ConfirmDialogs, MoodHistorySheet) portaled to document.body via useSyncExternalStore-based Portal — consistent with cycle-tracker.tsx pattern; mobile-first, touch-friendly (44px+ targets, long-press + swipe), accessible (aria-pressed/aria-label), animated (staggered list, layout spring tab indicator, AnimatePresence)
- Lint clean (0 errors); dev server returns 200; no runtime/compile errors in dev.log

---
Task ID: 6
Agent: main (orchestrator)
Task: Verify all lifecycle flows with Agent Browser end-to-end

Work Log:
- Verified all 5 tabs render with zero runtime/console errors
- Cycle Tracker: 3-way segmented control (Calendar/List/Insights), list view with search + 4 filter chips + sort menu, created entry appears in list
- Journal Diary: sort menu, swipe reveals Archive/Delete actions, archived entry disappears from list
- Journal Wishlist: search + sort + swipe actions
- Archive screen: archived journal entry appears under "Journal entries" with Restore/Delete; Restore returns it to journal (verified round-trip)
- Hydration: "Today's logs" section shows individual log entries with delete; "Recent mood" section shows latest mood logs
- Settings: 4 tabs (Theme/Alerts/Backup/Archive); reminders swipe-delete + sort
- Selection mode: long-press enters multi-select with "Select all N" + SelectionBar
- UndoProvider wired into layout; undo snackbar appears on soft-delete
- ConfirmDialog for permanent deletes
- Lint: 0 errors (1 unrelated warning in upload/extracted)
- VLM scores: Hydration 9/10, Archive 8/10, Journal 8/10, Home 8/10 — "handcrafted, premium feel rather than AI-generated CRUD"

Stage Summary:
- Complete data lifecycle management across ALL modules: Create/View/Edit/Delete/Search/Filter/Sort/Archive/Restore
- Premium UX patterns: swipe-to-delete, long-press multi-select, undo snackbar, confirmation dialogs, sort menus, filter chips, elegant empty states with actions
- New content types with full lifecycle: HydrationLog (individual water entries), MoodLog (mood history)
- New Archive management screen (restore + permanent delete + empty-all)
- All verified end-to-end in browser, production-ready
