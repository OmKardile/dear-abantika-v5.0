"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Droplet,
  Smile,
  Flower2,
  Bell,
  Sparkles,
  ChevronRight,
  Flame,
  Waves,
  Quote,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { greeting, greetingSub, formatTime, timeUntil } from "@/lib/helpers";
import { MOODS } from "@/lib/types";
import {
  SurfaceCard,
  IconBadge,
  StaggerItem,
  AnimatedCounter,
  Pressable,
} from "@/components/premium/primitives";
import { MoodDialog } from "@/components/forms/mood-dialog";
import type { TabId } from "@/components/app-shell";

const TIPS = [
  "Take three slow breaths. Let your shoulders drop away from your ears.",
  "A glass of water now is a small kindness to your future self.",
  "Notice one thing around you that feels quietly beautiful.",
  "Stretch your fingers, your wrists, your jaw — release what you're holding.",
  "You don't have to earn rest. It belongs to you.",
];

export function Dashboard({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const reduce = useReducedMotion();
  const {
    hydration,
    mood,
    cycleEntries,
    reminders,
    addWater,
    setMood,
  } = useStore();
  const [moodOpen, setMoodOpen] = React.useState(false);
  const [tipIdx, setTipIdx] = React.useState(() =>
    Math.floor(Math.random() * TIPS.length)
  );

  const hydrationPct = Math.min(
    (hydration.current / hydration.goal) * 100,
    100
  );

  // next enabled reminder (by soonest time today or tomorrow)
  const nextReminder = React.useMemo(() => {
    const enabled = reminders.filter((r) => r.enabled);
    if (!enabled.length) return null;
    const now = new Date();
    let best: { r: (typeof enabled)[number]; t: number } | null = null;
    for (const r of enabled) {
      const [h, m] = r.time.split(":").map(Number);
      const t = new Date();
      t.setHours(h, m, 0, 0);
      if (t <= now) t.setDate(t.getDate() + 1);
      if (!best || t.getTime() < best.t) best = { r, t: t.getTime() };
    }
    return best?.r ?? null;
  }, [reminders]);

  // hydration streak: consecutive days (incl. today) with >0 intake in history
  const streak = React.useMemo(() => {
    const map = new Map(hydration.history.map((h) => [h.date, h.amount]));
    let s = 0;
    const d = new Date();
    // today counts if current > 0
    const todayKey = d.toISOString().split("T")[0];
    if (hydration.current > 0 || map.has(todayKey)) {
      // walk back from today
      let cur = new Date(d);
      while (true) {
        const key = cur.toISOString().split("T")[0];
        const amt = key === todayKey ? hydration.current : map.get(key) ?? 0;
        if (amt > 0) {
          s++;
          cur.setDate(cur.getDate() - 1);
        } else break;
      }
    }
    return s;
  }, [hydration]);

  const quickActions = [
    {
      label: "Log Water",
      icon: Droplet,
      tint: "var(--chart-2)",
      action: () => addWater(250),
    },
    {
      label: "Log Mood",
      icon: Smile,
      tint: "var(--chart-1)",
      action: () => setMoodOpen(true),
    },
    {
      label: "Cycle",
      icon: Flower2,
      tint: "var(--chart-3)",
      action: () => onNavigate("cycle"),
    },
    {
      label: "Reminder",
      icon: Bell,
      tint: "var(--chart-4)",
      action: () => onNavigate("settings"),
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ===== Hero Greeting ===== */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] p-6 pb-7 text-primary-foreground gradient-primary-bg shadow-glow"
      >
        {/* floating decorative orbs */}
        <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-12 -left-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <motion.div
          aria-hidden
          className="absolute right-5 top-5 text-3xl"
          animate={reduce ? undefined : { rotate: [0, 8, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>

        <div className="relative">
          <p className="text-label text-primary-foreground/80">
            {greeting()}
          </p>
          <h1 className="text-display mt-1">
            Hello, <span className="italic">Abantika</span>
          </h1>
          <p className="text-body text-primary-foreground/85 mt-2 max-w-[18rem]">
            {greetingSub()}
          </p>

          {/* mini stats row */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <Flame size={16} className="text-primary-foreground" />
              <span className="text-sm font-semibold">{streak}</span>
              <span className="text-xs text-primary-foreground/70">day streak</span>
            </div>
            <div className="w-px h-4 bg-primary-foreground/30" />
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <Droplet size={16} />
              <span className="text-sm font-semibold">
                {Math.round(hydrationPct)}%
              </span>
              <span className="text-xs text-primary-foreground/70">hydrated</span>
            </div>
            <div className="w-px h-4 bg-primary-foreground/30" />
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <Flower2 size={16} />
              <span className="text-sm font-semibold">{cycleEntries.length}</span>
              <span className="text-xs text-primary-foreground/70">entries</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== Floating Quick Actions ===== */}
      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <StaggerItem key={a.label} index={i}>
              <Pressable
                onClick={a.action}
                className="w-full flex flex-col items-center gap-2.5 p-3.5 rounded-[22px] surface-card active:scale-95"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${a.tint}1a`,
                    backgroundImage: `linear-gradient(135deg, ${a.tint}26, ${a.tint}0d)`,
                  }}
                >
                  <Icon size={24} style={{ color: a.tint }} strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-semibold text-text-primary leading-tight text-center">
                  {a.label}
                </span>
              </Pressable>
            </StaggerItem>
          );
        })}
      </div>

      {/* ===== Animated Wave Hydration Card ===== */}
      <StaggerItem index={1}>
        <SurfaceCard className="relative overflow-hidden p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-label text-text-tertiary">Hydration</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-headline text-text-primary">
                  <AnimatedCounter value={hydration.current} />ml
                </span>
                <span className="text-caption text-text-secondary">
                  / {hydration.goal}ml
                </span>
              </div>
            </div>
            <IconBadge icon={Droplet} variant="solid" size={44} />
          </div>

          {/* Wave progress */}
          <div className="relative h-16 rounded-2xl overflow-hidden bg-surface-secondary">
            {/* vibrant fill */}
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: "var(--gradient-primary)" }}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${hydrationPct}%` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* subtle moving wave shimmer on top of fill */}
            <motion.div
              className="absolute inset-0"
              initial={reduce ? false : { x: "-50%" }}
              animate={reduce ? undefined : { x: ["-50%", "0%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              style={{ width: "200%" }}
            >
              <div
                className="absolute inset-y-0 left-0 w-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
                }}
              />
              <div
                className="absolute inset-y-0 left-1/2 w-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
                }}
              />
            </motion.div>
            <div className="relative h-full flex items-center justify-between px-4">
              <span className="text-sm font-bold text-primary-foreground drop-shadow-sm">
                {Math.round(hydrationPct)}%
              </span>
              <div className="flex items-center gap-1.5 text-primary-foreground/90">
                <Waves size={14} />
                <span className="text-xs font-medium">
                  {hydrationPct >= 100
                    ? "Goal complete!"
                    : `${hydration.goal - hydration.current}ml to go`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Pressable
              onClick={() => addWater(250)}
              className="flex-1 py-2.5 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center justify-center gap-1.5"
            >
              +250ml
            </Pressable>
            <Pressable
              onClick={() => addWater(500)}
              className="flex-1 py-2.5 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border flex items-center justify-center gap-1.5"
            >
              +500ml
            </Pressable>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* ===== Mood + Reminder cards ===== */}
      <div className="grid grid-cols-2 gap-4">
        <StaggerItem index={2}>
          <Pressable
            onClick={() => setMoodOpen(true)}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-5 h-full flex flex-col justify-between min-h-[140px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label text-text-tertiary">Mood</p>
                  <p className="text-caption text-text-secondary mt-0.5">
                    Today
                  </p>
                </div>
                <motion.div
                  animate={
                    reduce
                      ? undefined
                      : { y: [0, -4, 0], rotate: [0, 6, -6, 0] }
                  }
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl"
                >
                  {mood.current}
                </motion.div>
              </div>
              <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-3">
                <Smile size={13} />
                Tap to update
              </div>
            </SurfaceCard>
          </Pressable>
        </StaggerItem>

        <StaggerItem index={3}>
          <Pressable
            onClick={() => onNavigate("settings")}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-5 h-full flex flex-col justify-between min-h-[140px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label text-text-tertiary">Next up</p>
                  <p className="text-title text-text-primary mt-0.5 line-clamp-1">
                    {nextReminder ? nextReminder.title : "No reminders"}
                  </p>
                </div>
                <IconBadge icon={Bell} variant="soft" size={40} />
              </div>
              {nextReminder ? (
                <div className="mt-3">
                  <p className="text-sm font-bold text-primary">
                    {timeUntil(nextReminder.time)}
                  </p>
                  <p className="text-caption text-text-secondary">
                    {formatTime(nextReminder.time)}
                  </p>
                </div>
              ) : (
                <p className="text-caption text-text-secondary mt-3">
                  Add one in settings
                </p>
              )}
            </SurfaceCard>
          </Pressable>
        </StaggerItem>
      </div>

      {/* ===== Cycle status ===== */}
      <StaggerItem index={4}>
        <Pressable
          onClick={() => onNavigate("cycle")}
          className="w-full text-left"
        >
          <SurfaceCard className="p-5 flex items-center gap-4">
            <IconBadge icon={Flower2} variant="solid" size={48} />
            <div className="flex-1 min-w-0">
              <p className="text-label text-text-tertiary">Cycle</p>
              <p className="text-title text-text-primary truncate">
                {cycleEntries.length > 0
                  ? `${cycleEntries.length} entries logged`
                  : "Begin tracking"}
              </p>
              <p className="text-caption text-text-secondary truncate">
                {cycleEntries.length > 0
                  ? "Tap to view calendar & insights"
                  : "Gentle, private logging awaits"}
              </p>
            </div>
            <ChevronRight size={20} className="text-text-tertiary shrink-0" />
          </SurfaceCard>
        </Pressable>
      </StaggerItem>

      {/* ===== Daily encouragement ===== */}
      <StaggerItem index={5}>
        <SurfaceCard className="relative overflow-hidden p-6">
          <div
            aria-hidden
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
            style={{ background: "var(--chart-3)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <IconBadge icon={Sparkles} variant="glass" size={36} />
              <p className="text-label text-text-tertiary">Daily encouragement</p>
            </div>
            <Quote
              size={20}
              className="text-primary/40 mb-2"
              strokeWidth={2.4}
            />
            <p className="text-body text-text-primary leading-relaxed">
              {TIPS[tipIdx]}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTipIdx(i)}
                  aria-label={`Tip ${i + 1}`}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === tipIdx ? 22 : 6,
                    background:
                      i === tipIdx ? "var(--primary)" : "var(--border)",
                  }}
                />
              ))}
            </div>
          </div>
        </SurfaceCard>
      </StaggerItem>

      <MoodDialog
        open={moodOpen}
        onOpenChange={setMoodOpen}
        onSelect={(m) => setMood(m)}
      />
    </div>
  );
}
