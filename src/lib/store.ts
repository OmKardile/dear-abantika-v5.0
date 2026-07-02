"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as React from "react";
import type {
  AppData,
  CycleEntry,
  JournalEntry,
  WishlistItem,
  Reminder,
  ThemeId,
} from "./types";

const todayStr = () => new Date().toISOString().split("T")[0];

function seedHistory(): { date: string; amount: number }[] {
  const out: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toISOString().split("T")[0],
      amount: [1600, 1800, 1400, 2200, 1900, 1750][i - 1] ?? 1500,
    });
  }
  return out;
}

const defaultData: AppData = {
  hydration: {
    current: 750,
    goal: 2000,
    history: seedHistory(),
  },
  mood: { current: "😊", date: todayStr() },
  cycleEntries: [],
  journalEntries: [
    {
      id: "seed-j1",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      title: "A slow, gentle morning",
      mood: "😌",
      reflection:
        "Woke up without an alarm and let the light pour in slowly. Sometimes the simplest mornings are the ones I needed most.",
      sticker: "🌙",
    },
    {
      id: "seed-j2",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      title: "Grateful for small things",
      mood: "🥰",
      reflection:
        "Warm tea, a good book, and quiet — I'm learning that rest is productive too.",
      sticker: "✨",
    },
  ],
  wishlistItems: [
    {
      id: "seed-w1",
      title: "Silk pillowcase",
      description: "Mulberry silk, blush pink — kinder to skin and hair.",
      category: "dream",
      notes: "King size",
    },
    {
      id: "seed-w2",
      title: "Ceramic pour-over set",
      description: "Hand-thrown stoneware for slow weekend rituals.",
      category: "save-later",
    },
  ],
  reminders: [
    {
      id: "seed-r1",
      title: "Morning vitamins",
      time: "08:00",
      category: "medication",
      days: [false, true, true, true, true, true, false],
      enabled: true,
    },
    {
      id: "seed-r2",
      title: "Drink water",
      time: "10:00",
      category: "water",
      days: [false, true, true, true, true, true, false],
      enabled: true,
    },
    {
      id: "seed-r3",
      title: "Evening skincare",
      time: "21:00",
      category: "skincare",
      days: [true, true, true, true, true, true, true],
      enabled: false,
    },
  ],
};

interface StoreState extends AppData {
  theme: ThemeId;
  // theme
  setTheme: (t: ThemeId) => void;
  // hydration
  addWater: (amount: number) => void;
  resetWater: () => void;
  setHydrationGoal: (goal: number) => void;
  // mood
  setMood: (mood: string) => void;
  // cycle
  addCycleEntry: (e: Omit<CycleEntry, "id">) => void;
  updateCycleEntry: (id: string, e: Partial<CycleEntry>) => void;
  deleteCycleEntry: (id: string) => void;
  // journal
  addJournalEntry: (e: Omit<JournalEntry, "id">) => void;
  updateJournalEntry: (id: string, e: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  // wishlist
  addWishlistItem: (i: Omit<WishlistItem, "id">) => void;
  updateWishlistItem: (id: string, i: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;
  // reminders
  addReminder: (r: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, r: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  // backup
  exportData: () => string;
  importData: (json: string) => boolean;
  resetAll: () => void;
}

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...defaultData,
      theme: "linen",

      setTheme: (theme) => set({ theme }),

      addWater: (amount) =>
        set((s) => {
          const today = todayStr();
          const next = Math.max(0, s.hydration.current + amount);
          const history = [...s.hydration.history];
          const idx = history.findIndex((h) => h.date === today);
          if (idx >= 0) history[idx] = { date: today, amount: next };
          else history.push({ date: today, amount: next });
          return {
            hydration: {
              ...s.hydration,
              current: next,
              history: history.slice(-14),
            },
          };
        }),

      resetWater: () =>
        set((s) => ({
          hydration: { ...s.hydration, current: 0 },
        })),

      setHydrationGoal: (goal) =>
        set((s) => ({ hydration: { ...s.hydration, goal } })),

      setMood: (mood) =>
        set(() => ({ mood: { current: mood, date: todayStr() } })),

      addCycleEntry: (e) =>
        set((s) => ({
          cycleEntries: [...s.cycleEntries, { ...e, id: uid() }],
        })),
      updateCycleEntry: (id, e) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.map((x) =>
            x.id === id ? { ...x, ...e } : x
          ),
        })),
      deleteCycleEntry: (id) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.filter((x) => x.id !== id),
        })),

      addJournalEntry: (e) =>
        set((s) => ({
          journalEntries: [{ ...e, id: uid() }, ...s.journalEntries],
        })),
      updateJournalEntry: (id, e) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((x) =>
            x.id === id ? { ...x, ...e } : x
          ),
        })),
      deleteJournalEntry: (id) =>
        set((s) => ({
          journalEntries: s.journalEntries.filter((x) => x.id !== id),
        })),

      addWishlistItem: (i) =>
        set((s) => ({
          wishlistItems: [...s.wishlistItems, { ...i, id: uid() }],
        })),
      updateWishlistItem: (id, i) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.map((x) =>
            x.id === id ? { ...x, ...i } : x
          ),
        })),
      deleteWishlistItem: (id) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.filter((x) => x.id !== id),
        })),

      addReminder: (r) =>
        set((s) => ({
          reminders: [...s.reminders, { ...r, id: uid() }],
        })),
      updateReminder: (id, r) =>
        set((s) => ({
          reminders: s.reminders.map((x) =>
            x.id === id ? { ...x, ...r } : x
          ),
        })),
      deleteReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.filter((x) => x.id !== id),
        })),

      exportData: () => {
        const s = get();
        const payload = {
          hydration: s.hydration,
          mood: s.mood,
          cycleEntries: s.cycleEntries,
          journalEntries: s.journalEntries,
          wishlistItems: s.wishlistItems,
          reminders: s.reminders,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(payload, null, 2);
      },

      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          set((s) => ({
            hydration: parsed.hydration ?? s.hydration,
            mood: parsed.mood ?? s.mood,
            cycleEntries: parsed.cycleEntries ?? [],
            journalEntries: parsed.journalEntries ?? [],
            wishlistItems: parsed.wishlistItems ?? [],
            reminders: parsed.reminders ?? [],
          }));
          return true;
        } catch {
          return false;
        }
      },

      resetAll: () =>
        set(() => ({
          ...defaultData,
          theme: get().theme,
        })),
    }),
    {
      name: "abantika-wellness-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        hydration: s.hydration,
        mood: s.mood,
        cycleEntries: s.cycleEntries,
        journalEntries: s.journalEntries,
        wishlistItems: s.wishlistItems,
        reminders: s.reminders,
      }),
    }
  )
);

/** Hook that tracks whether the persisted store has hydrated on the client. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    // zustand persist hydrates synchronously for localStorage, but ensure client-only
    setHydrated(true);
  }, []);
  return hydrated;
}
