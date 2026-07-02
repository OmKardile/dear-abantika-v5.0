"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookHeart,
  ShoppingBag,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  Pin,
  Zap,
  Sparkles,
  Heart,
} from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";
import {
  MOOD_FILTERS,
  WISHLIST_CATEGORIES,
  type WishlistCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  Chip,
  EmptyState,
  StaggerItem,
  Pressable,
  IconBadge,
} from "@/components/premium/primitives";
import { DiaryEntryForm } from "@/components/forms/diary-entry-form";
import { WishlistItemForm } from "@/components/forms/wishlist-item-form";

export function Journal() {
  const [tab, setTab] = React.useState<"diary" | "wishlist">("diary");
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader title="Journal" subtitle="Your private space" />
      </motion.div>

      {/* Tab switcher */}
      <div className="relative flex p-1 rounded-full surface-card">
        {(["diary", "wishlist"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          >
            {tab === t && (
              <motion.div
                layoutId="journal-tab"
                className="absolute inset-0 rounded-full gradient-primary-bg shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex items-center gap-2",
                tab === t
                  ? "text-primary-foreground"
                  : "text-text-secondary"
              )}
            >
              {t === "diary" ? <BookHeart size={16} /> : <ShoppingBag size={16} />}
              {t === "diary" ? "My Diary" : "Wishlist"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "diary" ? (
          <motion.div
            key="diary"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Diary />
          </motion.div>
        ) : (
          <motion.div
            key="wishlist"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
          >
            <Wishlist />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============== DIARY ============== */
function Diary() {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } =
    useStore();
  const [search, setSearch] = React.useState("");
  const [moodFilter, setMoodFilter] = React.useState("All");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | undefined>();

  const filtered = journalEntries.filter((e) => {
    const ms =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.reflection.toLowerCase().includes(search.toLowerCase());
    const mm = moodFilter === "All" || e.mood === moodFilter;
    return ms && mm;
  });

  const editingEntry = journalEntries.find((e) => e.id === editing);

  return (
    <div className="space-y-5">
      {/* Search */}
      <SurfaceCard className="flex items-center gap-3 px-4 py-3">
        <Search size={18} className="text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your thoughts…"
          className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-caption text-text-tertiary"
          >
            Clear
          </button>
        )}
      </SurfaceCard>

      {/* Mood filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {MOOD_FILTERS.map((m) => (
          <Chip
            key={m}
            active={moodFilter === m}
            onClick={() => setMoodFilter(m)}
          >
            {m === "All" ? "All" : m}
          </Chip>
        ))}
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="📔"
          title={
            search || moodFilter !== "All"
              ? "No matches found"
              : "Start writing"
          }
          description={
            search || moodFilter !== "All"
              ? "Try a different search or mood filter."
              : "Your first reflection is waiting. Be gentle, be honest."
          }
          action={
            !search && moodFilter === "All" ? (
              <Pressable
                onClick={() => {
                  setEditing(undefined);
                  setFormOpen(true);
                }}
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
          <AnimatePresence>
            {filtered.map((entry, i) => (
              <StaggerItem key={entry.id} index={i}>
                <Pressable
                  onClick={() => {
                    setEditing(entry.id);
                    setFormOpen(true);
                  }}
                  className="w-full text-left"
                >
                  <SurfaceCard className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <motion.span
                          className="text-3xl shrink-0"
                          whileHover={{ scale: 1.15, rotate: 6 }}
                        >
                          {entry.mood}
                        </motion.span>
                        <div className="min-w-0">
                          <h3 className="text-title text-text-primary truncate">
                            {entry.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-caption text-text-secondary mt-0.5">
                            <Calendar size={12} />
                            {format(new Date(entry.date), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      {entry.sticker && (
                        <motion.span
                          className="text-2xl shrink-0"
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                        >
                          {entry.sticker}
                        </motion.span>
                      )}
                    </div>
                    <p className="text-body text-text-secondary leading-relaxed line-clamp-3">
                      {entry.reflection}
                    </p>
                  </SurfaceCard>
                </Pressable>
              </StaggerItem>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* FAB */}
      <FAB onClick={() => { setEditing(undefined); setFormOpen(true); }} />

      <DiaryEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editingEntry}
        onSave={(e) => {
          if (editingEntry) updateJournalEntry(editingEntry.id, e);
          else addJournalEntry(e);
        }}
        onDelete={deleteJournalEntry}
      />
    </div>
  );
}

/* ============== WISHLIST ============== */
const CAT_ICONS: Record<WishlistCategory, React.ComponentType<{ size?: number }>> = {
  "save-later": Pin,
  urgent: Zap,
  dream: Sparkles,
  "for-him": Heart,
};

function Wishlist() {
  const {
    wishlistItems,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
  } = useStore();
  const [cat, setCat] = React.useState<WishlistCategory>("dream");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | undefined>();

  const items = wishlistItems.filter((i) => i.category === cat);
  const editingItem = wishlistItems.find((i) => i.id === editing);

  return (
    <div className="space-y-5">
      {/* Category tabs */}
      <div className="grid grid-cols-2 gap-3">
        {WISHLIST_CATEGORIES.map((c) => {
          const count = wishlistItems.filter((i) => i.category === c.id).length;
          const active = cat === c.id;
          return (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCat(c.id)}
              className={cn(
                "relative overflow-hidden rounded-[22px] p-4 text-left border transition-all",
                active
                  ? "gradient-primary-bg text-primary-foreground border-transparent shadow-glow"
                  : "bg-surface text-text-primary border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{c.emoji}</span>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    active ? "bg-white/20" : "bg-surface-secondary text-text-secondary"
                  )}
                >
                  {count}
                </span>
              </div>
              <p className="text-sm font-semibold mt-2">{c.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <EmptyState
          emoji="🛍️"
          title="Nothing here yet"
          description="Curate the things you love. Tap below to add your first inspiration."
          action={
            <Pressable
              onClick={() => { setEditing(undefined); setFormOpen(true); }}
              className="px-5 py-2.5 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
            >
              <Plus size={15} />
              Add item
            </Pressable>
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <StaggerItem key={item.id} index={i}>
                <Pressable
                  onClick={() => { setEditing(item.id); setFormOpen(true); }}
                  className="w-full text-left"
                >
                  <SurfaceCard className="overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {/* image */}
                      <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden bg-surface-secondary flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Sparkles size={26} className="text-text-tertiary opacity-50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-title text-text-primary truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-caption text-text-secondary line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-caption text-text-tertiary line-clamp-1 mt-1.5">
                            💭 {item.notes}
                          </p>
                        )}
                        {item.link && (
                          <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary">
                            <ExternalLink size={12} />
                            View link
                          </span>
                        )}
                      </div>
                    </div>
                  </SurfaceCard>
                </Pressable>
              </StaggerItem>
            ))}
          </AnimatePresence>
        </div>
      )}

      <FAB onClick={() => { setEditing(undefined); setFormOpen(true); }} />

      <WishlistItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultCategory={cat}
        existing={editingItem}
        onSave={(i) => {
          if (editingItem) updateWishlistItem(editingItem.id, i);
          else addWishlistItem(i);
        }}
        onDelete={deleteWishlistItem}
      />
    </div>
  );
}

/* ============== FAB ============== */
function FAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className="fixed bottom-28 right-5 z-40 w-14 h-14 rounded-2xl gradient-primary-bg text-primary-foreground shadow-glow flex items-center justify-center"
      aria-label="Add"
    >
      <Plus size={24} />
    </motion.button>
  );
}
