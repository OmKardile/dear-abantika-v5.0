"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Palette,
  Bell,
  Database,
  Plus,
  Check,
  Download,
  Upload,
  Shield,
  Heart,
  Clock,
  Trash2,
  Info,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import {
  REMINDER_CATEGORIES,
  WEEKDAY_LABELS,
  type Reminder,
} from "@/lib/types";
import { formatTime, downloadJson } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  IconBadge,
  EmptyState,
  StaggerItem,
  Pressable,
} from "@/components/premium/primitives";
import { ReminderForm } from "@/components/forms/reminder-form";
import { toast } from "@/hooks/use-toast";

type Tab = "theme" | "reminders" | "backup";

export function Settings() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<Tab>("theme");

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: "theme", label: "Theme", icon: Palette },
    { id: "reminders", label: "Reminders", icon: Bell },
    { id: "backup", label: "Backup", icon: Database },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader title="Settings" subtitle="Make it yours" />
      </motion.div>

      {/* Tab switcher */}
      <div className="flex p-1 rounded-full surface-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold"
          >
            {tab === t.id && (
              <motion.div
                layoutId="settings-tab"
                className="absolute inset-0 rounded-full gradient-primary-bg shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex items-center gap-1.5",
                tab === t.id ? "text-primary-foreground" : "text-text-secondary"
              )}
            >
              <t.icon size={15} />
              <span className="hidden xs:inline sm:inline">{t.label}</span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {tab === "theme" && <ThemeTab />}
          {tab === "reminders" && <RemindersTab />}
          {tab === "backup" && <BackupTab />}
        </motion.div>
      </AnimatePresence>

      {/* About */}
      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <IconBadge icon={Info} variant="soft" size={40} />
          <div>
            <p className="text-title text-text-primary">About Abantika</p>
            <p className="text-caption text-text-secondary">Version 2.0 · Premium</p>
          </div>
        </div>
        <p className="text-body text-text-secondary leading-relaxed">
          A private wellness companion. All your data lives only on this device —
          nothing is ever sent anywhere. Crafted with care for your daily rituals.
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-caption text-text-tertiary">
          Made with <Heart size={12} className="text-primary" fill="currentColor" /> for gentle days
        </div>
      </SurfaceCard>
    </div>
  );
}

