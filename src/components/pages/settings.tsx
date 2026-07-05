"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Palette,
  Bell,
  Database,
  Archive as ArchiveIcon,
  Plus,
  Check,
  Download,
  Upload,
  Shield,
  Heart,
  Trash2,
  Info,
  ArchiveRestore,
  Droplet,
  Sparkles,
  BookHeart,
  ShoppingBag,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import {
  REMINDER_CATEGORIES,
  type Reminder,
  type CycleEntry,
  type JournalEntry,
  type WishlistItem,
} from "@/lib/types";
import { formatTime, downloadJson, readJsonFile } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  IconBadge,
  EmptyState,
  StaggerItem,
  Pressable,
} from "@/components/premium/primitives";
import { ConfirmDialog } from "@/components/premium/confirm-dialog";
import { Portal } from "@/components/premium/portal";
import { toast } from "@/hooks/use-toast";

type Tab = "theme" | "backup" | "archive";

export function Settings() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<Tab>("theme");

  const tabs: {
    id: Tab;
    label: string;
    short: string;
    icon: React.ComponentType<{ size?: number }>;
  }[] = [
    { id: "theme", label: "Theme", short: "Theme", icon: Palette },
    { id: "backup", label: "Backup", short: "Backup", icon: Database },
    { id: "archive", label: "Archive", short: "Archive", icon: ArchiveIcon },
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
            className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold min-w-0"
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
                "relative z-10 flex items-center gap-1.5 min-w-0",
                tab === t.id ? "text-primary-foreground" : "text-text-secondary"
              )}
            >
              <t.icon size={15} />
              <span className="hidden xs:inline sm:inline truncate">{t.short}</span>
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
          {tab === "backup" && <BackupTab />}
          {tab === "archive" && <ArchiveTab />}
        </motion.div>
      </AnimatePresence>

      {/* About */}
      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <IconBadge icon={Info} variant="soft" size={40} />
          <div>
            <p className="text-title text-text-primary">About Abantika</p>
            <p className="text-caption text-text-secondary">Version 3.5 · Premium</p>
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

