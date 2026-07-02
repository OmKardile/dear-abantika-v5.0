"use client";

import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CalendarDays,
  Sparkles,
  Droplet,
  Search,
  List as ListIcon,
  Check,
  Plus,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from "date-fns";
import { useStore } from "@/lib/store";
import { dateKey } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import type { CycleEntry, SortOption } from "@/lib/types";
import {
  SurfaceCard,
  SectionHeader,
  IconBadge,
  EmptyState,
  AnimatedCounter,
  StaggerItem,
  Pressable,
  Chip,
} from "@/components/premium/primitives";
import { SwipeableRow } from "@/components/premium/swipeable-row";
import { SelectionBar } from "@/components/premium/selection-bar";
import { SortMenu } from "@/components/premium/sort-menu";
import { ConfirmDialog } from "@/components/premium/confirm-dialog";
import { useSelection } from "@/hooks/use-selection";
import { useUndo } from "@/components/providers/undo-provider";
import { CycleEntryForm } from "@/components/forms/cycle-entry-form";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

type CycleFilter = "all" | "period" | "symptoms" | "month";
const CYCLE_FILTERS: { id: CycleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "period", label: "Period days" },
  { id: "symptoms", label: "Symptoms only" },
  { id: "month", label: "This month" },
];

type CycleView = "calendar" | "list" | "insights";