/* ============== THEME TAB ============== */
function ThemeTab() {
  const { theme, setTheme } = useStore();
  return (
    <div className="space-y-4">
      <p className="text-body text-text-secondary px-1">
        Choose a palette that feels like home. Transitions are instant.
      </p>
      <div className="space-y-4">
        {THEMES.map((t, i) => {
          const active = theme === t.id;
          return (
            <StaggerItem key={t.id} index={i}>
              <Pressable
                onClick={() => setTheme(t.id)}
                className="w-full text-left"
              >
                <SurfaceCard
                  className={cn(
                    "relative overflow-hidden p-5 transition-all items-center",
                    active && "ring-2 ring-primary shadow-glow"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* mini device preview */}
                    <div
                      className="relative w-16 h-24 rounded-2xl overflow-hidden shrink-0 border"
                      style={{
                        backgroundColor: t.swatches[2],
                        borderColor: t.swatches[0] + "33",
                      }}
                    >
                      <div
                        className="absolute top-2 left-2 right-2 h-4 rounded-md"
                        style={{ backgroundColor: t.swatches[1] }}
                      />
                      <div
                        className="absolute top-8 left-2 right-2 h-6 rounded-lg"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${t.swatches[0]}, ${t.swatches[3]})`,
                        }}
                      />
                      <div className="absolute top-16 left-2 right-2 h-2 rounded-full" style={{ backgroundColor: t.swatches[1], opacity: 0.6 }} />
                      <div className="absolute top-20 left-2 w-8 h-2 rounded-full" style={{ backgroundColor: t.swatches[1], opacity: 0.4 }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.emoji}</span>
                        <p className="text-title text-text-primary">{t.name}</p>
                      </div>
                      <p className="text-caption text-text-secondary mt-0.5">
                        {t.tagline}
                      </p>
                      {/* swatches */}
                      <div className="flex gap-1.5 mt-2.5">
                        {t.swatches.map((s, idx) => (
                          <span
                            key={idx}
                            className="w-6 h-6 rounded-lg border border-border"
                            style={{ backgroundColor: s }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* active check */}
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="w-7 h-7 rounded-full gradient-primary-bg flex items-center justify-center shrink-0"
                        >
                          <Check size={16} className="text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </SurfaceCard>
              </Pressable>
            </StaggerItem>
          );
        })}
      </div>
    </div>
  );
}

/* ============== REMINDERS TAB ============== */
function RemindersTab() {
  const { reminders, addReminder, updateReminder, deleteReminder } = useStore();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | undefined>();

  const editingReminder = reminders.find((r) => r.id === editing);

  // sort by time
  const sorted = [...reminders].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-body text-text-secondary">
          {reminders.length} {reminders.length === 1 ? "reminder" : "reminders"}
        </p>
        <Pressable
          onClick={() => { setEditing(undefined); setFormOpen(true); }}
          className="px-4 py-2 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
        >
          <Plus size={15} />
          New
        </Pressable>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="No reminders yet"
          description="Add gentle nudges for water, medication, skincare or anything you'd like to remember."
          action={
            <Pressable
              onClick={() => { setEditing(undefined); setFormOpen(true); }}
              className="px-5 py-2.5 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
            >
              <Plus size={15} />
              Add reminder
            </Pressable>
          }
        />
      ) : (
        /* Timeline */
        <div className="relative pl-6">
          {/* timeline rail */}
          <div className="absolute left-[10px] top-2 bottom-2 w-0.5 bg-divider" />
          <div className="space-y-3">
            <AnimatePresence>
              {sorted.map((r, i) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {/* node */}
                  <div
                    className={cn(
                      "absolute -left-[18px] top-5 w-4 h-4 rounded-full border-2 border-background z-10",
                      r.enabled ? "gradient-primary-bg" : "bg-surface-secondary"
                    )}
                  />
                  <Pressable
                    onClick={() => { setEditing(r.id); setFormOpen(true); }}
                    className="w-full text-left"
                  >
                    <SurfaceCard className={cn("p-4", !r.enabled && "opacity-60")}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-surface-secondary flex items-center justify-center text-xl shrink-0">
                          {REMINDER_CATEGORIES.find((c) => c.id === r.category)?.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-title text-text-primary truncate">
                            {r.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-caption text-text-secondary mt-0.5">
                            <Clock size={12} />
                            {formatTime(r.time)}
                          </div>
                          <div className="flex gap-1 mt-2">
                            {WEEKDAY_LABELS.map((d, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  "text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center",
                                  r.days[idx]
                                    ? "text-primary"
                                    : "text-text-tertiary"
                                )}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateReminder(r.id, { enabled: !r.enabled });
                          }}
                          className={cn(
                            "relative w-12 h-7 rounded-full transition-colors shrink-0",
                            r.enabled ? "gradient-primary-bg" : "bg-border"
                          )}
                          aria-label={r.enabled ? "Disable" : "Enable"}
                        >
                          <motion.span
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={cn(
                              "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md",
                              r.enabled ? "left-6" : "left-1"
                            )}
                          />
                        </button>
                      </div>
                    </SurfaceCard>
                  </Pressable>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <ReminderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editingReminder}
        onSave={(r) => {
          if (editingReminder) updateReminder(editingReminder.id, r);
          else addReminder(r);
        }}
        onDelete={deleteReminder}
      />
    </div>
  );
}

/* ============== BACKUP TAB ============== */
function BackupTab() {
  const { exportData, importData, resetAll } = useStore();
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState("");

  const doExport = () => {
    const data = exportData();
    downloadJson(
      data,
      `abantika-backup-${new Date().toISOString().split("T")[0]}.json`
    );
    toast({ title: "Backup exported", description: "Your data has been saved." });
  };

  const doImport = () => {
    const ok = importData(importText);
    if (ok) {
      toast({ title: "Backup restored", description: "Welcome back." });
      setImportOpen(false);
      setImportText("");
    } else {
      toast({
        title: "Import failed",
        description: "That doesn't look like a valid backup.",
        variant: "destructive",
      });
    }
  };

  const doReset = () => {
    if (confirm("Reset all data? This cannot be undone.")) {
      resetAll();
      toast({ title: "Data reset", description: "Starting fresh." });
    }
  };

  return (
    <div className="space-y-4">
      {/* Privacy banner */}
      <SurfaceCard className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
          <Shield size={18} className="text-success" />
        </div>
        <div>
          <p className="text-title text-text-primary">Private by design</p>
          <p className="text-caption text-text-secondary mt-0.5 leading-relaxed">
            Everything stays on this device. No accounts, no servers, no tracking.
          </p>
        </div>
      </SurfaceCard>

      {/* Export */}
      <StaggerItem index={0}>
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <IconBadge icon={Download} variant="solid" size={44} />
            <div>
              <p className="text-title text-text-primary">Export backup</p>
              <p className="text-caption text-text-secondary">
                Save a JSON file of all your data
              </p>
            </div>
          </div>
          <Pressable
            onClick={doExport}
            className="w-full py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Download backup
          </Pressable>
        </SurfaceCard>
      </StaggerItem>

      {/* Import */}
      <StaggerItem index={1}>
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <IconBadge icon={Upload} variant="soft" size={44} />
            <div>
              <p className="text-title text-text-primary">Restore backup</p>
              <p className="text-caption text-text-secondary">
                Paste a previously exported JSON
              </p>
            </div>
          </div>
          <Pressable
            onClick={() => setImportOpen(true)}
            className="w-full py-3 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            Paste & restore
          </Pressable>
        </SurfaceCard>
      </StaggerItem>

      {/* Danger zone */}
      <StaggerItem index={2}>
        <SurfaceCard className="p-5 border-error/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-error/10 flex items-center justify-center">
              <Trash2 size={18} className="text-error" />
            </div>
            <div>
              <p className="text-title text-text-primary">Reset everything</p>
              <p className="text-caption text-text-secondary">
                Permanently clear all your data
              </p>
            </div>
          </div>
          <Pressable
            onClick={doReset}
            className="w-full py-3 rounded-2xl border border-error/30 text-error text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Reset all data
          </Pressable>
        </SurfaceCard>
      </StaggerItem>

      {/* Import dialog */}
      <AnimatePresence>
        {importOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setImportOpen(false)}
            />
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative w-full max-w-md rounded-[28px] surface-elevated p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-headline text-text-primary">Restore data</h2>
                <button
                  onClick={() => setImportOpen(false)}
                  className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center"
                >
                  <Plus size={18} className="rotate-45 text-text-secondary" />
                </button>
              </div>
              <p className="text-caption text-text-secondary mb-3">
                Paste your backup JSON below.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={6}
                placeholder='{"hydration": …}'
                className="w-full rounded-2xl bg-surface-secondary border border-border p-4 text-caption font-mono text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setImportOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={doImport}
                  className="flex-1 py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow"
                >
                  Restore
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
