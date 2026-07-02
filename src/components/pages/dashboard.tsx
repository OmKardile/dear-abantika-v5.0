"use client";

import * as React from "react";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import {
  Droplet,
  Smile,
  Flower2,
  Bell,
  Flame,
  Waves,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { greeting, greetingSub, formatTime } from "@/lib/helpers";
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
    const todayKey = d.toISOString().split("T")[0];
    if (hydration.current > 0 || map.has(todayKey)) {
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

  // cycle subtitle: "~N days away" when a period entry exists, else entries count / "Begin tracking"
  const cycleSubtitle = React.useMemo(() => {
    const periods = cycleEntries.filter((e) => e.isPeriod);
    if (periods.length === 0) {
      return cycleEntries.length > 0
        ? `${cycleEntries.length} ${cycleEntries.length === 1 ? "entry" : "entries"}`
        : "Begin tracking";
    }
    const sorted = [...periods].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1].date;
    const lastDate = new Date(last + "T00:00:00");
    const next = new Date(lastDate);
    next.setDate(next.getDate() + 28);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round(
      (next.getTime() - today.getTime()) / 86_400_000
    );
    if (days > 0) return `~${days} days away`;
    if (days === 0) return "due today";
    return `${cycleEntries.length} entries`;
  }, [cycleEntries]);

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
      tint: "var(--chart-4)",
      action: () => setMoodOpen(true),
    },
    {
      label: "Cycle",
      icon: Flower2,
      tint: "var(--primary)",
      action: () => onNavigate("cycle"),
    },
    {
      label: "Reminders",
      icon: Bell,
      tint: "var(--chart-3)",
      action: () => onNavigate("reminders"),
    },
  ] as const;

  return (
    <div className="space-y-4">
      {/* ===== Hero Greeting ===== */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] p-5 pb-5 text-primary-foreground gradient-primary-bg shadow-glow"
      >
        {/* floating decorative orbs */}
        <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <motion.div
          aria-hidden
          className="absolute right-4 top-4 text-2xl"
          animate={reduce ? undefined : { rotate: [0, 8, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>

        <div className="relative">
          <p className="text-label text-primary-foreground/80">
            {greeting()}
          </p>
          <p className="text-[11px] font-medium text-primary-foreground/55 mt-0.5">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="text-display mt-1">
            Hello, <span className="italic">Abantika</span>
          </h1>
          <p className="text-sm text-primary-foreground/85 mt-1.5 max-w-[18rem]">
            {greetingSub()}
          </p>

          {/* mini stats row — compact, 2 stats */}
          <div className="mt-3.5 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <Flame size={14} className="text-primary-foreground" />
              <span className="text-xs font-bold tabular-nums">{streak}</span>
              <span className="text-[10px] text-primary-foreground/70">streak</span>
            </div>
            <div className="w-px h-3 bg-primary-foreground/30" />
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <Droplet size={14} />
              <span className="text-xs font-bold tabular-nums">
                {Math.round(hydrationPct)}%
              </span>
              <span className="text-[10px] text-primary-foreground/70">water</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== Floating Quick Actions ===== */}
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <StaggerItem key={a.label} index={i}>
              <Pressable
                onClick={a.action}
                className="w-full flex flex-col items-center gap-1.5 p-2.5 rounded-[18px] surface-card active:scale-95"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${a.tint}1a`,
                    backgroundImage: `linear-gradient(135deg, ${a.tint}26, ${a.tint}0d)`,
                  }}
                >
                  <Icon size={20} style={{ color: a.tint }} strokeWidth={2.2} />
                </div>
                <span className="text-[10px] font-semibold text-text-primary leading-tight text-center">
                  {a.label}
                </span>
              </Pressable>
            </StaggerItem>
          );
        })}
      </div>

      {/* ===== Compact Wave Hydration Card ===== */}
      <StaggerItem index={1}>
        <SurfaceCard className="relative overflow-hidden p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-label text-text-tertiary">Hydration</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold text-text-primary tabular-nums">
                  <AnimatedCounter value={hydration.current} />ml
                </span>
                <span className="text-caption text-text-secondary">
                  / {hydration.goal}ml
                </span>
              </div>
            </div>
            <IconBadge icon={Droplet} variant="solid" size={36} />
          </div>

          {/* Wave progress */}
          <div className="relative h-14 rounded-2xl overflow-hidden bg-surface-secondary">
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
            <div className="relative h-full flex items-center justify-between px-3.5">
              <span className="text-xs font-bold text-primary-foreground drop-shadow-sm">
                {Math.round(hydrationPct)}%
              </span>
              <div className="flex items-center gap-1.5 text-primary-foreground/90">
                <Waves size={13} />
                <span className="text-[11px] font-medium">
                  {hydrationPct >= 100
                    ? "Goal complete!"
                    : `${hydration.goal - hydration.current}ml to go`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Pressable
              onClick={() => addWater(250)}
              className="flex-1 py-2 rounded-2xl gradient-primary-bg text-primary-foreground text-xs font-semibold shadow-glow flex items-center justify-center"
            >
              +250ml
            </Pressable>
            <Pressable
              onClick={() => addWater(500)}
              className="flex-1 py-2 rounded-2xl bg-surface-secondary text-text-primary text-xs font-semibold border border-border flex items-center justify-center"
            >
              +500ml
            </Pressable>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* ===== 2x2 Status Grid ===== */}
      <div className="grid grid-cols-2 gap-3">
        {/* Mood (top-left) */}
        <StaggerItem index={2}>
          <Pressable
            onClick={() => setMoodOpen(true)}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-4 h-full flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--chart-4)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Mood
                </span>
              </div>
              <motion.div
                animate={
                  reduce
                    ? undefined
                    : { y: [0, -4, 0], rotate: [0, 6, -6, 0] }
                }
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl text-center my-1"
              >
                {mood.current}
              </motion.div>
              <p className="text-[11px] text-text-secondary text-center">Today</p>
            </SurfaceCard>
          </Pressable>
        </StaggerItem>

        {/* Cycle (top-right) */}
        <StaggerItem index={3}>
          <Pressable
            onClick={() => onNavigate("cycle")}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-4 h-full flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Cycle
                </span>
              </div>
              <div className="flex items-center justify-center my-1">
                <Flower2 size={28} className="text-primary" strokeWidth={2} />
              </div>
              <p className="text-[11px] text-text-secondary text-center truncate">
                {cycleSubtitle}
              </p>
            </SurfaceCard>
          </Pressable>
        </StaggerItem>

        {/* Streak (bottom-left) */}
        <StaggerItem index={4}>
          <SurfaceCard className="p-4 h-full flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--chart-4)" }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Streak
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 my-1">
              <Flame size={18} className="text-primary" />
              <span className="text-2xl font-extrabold text-text-primary tabular-nums leading-none">
                <AnimatedCounter value={streak} />
              </span>
            </div>
            <p className="text-[11px] text-text-secondary text-center">
              days consistent
            </p>
          </SurfaceCard>
        </StaggerItem>

        {/* Next (bottom-right) */}
        <StaggerItem index={5}>
          <Pressable
            onClick={() => onNavigate("reminders")}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-4 h-full flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--chart-3)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Next
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary text-center my-1 line-clamp-2 leading-tight">
                {nextReminder ? nextReminder.title : "No alerts"}
              </p>
              <p className="text-[11px] text-text-secondary text-center">
                {nextReminder ? formatTime(nextReminder.time) : "Set one up"}
              </p>
            </SurfaceCard>
          </Pressable>
        </StaggerItem>
      </div>

      {/* ===== Daily Reflection ===== */}
      <StaggerItem index={6}>
        <SurfaceCard className="relative overflow-hidden p-5 text-center">
          <div
            aria-hidden
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
            style={{ background: "var(--chart-3)" }}
          />
          <div
            aria-hidden
            className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full opacity-15 blur-2xl"
            style={{ background: "var(--chart-4)" }}
          />
          <div className="relative flex flex-col items-center">
            <motion.div
              animate={
                reduce
                  ? undefined
                  : { y: [0, -4, 0], rotate: [0, 5, -5, 0] }
              }
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl mb-2.5"
            >
              🌸
            </motion.div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-2">
              Daily Reflection
            </p>
            <p className="text-sm text-text-primary leading-relaxed max-w-[20rem]">
              {TIPS[tipIdx]}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTipIdx(i)}
                  aria-label={`Reflection ${i + 1}`}
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
