export interface CycleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flow?: "light" | "medium" | "heavy";
  symptoms: string[];
  weight?: number;
  bbt?: number;
  medication?: string;
  notes?: string;
  archived?: boolean;
  archivedAt?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  mood: string;
  reflection: string;
  sticker?: string;
  archived?: boolean;
  archivedAt?: string;
}

export type WishlistCategory =
  | "save-later"
  | "urgent"
  | "dream"
  | "for-him";

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  category: WishlistCategory;
  notes?: string;
  link?: string;
  image?: string;
  archived?: boolean;
  archivedAt?: string;
}

export type ReminderCategory =
  | "medication"
  | "water"
  | "skincare"
  | "general";

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:mm
  category: ReminderCategory;
  days: boolean[]; // 7, Sunday=0
  enabled: boolean;
  archived?: boolean;
  archivedAt?: string;
}

export interface HydrationHistoryPoint {
  date: string;
  amount: number;
}

export interface HydrationLog {
  id: string;
  timestamp: string; // ISO
  amount: number; // ml (can be negative for removal)
}

export interface MoodLog {
  id: string;
  timestamp: string; // ISO
  mood: string;
  note?: string;
}

export interface AppData {
  hydration: {
    current: number;
    goal: number;
    history: HydrationHistoryPoint[];
  };
  hydrationLogs: HydrationLog[];
  moodLogs: MoodLog[];
  mood: {
    current: string;
    date: string;
  };
  cycleEntries: CycleEntry[];
  journalEntries: JournalEntry[];
  wishlistItems: WishlistItem[];
  reminders: Reminder[];
}

export type SortOption =
  | "newest"
  | "oldest"
  | "alpha"
  | "modified";

export const SYMPTOMS = [
  "Cramps",
  "Bloating",
  "Acne",
  "Fatigue",
  "Headache",
  "Mood Swings",
  "Sugar Cravings",
  "Hair Thinning",
  "Hirsutism",
  "Sleep Issues",
  "Skin Darkening",
] as const;

export const MOODS = [
  "😊", "😄", "😌", "😔", "😢", "😴", "🥰", "😤", "🤗", "😇",
];

export const MOOD_FILTERS = [
  "All", "😊", "😌", "😔", "😤", "😴", "🥰", "😰", "😎",
];

export const STICKERS = [
  "🌟", "🌸", "💫", "🦋", "🌙", "✨", "🌷", "🍃", "🌈", "💝",
];

export const WISHLIST_CATEGORIES: {
  id: WishlistCategory;
  label: string;
  emoji: string;
}[] = [
  { id: "save-later", label: "Save for Later", emoji: "📌" },
  { id: "urgent", label: "Urgent Need", emoji: "⚡" },
  { id: "dream", label: "Dream Cart", emoji: "✨" },
  { id: "for-him", label: "For Him", emoji: "💙" },
];

export const REMINDER_CATEGORIES: {
  id: ReminderCategory;
  label: string;
  emoji: string;
}[] = [
  { id: "medication", label: "Medication", emoji: "💊" },
  { id: "water", label: "Water", emoji: "💧" },
  { id: "skincare", label: "Skincare", emoji: "✨" },
  { id: "general", label: "General Care", emoji: "🌸" },
];

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  alpha: "A → Z",
  modified: "Recently updated",
};