export function CycleTracker() {
  const reduce = useReducedMotion();
  const { cycleEntries, addCycleEntry, updateCycleEntry, deleteCycleEntry } =
    useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEntry, setEditingEntry] = useState<CycleEntry | undefined>();
  const [view, setView] = useState<CycleView>("calendar");
  const [formOpen, setFormOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const getEntry = (d: Date) =>
    cycleEntries.find((e) => isSameDay(new Date(e.date), d));

  const periodDays = cycleEntries.filter((e) => e.isPeriod).length;

  // symptom frequency
  const symptomCounts = useMemo(() => {
    const m = new Map<string, number>();
    cycleEntries.forEach((e) =>
      e.symptoms.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1))
    );
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [cycleEntries]);
  const maxCount = symptomCounts[0]?.[1] ?? 1;

  const openNew = (date: Date) => {
    setSelectedDate(date);
    setEditingEntry(undefined);
    setFormOpen(true);
  };

  const openEdit = (entry: CycleEntry) => {
    setSelectedDate(new Date(entry.date));
    setEditingEntry(entry);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          title="Cycle Tracker"
          subtitle="Gentle, private insights"
        />
      </motion.div>

      {/* 3-way segmented control */}
      <div className="relative flex p-1 rounded-full surface-card">
        {(["calendar", "list", "insights"] as const).map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold"
              aria-pressed={active}
            >
              {active && (
                <motion.div
                  layoutId="cycle-view-tab"
                  className="absolute inset-0 rounded-full gradient-primary-bg shadow-glow"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex items-center gap-1.5 capitalize",
                  active ? "text-primary-foreground" : "text-text-secondary"
                )}
              >
                {v === "calendar" && <CalendarDays size={15} />}
                {v === "list" && <ListIcon size={15} />}
                {v === "insights" && <TrendingUp size={15} />}
                {v}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {view === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Calendar card */}
            <SurfaceCard className="p-5">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-5">
                <Pressable
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center"
                >
                  <ChevronLeft size={18} className="text-text-secondary" />
                </Pressable>
                <div className="text-center">
                  <p className="text-label text-text-tertiary">Month</p>
                  <p className="text-title text-text-primary">
                    {format(currentDate, "MMMM yyyy")}
                  </p>
                </div>
                <Pressable
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center"
                >
                  <ChevronRight size={18} className="text-text-secondary" />
                </Pressable>
              </div>

              {/* DOW header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DOW.map((d, i) => (
                  <div
                    key={i}
                    className="text-center text-label text-text-tertiary py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const entry = getEntry(day);
                  const inMonth = isSameMonth(day, currentDate);
                  const today = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedDate(day);
                        setEditingEntry(getEntry(day));
                        setFormOpen(true);
                      }}
                      className={cnDay({
                        inMonth,
                        today,
                        selected: !!isSelected,
                        isPeriod: entry?.isPeriod,
                      })}
                    >
                      <span
                        className={cn(
                          "relative z-10 text-sm font-semibold",
                          entry?.isPeriod
                            ? "text-primary-foreground"
                            : inMonth
                            ? "text-text-primary"
                            : "text-text-tertiary",
                          today && !entry?.isPeriod && "text-primary"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {entry && !entry.isPeriod && entry.symptoms.length > 0 && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {entry.symptoms.slice(0, 3).map((_, idx) => (
                            <span
                              key={idx}
                              className="w-1 h-1 rounded-full bg-chart-3"
                            />
                          ))}
                        </span>
                      )}
                      {today && (
                        <span className="absolute inset-0 rounded-xl ring-2 ring-primary/40 pointer-events-none" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-5 pt-4 border-t border-divider">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full gradient-primary-bg" />
                  <span className="text-caption text-text-secondary">Period</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-chart-3" />
                  <span className="text-caption text-text-secondary">Symptoms</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <CalendarDays size={13} className="text-text-tertiary" />
                  <span className="text-caption text-text-secondary">
                    Tap a day to log
                  </span>
                </div>
              </div>
            </SurfaceCard>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4">
              <StaggerItem index={0}>
                <SurfaceCard className="p-5">
                  <IconBadge icon={Droplet} variant="solid" size={40} />
                  <p className="text-headline text-text-primary mt-3">
                    <AnimatedCounter value={periodDays} />
                  </p>
                  <p className="text-caption text-text-secondary">Period days</p>
                </SurfaceCard>
              </StaggerItem>
              <StaggerItem index={1}>
                <SurfaceCard className="p-5">
                  <IconBadge icon={Sparkles} variant="soft" size={40} />
                  <p className="text-headline text-text-primary mt-3">
                    <AnimatedCounter value={cycleEntries.length} />
                  </p>
                  <p className="text-caption text-text-secondary">Total entries</p>
                </SurfaceCard>
              </StaggerItem>
            </div>

            {cycleEntries.length === 0 && (
              <EmptyState
                emoji="🌸"
                title="Start your journey"
                description="Tap any day on the calendar to log your first entry. Everything stays private on your device."
              />
            )}
          </motion.div>
        )}

        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CycleListView onEditEntry={openEdit} onAddNew={() => openNew(new Date())} />
          </motion.div>
        )}

        {view === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4">
              <SurfaceCard className="p-5">
                <p className="text-label text-text-tertiary">Total entries</p>
                <p className="text-headline text-text-primary mt-1">
                  <AnimatedCounter value={cycleEntries.length} />
                </p>
              </SurfaceCard>
              <SurfaceCard className="p-5">
                <p className="text-label text-text-tertiary">Period days</p>
                <p className="text-headline text-text-primary mt-1">
                  <AnimatedCounter value={periodDays} />
                </p>
              </SurfaceCard>
            </div>

            {/* Top symptoms */}
            <SurfaceCard className="p-5">
              <SectionHeader
                title="Top symptoms"
                subtitle="Most logged this period"
                className="mb-5"
              />
              {symptomCounts.length === 0 ? (
                <EmptyState
                  emoji="📊"
                  title="No data yet"
                  description="Log symptoms with your entries to see patterns here."
                />
              ) : (
                <div className="space-y-3.5">
                  {symptomCounts.map(([sym, count], i) => (
                    <StaggerItem key={sym} index={i}>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-body text-text-primary font-medium">
                            {sym}
                          </span>
                          <span className="text-caption text-text-secondary font-semibold">
                            {count}×
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-surface-secondary overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              backgroundImage: "var(--gradient-primary)",
                            }}
                            initial={reduce ? { width: `${(count / maxCount) * 100}%` } : { width: 0 }}
                            animate={{ width: `${(count / maxCount) * 100}%` }}
                            transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              )}
            </SurfaceCard>

            {/* Recent entries */}
            {cycleEntries.length > 0 && (
              <SurfaceCard className="p-5">
                <SectionHeader
                  title="Recent entries"
                  className="mb-4"
                />
                <div className="space-y-2.5 max-h-72 overflow-y-auto scroll-area -mr-2 pr-2">
                  {[...cycleEntries]
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .slice(0, 12)
                    .map((e) => (
                      <Pressable
                        key={e.id}
                        onClick={() => openEdit(e)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            e.isPeriod
                              ? "gradient-primary-bg"
                              : "bg-surface border border-border"
                          )}
                        >
                          {e.isPeriod ? (
                            <Droplet size={16} className="text-primary-foreground" />
                          ) : (
                            <Sparkles size={16} className="text-text-tertiary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body text-text-primary font-semibold">
                            {format(new Date(e.date), "MMM d, yyyy")}
                          </p>
                          <p className="text-caption text-text-secondary truncate">
                            {e.isPeriod
                              ? `${e.flow ?? "light"} flow`
                              : "Symptoms only"}
                            {e.symptoms.length > 0 &&
                              ` · ${e.symptoms.length} symptoms`}
                          </p>
                        </div>
                      </Pressable>
                    ))}
                </div>
              </SurfaceCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CycleEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        date={selectedDate ? dateKey(selectedDate) : dateKey(new Date())}
        existing={editingEntry}
        onSave={(entry) => {
          if (editingEntry) updateCycleEntry(editingEntry.id, entry);
          else addCycleEntry(entry);
        }}
        onDelete={deleteCycleEntry}
      />
    </div>
  );
}

/* ==================== LIST VIEW ==================== */
function CycleListView({
  onEditEntry,
  onAddNew,
}: {
  onEditEntry: (entry: CycleEntry) => void;
  onAddNew: () => void;
}) {
  const {
    cycleEntries,
    archiveCycleEntry,
    bulkDeleteCycleEntries,
    bulkArchiveCycleEntries,
  } = useStore();
  const { showUndo } = useUndo();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CycleFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });

  // archived entries live in the Archive screen in Settings — hide them here
  const activeEntries = useMemo(
    () => cycleEntries.filter((e) => !e.archived),
    [cycleEntries]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);

    const filtered = activeEntries.filter((e) => {
      if (q) {
        const matches =
          (e.notes?.toLowerCase().includes(q) ?? false) ||
          (e.medication?.toLowerCase().includes(q) ?? false) ||
          (e.flow?.toLowerCase().includes(q) ?? false) ||
          e.date.toLowerCase().includes(q) ||
          e.symptoms.some((s) => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      switch (filter) {
        case "period":
          return e.isPeriod;
        case "symptoms":
          return !e.isPeriod && e.symptoms.length > 0;
        case "month": {
          const d = new Date(e.date);
          return d >= mStart && d <= mEnd;
        }
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.date > b.date ? 1 : -1;
        case "alpha": // by symptom count desc (alpha doesn't fit cycle entries)
          return b.symptoms.length - a.symptoms.length;
        case "modified": {
          const am = a.archivedAt ?? a.date;
          const bm = b.archivedAt ?? b.date;
          return am < bm ? 1 : -1;
        }
        case "newest":
        default:
          return a.date < b.date ? 1 : -1;
      }
    });
  }, [activeEntries, search, filter, sort]);

  const sel = useSelection(visible);
  const hasAny = activeEntries.length > 0;

  // Swipe "delete" action = soft archive + undo snackbar
  const handleSwipeDelete = (entry: CycleEntry) => {
    archiveCycleEntry(entry.id, true);
    showUndo("Entry archived", () => archiveCycleEntry(entry.id, false));
  };
  // Swipe "archive" action = archive (restorable from Settings)
  const handleSwipeArchive = (entry: CycleEntry, archived: boolean) => {
    archiveCycleEntry(entry.id, archived);
  };
  // Multi-select delete = permanent delete after confirm
  const handleMultiDelete = () => {
    if (sel.selected.length === 0) return;
    setConfirmDelete({ open: true, ids: sel.selected });
  };
  const handleMultiArchive = () => {
    const ids = sel.selected;
    if (ids.length === 0) return;
    bulkArchiveCycleEntries(ids, true);
    sel.clearAll();
  };
  const confirmDeleteAction = () => {
    bulkDeleteCycleEntries(confirmDelete.ids);
    sel.clearAll();
    setConfirmDelete({ open: false, ids: [] });
  };

  return (
    <div className="space-y-5">
      {/* Search + sort row */}
      <div className="flex items-center gap-2">
        <SurfaceCard className="flex-1 flex items-center gap-3 px-4 py-3 min-w-0">
          <Search size={18} className="text-text-tertiary shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries…"
            className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary min-w-0"
            aria-label="Search cycle entries"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-caption text-text-tertiary shrink-0 hover:text-text-primary transition-colors"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </SurfaceCard>
        <SortMenu value={sort} onChange={setSort} />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {CYCLE_FILTERS.map((f) => (
          <Chip
            key={f.id}
            active={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {/* List or empty state */}
      {visible.length === 0 ? (
        <EmptyState
          emoji="🌸"
          title={hasAny ? "No matches found" : "Start your journey"}
          description={
            hasAny
              ? "Try a different search or filter to find your entries."
              : "Log your first cycle entry to begin tracking. Everything stays private on your device."
          }
          action={
            !hasAny ? (
              <Pressable
                onClick={onAddNew}
                className="px-5 py-2.5 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
              >
                <Plus size={15} />
                New entry
              </Pressable>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((entry, i) => (
              <StaggerItem key={entry.id} index={Math.min(i, 8)}>
                <SwipeableRow
                  onDelete={() => handleSwipeDelete(entry)}
                  onArchive={(archived) => handleSwipeArchive(entry, archived)}
                  archived={entry.archived}
                  disabled={sel.mode}
                >
                  <CycleEntryCard
                    entry={entry}
                    selected={sel.isSelected(entry.id)}
                    inSelectionMode={sel.mode}
                    onTap={() => {
                      if (sel.mode) sel.toggle(entry.id);
                      else onEditEntry(entry);
                    }}
                    onLongPress={() => sel.enterMode(entry.id)}
                  />
                </SwipeableRow>
              </StaggerItem>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Selection bar — portaled to body to escape transformed ancestors */}
      <Portal>
        <SelectionBar
          selectedCount={sel.selectedCount}
          onCancel={sel.clearAll}
          onDelete={handleMultiDelete}
          onArchive={handleMultiArchive}
          onSelectAll={sel.selectAll}
          total={visible.length}
        />
      </Portal>

      {/* FAB — hidden in selection mode */}
      {!sel.mode && (
        <Portal>
          <motion.button
            onClick={onAddNew}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="fixed bottom-28 right-5 z-40 w-14 h-14 rounded-2xl gradient-primary-bg text-primary-foreground shadow-glow flex items-center justify-center"
            aria-label="Add cycle entry"
          >
            <Plus size={24} />
          </motion.button>
        </Portal>
      )}

      {/* Confirm delete dialog */}
      <Portal>
        <ConfirmDialog
          open={confirmDelete.open}
          onOpenChange={(v) => setConfirmDelete((p) => ({ ...p, open: v }))}
          title={
            confirmDelete.ids.length > 1
              ? `Delete ${confirmDelete.ids.length} entries?`
              : "Delete this entry?"
          }
          description="This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={confirmDeleteAction}
        />
      </Portal>
    </div>
  );
}

/* ==================== ENTRY CARD ==================== */
function CycleEntryCard({
  entry,
  selected,
  inSelectionMode,
  onTap,
  onLongPress,
}: {
  entry: CycleEntry;
  selected: boolean;
  inSelectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const startPress = () => {
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
    }, 450);
  };
  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => () => cancelPress(), []);

  const handleClick = () => {
    // If a long-press just fired, swallow the subsequent click
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onTap();
  };

  return (
    <button
      type="button"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerMove={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClick={handleClick}
      className="block w-full text-left select-none cursor-pointer"
      aria-pressed={selected}
    >
      <SurfaceCard
        className={cn(
          "p-4 flex items-center gap-3 transition-shadow",
          selected && "ring-2 ring-inset ring-primary"
        )}
      >
        {/* Icon / type indicator */}
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
            entry.isPeriod ? "gradient-primary-bg" : "bg-surface-secondary"
          )}
        >
          {entry.isPeriod ? (
            <Droplet size={18} className="text-primary-foreground" />
          ) : (
            <Sparkles size={18} className="text-text-tertiary" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-title text-text-primary font-semibold truncate">
              {format(new Date(entry.date), "MMM d, yyyy")}
            </p>
            {entry.isPeriod ? (
              <span className="px-2 py-0.5 rounded-full gradient-primary-bg text-primary-foreground text-[10px] font-bold uppercase tracking-wide shrink-0">
                Period
              </span>
            ) : entry.symptoms.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-surface-secondary text-text-secondary text-[10px] font-bold uppercase tracking-wide shrink-0">
                Symptoms
              </span>
            ) : null}
          </div>
          <p className="text-caption text-text-secondary mt-0.5 truncate">
            {entry.isPeriod
              ? `${entry.flow ?? "light"} flow`
              : "Symptoms only"}
            {entry.symptoms.length > 0 &&
              ` · ${entry.symptoms.length} symptom${
                entry.symptoms.length === 1 ? "" : "s"
              }`}
            {entry.medication && ` · ${entry.medication}`}
          </p>
        </div>

        {/* Trailing: checkbox in selection mode, chevron otherwise */}
        {inSelectionMode ? (
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors",
              selected
                ? "gradient-primary-bg border-transparent"
                : "border-border bg-surface"
            )}
            aria-hidden
          >
            {selected && <Check size={15} className="text-primary-foreground" />}
          </div>
        ) : (
          <ChevronRight size={18} className="text-text-tertiary shrink-0" />
        )}
      </SurfaceCard>
    </button>
  );
}

/* ==================== PORTAL ==================== */
function Portal({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore avoids setState-in-effect and is SSR-safe:
  // getServerSnapshot returns false, client snapshot returns true.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* ---------- helpers ---------- */
function cnDay({
  inMonth,
  today,
  selected,
  isPeriod,
}: {
  inMonth: boolean;
  today: boolean;
  selected: boolean;
  isPeriod?: boolean;
}) {
  return cn(
    "relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all",
    isPeriod
      ? "gradient-primary-bg shadow-glow"
      : "hover:bg-surface-secondary",
    !inMonth && "opacity-35",
    selected && "ring-2 ring-primary ring-offset-2 ring-offset-surface"
  );
}
