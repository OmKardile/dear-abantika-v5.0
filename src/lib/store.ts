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
  HydrationLog,
  MoodLog,
  ThemeId,
} from "./types";

const todayStr = () => new Date().toISOString().split("T")[0];
const nowIso = () => new Date().toISOString();

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

function seedHydrationLogs(): HydrationLog[] {
  const now = Date.now();
  return [
    { id: "seed-h1", timestamp: new Date(now - 7200000).toISOString(), amount: 250 },
    { id: "seed-h2", timestamp: new Date(now - 3600000).toISOString(), amount: 500 },
  ];
}

function seedMoodLogs(): MoodLog[] {
  const now = Date.now();
  return [
    { id: "seed-m1", timestamp: new Date(now - 86400000 * 2).toISOString(), mood: "😌" },
    { id: "seed-m2", timestamp: new Date(now - 86400000).toISOString(), mood: "🥰" },
    { id: "seed-m3", timestamp: new Date(now - 3600000).toISOString(), mood: "😊" },
  ];
}

const defaultData: AppData = {
  hydration: {
    current: 750,
    goal: 2000,
    history: seedHistory(),
  },
  hydrationLogs: seedHydrationLogs(),
  moodLogs: seedMoodLogs(),
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
  // hydration logs
  addHydrationLog: (amount: number, timestamp?: string) => void;
  updateHydrationLog: (id: string, patch: Partial<HydrationLog>) => void;
  deleteHydrationLog: (id: string) => void;
  // mood
  setMood: (mood: string) => void;
  // mood logs
  addMoodLog: (mood: string, note?: string) => void;
  updateMoodLog: (id: string, patch: Partial<MoodLog>) => void;
  deleteMoodLog: (id: string) => void;
  // cycle
  addCycleEntry: (e: Omit<CycleEntry, "id">) => void;
  updateCycleEntry: (id: string, e: Partial<CycleEntry>) => void;
  deleteCycleEntry: (id: string) => void;
  archiveCycleEntry: (id: string, archived: boolean) => void;
  bulkDeleteCycleEntries: (ids: string[]) => void;
  bulkArchiveCycleEntries: (ids: string[], archived: boolean) => void;
  // journal
  addJournalEntry: (e: Omit<JournalEntry, "id">) => void;
  updateJournalEntry: (id: string, e: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  archiveJournalEntry: (id: string, archived: boolean) => void;
  bulkDeleteJournalEntries: (ids: string[]) => void;
  bulkArchiveJournalEntries: (ids: string[], archived: boolean) => void;
  // wishlist
  addWishlistItem: (i: Omit<WishlistItem, "id">) => void;
  updateWishlistItem: (id: string, i: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;
  archiveWishlistItem: (id: string, archived: boolean) => void;
  bulkDeleteWishlistItems: (ids: string[]) => void;
  bulkArchiveWishlistItems: (ids: string[], archived: boolean) => void;
  // reminders
  addReminder: (r: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, r: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  archiveReminder: (id: string, archived: boolean) => void;
  bulkDeleteReminders: (ids: string[]) => void;
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
          const log: HydrationLog = {
            id: uid(),
            timestamp: nowIso(),
            amount,
          };
          return {
            hydration: {
              ...s.hydration,
              current: next,
              history: history.slice(-14),
            },
            hydrationLogs: [log, ...s.hydrationLogs].slice(0, 200),
          };
        }),

      resetWater: () =>
        set((s) => ({ hydration: { ...s.hydration, current: 0 } })),

      setHydrationGoal: (goal) =>
        set((s) => ({ hydration: { ...s.hydration, goal } })),

      addHydrationLog: (amount, timestamp) =>
        set((s) => {
          const log: HydrationLog = {
            id: uid(),
            timestamp: timestamp ?? nowIso(),
            amount,
          };
          const today = todayStr();
          const isToday = (timestamp ?? nowIso()).startsWith(today);
          let current = s.hydration.current;
          let history = s.hydration.history;
          if (isToday) {
            current = Math.max(0, current + amount);
            const idx = history.findIndex((h) => h.date === today);
            if (idx >= 0) history = history.map((h, i) => i === idx ? { ...h, amount: current } : h);
            else history = [...history, { date: today, amount: current }];
          }
          return {
            hydrationLogs: [log, ...s.hydrationLogs].slice(0, 200),
            hydration: { ...s.hydration, current, history: history.slice(-14) },
          };
        }),

      updateHydrationLog: (id, patch) =>
        set((s) => {
          const logs = s.hydrationLogs.map((l) => (l.id === id ? { ...l, ...patch } : l));
          // recompute today's total
          const today = todayStr();
          const todays = logs.filter((l) => l.timestamp.startsWith(today));
          const current = Math.max(0, todays.reduce((a, b) => a + b.amount, 0));
          let history = s.hydration.history;
          const idx = history.findIndex((h) => h.date === today);
          if (idx >= 0) history = history.map((h, i) => i === idx ? { ...h, amount: current } : h);
          else history = [...history, { date: today, amount: current }];
          return { hydrationLogs: logs, hydration: { ...s.hydration, current, history: history.slice(-14) } };
        }),

      deleteHydrationLog: (id) =>
        set((s) => {
          const logs = s.hydrationLogs.filter((l) => l.id !== id);
          const today = todayStr();
          const todays = logs.filter((l) => l.timestamp.startsWith(today));
          const current = Math.max(0, todays.reduce((a, b) => a + b.amount, 0));
          let history = s.hydration.history;
          const idx = history.findIndex((h) => h.date === today);
          if (idx >= 0) history = history.map((h, i) => i === idx ? { ...h, amount: current } : h);
          else history = [...history, { date: today, amount: current }];
          return { hydrationLogs: logs, hydration: { ...s.hydration, current, history: history.slice(-14) } };
        }),

      setMood: (mood) =>
        set((s) => ({
          mood: { current: mood, date: todayStr() },
          moodLogs: [
            { id: uid(), timestamp: nowIso(), mood },
            ...s.moodLogs,
          ].slice(0, 200),
        })),

      addMoodLog: (mood, note) =>
        set((s) => ({
          moodLogs: [
            { id: uid(), timestamp: nowIso(), mood, note },
            ...s.moodLogs,
          ].slice(0, 200),
          mood: { current: mood, date: todayStr() },
        })),

      updateMoodLog: (id, patch) =>
        set((s) => ({
          moodLogs: s.moodLogs.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      deleteMoodLog: (id) =>
        set((s) => ({
          moodLogs: s.moodLogs.filter((m) => m.id !== id),
        })),

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
      archiveCycleEntry: (id, archived) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      bulkDeleteCycleEntries: (ids) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.filter((x) => !ids.includes(x.id)),
        })),
      bulkArchiveCycleEntries: (ids, archived) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.map((x) =>
            ids.includes(x.id) ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
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
      archiveJournalEntry: (id, archived) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      bulkDeleteJournalEntries: (ids) =>
        set((s) => ({
          journalEntries: s.journalEntries.filter((x) => !ids.includes(x.id)),
        })),
      bulkArchiveJournalEntries: (ids, archived) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((x) =>
            ids.includes(x.id) ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
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
      archiveWishlistItem: (id, archived) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      bulkDeleteWishlistItems: (ids) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.filter((x) => !ids.includes(x.id)),
        })),
      bulkArchiveWishlistItems: (ids, archived) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.map((x) =>
            ids.includes(x.id) ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
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
      archiveReminder: (id, archived) =>
        set((s) => ({
          reminders: s.reminders.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      bulkDeleteReminders: (ids) =>
        set((s) => ({
          reminders: s.reminders.filter((x) => !ids.includes(x.id)),
        })),

      exportData: () => {
        const s = get();
        const payload = {
          hydration: s.hydration,
          hydrationLogs: s.hydrationLogs,
          moodLogs: s.moodLogs,
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
            hydrationLogs: parsed.hydrationLogs ?? s.hydrationLogs,
            moodLogs: parsed.moodLogs ?? s.moodLogs,
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
        hydrationLogs: s.hydrationLogs,
        moodLogs: s.moodLogs,
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
    setHydrated(true);
  }, []);
  return hydrated;
}
