"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CalendarDays,
  Sparkles,
  Droplet,
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
import type { CycleEntry } from "@/lib/types";
import {
  SurfaceCard,
  SectionHeader,
  IconBadge,
  EmptyState,
  AnimatedCounter,
  StaggerItem,
  Pressable,
} from "@/components/premium/primitives";
import { CycleEntryForm } from "@/components/forms/cycle-entry-form";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export function CycleTracker() {
  const reduce = useReducedMotion();
  const { cycleEntries, addCycleEntry, updateCycleEntry, deleteCycleEntry } =
    useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"calendar" | "analytics">("calendar");
  const [formOpen, setFormOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const getEntry = (d: Date) =>
    cycleEntries.find((e) => isSameDay(new Date(e.date), d));

  const selectedEntry = selectedDate ? getEntry(selectedDate) : undefined;

  const periodDays = cycleEntries.filter((e) => e.isPeriod).length;

  // symptom frequency
  const symptomCounts = React.useMemo(() => {
    const m = new Map<string, number>();
    cycleEntries.forEach((e) =>
      e.symptoms.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1))
    );
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [cycleEntries]);
  const maxCount = symptomCounts[0]?.[1] ?? 1;

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
          action={
            <Pressable
              onClick={() => setView(view === "calendar" ? "analytics" : "calendar")}
              className="w-11 h-11 rounded-2xl flex items-center justify-center border border-border bg-surface"
            >
              <TrendingUp
                size={20}
                className={view === "analytics" ? "text-primary-foreground" : "text-primary"}
              />
            </Pressable>
          }
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "calendar" ? (
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
        ) : (
          <motion.div
            key="analytics"
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
                        onClick={() => {
                          setSelectedDate(new Date(e.date));
                          setFormOpen(true);
                        }}
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
        existing={selectedEntry}
        onSave={(entry) => {
          if (selectedEntry) updateCycleEntry(selectedEntry.id, entry);
          else addCycleEntry(entry);
        }}
        onDelete={deleteCycleEntry}
      />
    </div>
  );
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
