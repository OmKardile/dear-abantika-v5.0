export type ThemeId =
  | "linen"
  | "noir"
  | "sage"
  | "lavender"
  | "rose"
  | "ocean"
  | "sand";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  emoji: string;
  tagline: string;
  swatches: string[];
  isDark: boolean;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "linen",
    name: "Warm Linen",
    emoji: "🪵",
    tagline: "Cozy, earthy & calm",
    swatches: ["#C97B5C", "#E8C9B0", "#FAF6F0", "#3D2E22"],
    isDark: false,
  },
  {
    id: "noir",
    name: "Mono Noir",
    emoji: "🖤",
    tagline: "Bold high contrast",
    swatches: ["#F5F5F5", "#333333", "#1A1A1A", "#0A0A0A"],
    isDark: true,
  },
  {
    id: "sage",
    name: "Serene Sage",
    emoji: "🌿",
    tagline: "Grounded & green",
    swatches: ["#5C7C5C", "#A8C5A8", "#F5F7F5", "#2C3E2C"],
    isDark: false,
  },
  {
    id: "lavender",
    name: "Dreamy Lavender",
    emoji: "💜",
    tagline: "Soft & meditative",
    swatches: ["#7C6B9E", "#C4B5E0", "#F7F5FA", "#3E2C5C"],
    isDark: false,
  },
  {
    id: "rose",
    name: "Gentle Rose",
    emoji: "🌸",
    tagline: "Warm & tender",
    swatches: ["#C77D8F", "#F0C4D0", "#FDF5F7", "#5C2C3E"],
    isDark: false,
  },
  {
    id: "ocean",
    name: "Calm Ocean",
    emoji: "🌊",
    tagline: "Cool & clarifying",
    swatches: ["#4A7C9E", "#A8C9E0", "#F5F9FC", "#2C3E5C"],
    isDark: false,
  },
  {
    id: "sand",
    name: "Warm Sand",
    emoji: "🏖️",
    tagline: "Sun-washed & neutral",
    swatches: ["#9E7C5C", "#E0C4A8", "#FAF8F5", "#5C3E2C"],
    isDark: false,
  },
];