/* ============== ARCHIVE TAB ============== */
function ArchiveTab() {
  const {
    cycleEntries,
    journalEntries,
    wishlistItems,
    reminders,
    archiveCycleEntry,
    deleteCycleEntry,
    archiveJournalEntry,
    deleteJournalEntry,
    archiveWishlistItem,
    deleteWishlistItem,
    archiveReminder,
    deleteReminder,
  } = useStore();

  const [confirmDelete, setConfirmDelete] = React.useState<{
    open: boolean;
    type: "cycle" | "journal" | "wishlist" | "reminder";
    id: string;
  } | null>(null);
  const [confirmEmptyAll, setConfirmEmptyAll] = React.useState(false);

  const archivedCycles = cycleEntries.filter((e) => e.archived);
  const archivedJournals = journalEntries.filter((e) => e.archived);
  const archivedWishlist = wishlistItems.filter((e) => e.archived);
  const archivedReminders = reminders.filter((e) => e.archived);

  const sections = [
    { type: "cycle" as const, label: "Cycle entries", emoji: "🌸", items: archivedCycles },
    { type: "journal" as const, label: "Journal entries", emoji: "📔", items: archivedJournals },
    { type: "wishlist" as const, label: "Wishlist items", emoji: "🛍️", items: archivedWishlist },
    { type: "reminder" as const, label: "Reminders", emoji: "🔔", items: archivedReminders },
  ].filter((s) => s.items.length > 0);

  const totalCount =
    archivedCycles.length +
    archivedJournals.length +
    archivedWishlist.length +
    archivedReminders.length;

  const handleRestore = (
    type: "cycle" | "journal" | "wishlist" | "reminder",
    id: string
  ) => {
    switch (type) {
      case "cycle":
        archiveCycleEntry(id, false);
        break;
      case "journal":
        archiveJournalEntry(id, false);
        break;
      case "wishlist":
        archiveWishlistItem(id, false);
        break;
      case "reminder":
        archiveReminder(id, false);
        break;
    }
    toast({ title: "Restored" });
  };

  const handlePermanentDelete = (
    type: "cycle" | "journal" | "wishlist" | "reminder",
    id: string
  ) => {
    setConfirmDelete({ open: true, type, id });
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    switch (type) {
      case "cycle":
        deleteCycleEntry(id);
        break;
      case "journal":
        deleteJournalEntry(id);
        break;
      case "wishlist":
        deleteWishlistItem(id);
        break;
      case "reminder":
        deleteReminder(id);
        break;
    }
    setConfirmDelete(null);
    toast({ title: "Permanently deleted" });
  };

  const handleEmptyAll = () => {
    setConfirmEmptyAll(true);
  };

  const confirmEmptyAllAction = () => {
    archivedCycles.forEach((e) => deleteCycleEntry(e.id));
    archivedJournals.forEach((e) => deleteJournalEntry(e.id));
    archivedWishlist.forEach((e) => deleteWishlistItem(e.id));
    archivedReminders.forEach((e) => deleteReminder(e.id));
    setConfirmEmptyAll(false);
    toast({ title: "Archive emptied" });
  };

  if (totalCount === 0) {
    return (
      <EmptyState
        emoji="🗂️"
        title="Nothing archived"
        description="Archived items rest here until you restore or delete them."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-body text-text-secondary">
          {totalCount} archived {totalCount === 1 ? "item" : "items"}
        </p>
      </div>

      {sections.map((section, sIdx) => (
        <StaggerItem key={section.type} index={sIdx}>
          <SurfaceCard className="p-5">
            <SectionHeader
              title={section.label}
              subtitle={`${section.items.length} archived`}
              className="mb-4"
            />
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {section.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ArchivedItemRow
                      type={section.type}
                      item={item}
                      onRestore={() => handleRestore(section.type, item.id)}
                      onDelete={() =>
                        handlePermanentDelete(section.type, item.id)
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SurfaceCard>
        </StaggerItem>
      ))}

      {/* Empty archive button */}
      <StaggerItem index={sections.length}>
        <SurfaceCard className="p-5 border-error/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-error/10 flex items-center justify-center">
              <Trash2 size={18} className="text-error" />
            </div>
            <div>
              <p className="text-title text-text-primary">Empty archive</p>
              <p className="text-caption text-text-secondary">
                Permanently delete all {totalCount} archived items
              </p>
            </div>
          </div>
          <Pressable
            onClick={handleEmptyAll}
            className="w-full py-3 rounded-2xl border border-error/30 text-error text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Empty archive
          </Pressable>
        </SurfaceCard>
      </StaggerItem>

      {/* Confirm single permanent delete */}
      <Portal>
        <ConfirmDialog
          open={!!confirmDelete}
          onOpenChange={(v) => {
            if (!v) setConfirmDelete(null);
          }}
          title="Delete permanently?"
          description="This item will be gone for good. This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={confirmDeleteAction}
        />
      </Portal>

      {/* Confirm empty all */}
      <Portal>
        <ConfirmDialog
          open={confirmEmptyAll}
          onOpenChange={setConfirmEmptyAll}
          title={`Delete all ${totalCount} archived items?`}
          description="This will permanently remove every archived item across your app. This cannot be undone."
          confirmLabel="Empty archive"
          variant="destructive"
          onConfirm={confirmEmptyAllAction}
        />
      </Portal>
    </div>
  );
}

function ArchivedItemRow({
  type,
  item,
  onRestore,
  onDelete,
}: {
  type: "cycle" | "journal" | "wishlist" | "reminder";
  item: CycleEntry | JournalEntry | WishlistItem | Reminder;
  onRestore: () => void;
  onDelete: () => void;
}) {
  // Derive title/description and archived-ago text per type
  let title = "";
  let subtitle = "";
  let emoji = "";
  let icon: React.ComponentType<{ size?: number; className?: string }> = Sparkles;

  const archivedAt =
    (item as { archivedAt?: string }).archivedAt ??
    (item as { date?: string }).date ??
    "";

  if (type === "cycle") {
    const e = item as CycleEntry;
    title = e.date;
    subtitle = e.isPeriod
      ? `Period · ${e.flow ?? "light"} flow`
      : e.symptoms.length > 0
      ? `${e.symptoms.length} symptom${e.symptoms.length === 1 ? "" : "s"}`
      : "Symptoms only";
    emoji = "🌸";
    icon = Droplet;
  } else if (type === "journal") {
    const e = item as JournalEntry;
    title = e.title;
    subtitle = e.reflection.slice(0, 60) + (e.reflection.length > 60 ? "…" : "");
    emoji = "📔";
    icon = BookHeart;
  } else if (type === "wishlist") {
    const e = item as WishlistItem;
    title = e.title;
    subtitle = e.description || "No description";
    emoji = "🛍️";
    icon = ShoppingBag;
  } else {
    const e = item as Reminder;
    title = e.title;
    subtitle = `${formatTime(e.time)} · ${
      REMINDER_CATEGORIES.find((c) => c.id === e.category)?.label ?? "Reminder"
    }`;
    emoji = "🔔";
    icon = Bell;
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary">
      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-xl shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body text-text-primary font-semibold truncate">
          {title}
        </p>
        <p className="text-caption text-text-secondary truncate mt-0.5">
          {subtitle}
        </p>
        <p className="text-label text-text-tertiary mt-1">
          archived {archivedAt ? archivedAgo(archivedAt) : "earlier"}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <Pressable
          onClick={onRestore}
          className="px-3 py-1.5 rounded-xl bg-surface border border-border text-primary text-caption font-semibold flex items-center gap-1"
        >
          <ArchiveRestore size={13} />
          Restore
        </Pressable>
        <Pressable
          onClick={onDelete}
          className="px-3 py-1.5 rounded-xl border border-error/30 text-error text-caption font-semibold flex items-center gap-1"
        >
          <Trash2 size={13} />
          Delete
        </Pressable>
      </div>
    </div>
  );
}

function archivedAgo(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = now - then;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "1d ago";
    if (d < 7) return `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w === 1) return "1w ago";
    if (w < 5) return `${w}w ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return "earlier";
  }
}

/* ============== BACKUP TAB ============== */
function BackupTab() {
  const { exportData, importData, resetAll } = useStore();
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState("");
  const [exporting, setExporting] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const doExport = async () => {
    setExporting(true);
    try {
      const data = exportData();
      const filename = `abantika-backup-${new Date().toISOString().split("T")[0]}.json`;
      const result = await downloadJson(data, filename);
      if (!result.success) {
        toast({
          title: "Export cancelled",
          description: "No file was saved.",
        });
      } else if (result.method === "share") {
        toast({
          title: "Backup shared",
          description: "Save it to Files or send it somewhere safe.",
        });
      } else if (result.method === "clipboard") {
        toast({
          title: "Backup copied",
          description: "JSON copied to clipboard — paste into a notes app to save.",
        });
      } else {
        toast({
          title: "Backup exported",
          description: "Your data has been saved.",
        });
      }
    } catch {
      toast({
        title: "Export failed",
        description: "Something went wrong. Try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readJsonFile(file);
      const ok = importData(text);
      if (ok) {
        toast({ title: "Backup restored", description: "Welcome back." });
        setImportOpen(false);
        setImportText("");
      } else {
        toast({
          title: "Import failed",
          description: "That file doesn't look like a valid backup.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Import failed",
        description: "Could not read that file.",
        variant: "destructive",
      });
    }
    // reset input so the same file can be picked again
    e.target.value = "";
  };

  const doImportPaste = () => {
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
    setConfirmReset(true);
  };

  const confirmResetAction = () => {
    resetAll();
    setConfirmReset(false);
    toast({ title: "Data reset", description: "Starting fresh." });
  };

  return (
    <div className="space-y-4">
      {/* hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFilePick}
        className="hidden"
        aria-hidden
      />

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
            disabled={exporting}
            className="w-full py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Download size={16} />
            {exporting ? "Preparing…" : "Download backup"}
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
                Choose a file or paste JSON
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Pressable
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Choose file
            </Pressable>
            <Pressable
              onClick={() => setImportOpen(true)}
              className="flex-1 py-3 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border flex items-center justify-center gap-2"
            >
              Paste JSON
            </Pressable>
          </div>
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

      {/* Import dialog — portaled to body so it sits above the nav */}
      <Portal>
        <AnimatePresence>
          {importOpen && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                onClick={() => setImportOpen(false)}
              />
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="relative w-full max-w-md rounded-[28px] glass-sheet p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-label text-text-tertiary">Restore</p>
                    <h2 className="text-headline-serif text-text-primary">Paste JSON</h2>
                  </div>
                  <button
                    onClick={() => setImportOpen(false)}
                    className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center"
                    aria-label="Close"
                  >
                    <Plus size={18} className="rotate-45 text-text-secondary" />
                  </button>
                </div>
                <p className="text-caption text-text-secondary mb-3">
                  Paste your backup JSON below, or close this and use{" "}
                  <span className="font-semibold text-primary">Choose file</span>.
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
                    onClick={doImportPaste}
                    disabled={!importText.trim()}
                    className="flex-1 py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow disabled:opacity-50"
                  >
                    Restore
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Reset confirmation — portaled */}
      <Portal>
        <ConfirmDialog
          open={confirmReset}
          onOpenChange={setConfirmReset}
          title="Reset all data?"
          description="This permanently deletes every entry, log, and reminder on this device. Export a backup first if you want to keep it. This cannot be undone."
          confirmLabel="Reset everything"
          cancelLabel="Keep my data"
          variant="destructive"
          onConfirm={confirmResetAction}
        />
      </Portal>
    </div>
  );
}

