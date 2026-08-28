export const THEME_NAMES = ["void", "phosphor", "amber", "paper", "outrun"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export interface ThemeTokens {
  bg: string;
  surface: string;
  raised: string;
  border: string;
  text: string;
  dim: string;
  accent: string;
  accent2: string;
  success: string;
  error: string;
  warning: string;
  glow: string;
  selectionBg: string;
  selectionText?: string;
  cursor: string;
}

export interface ThemeEffects {
  scanlines: number; // 0..1 opacity
  glow: number; // 0..1 strength
  flicker: boolean;
  vignette: number; // 0..1
}

export interface Theme {
  name: ThemeName;
  label: string;
  tagline: string;
  confirmLine: string;
  colorScheme: "dark" | "light";
  tokens: ThemeTokens;
  effects: ThemeEffects;
  backdrop: { a: string; b: string; c: string; intensity: number };
}

export const THEMES: Record<ThemeName, Theme> = {
  void: {
    name: "void",
    label: "Void",
    tagline: "modern dark violet. the theme that ships.",
    confirmLine: "void: back to black.",
    colorScheme: "dark",
    tokens: {
      bg: "#0b0b12", surface: "#12121c", raised: "#1a1a28", border: "#26263a",
      text: "#e6e6f0", dim: "#8b8ba3", accent: "#a78bfa", accent2: "#22d3ee",
      success: "#34d399", error: "#f87171", warning: "#fbbf24",
      glow: "rgba(167,139,250,0.25)", selectionBg: "rgba(167,139,250,0.30)", cursor: "#a78bfa",
    },
    effects: { scanlines: 0, glow: 0.25, flicker: false, vignette: 0.15 },
    backdrop: { a: "#2e1065", b: "#4c1d95", c: "#0e7490", intensity: 0.5 },
  },
  phosphor: {
    name: "phosphor",
    label: "Phosphor",
    tagline: "green P1 CRT. it's 1978 in here.",
    confirmLine: "phosphor: it's 1978 somewhere.",
    colorScheme: "dark",
    tokens: {
      bg: "#050a05", surface: "#0a140b", raised: "#102010", border: "#1c3a22",
      text: "#33ff66", dim: "#2fbf63", accent: "#aaffcc", accent2: "#e8ffe8",
      success: "#33ff66", error: "#ff6b5e", warning: "#d9ff5e",
      glow: "rgba(51,255,102,0.55)", selectionBg: "rgba(51,255,102,0.90)", selectionText: "#050a05", cursor: "#33ff66",
    },
    effects: { scanlines: 0.14, glow: 1, flicker: true, vignette: 0.45 },
    backdrop: { a: "#02160a", b: "#0a3d1f", c: "#1d7a3f", intensity: 0.35 },
  },
  amber: {
    name: "amber",
    label: "Amber",
    tagline: "amber P3 CRT. late-night air traffic control.",
    confirmLine: "amber: cleared for approach.",
    colorScheme: "dark",
    tokens: {
      bg: "#100a00", surface: "#1a1204", raised: "#241a08", border: "#3f2d0a",
      text: "#ffb000", dim: "#c8862a", accent: "#ffd23f", accent2: "#ffe9b8",
      success: "#ffd23f", error: "#ff5533", warning: "#ffb000",
      glow: "rgba(255,176,0,0.50)", selectionBg: "rgba(255,176,0,0.90)", selectionText: "#100a00", cursor: "#ffb000",
    },
    effects: { scanlines: 0.12, glow: 0.9, flicker: true, vignette: 0.45 },
    backdrop: { a: "#1c1000", b: "#5c3a00", c: "#8a5800", intensity: 0.35 },
  },
  paper: {
    name: "paper",
    label: "Paper",
    tagline: "printed man-page. sunlight-readable.",
    confirmLine: "paper: sunlight-readable. touch grass responsibly.",
    colorScheme: "light",
    tokens: {
      bg: "#f4eee1", surface: "#ece4d2", raised: "#e3d9c3", border: "#d4c8ac",
      text: "#2c2a26", dim: "#6b6353", accent: "#a63c0c", accent2: "#0c6478",
      success: "#166534", error: "#b91c1c", warning: "#92610a",
      glow: "rgba(166,60,12,0)", selectionBg: "rgba(166,60,12,0.22)", cursor: "#a63c0c",
    },
    effects: { scanlines: 0, glow: 0, flicker: false, vignette: 0 },
    backdrop: { a: "#f4eee1", b: "#e0d5ba", c: "#c9b98f", intensity: 0.15 },
  },
  outrun: {
    name: "outrun",
    label: "Outrun",
    tagline: "synthwave. Kavinsky on loop.",
    confirmLine: "outrun: night drive engaged.",
    colorScheme: "dark",
    tokens: {
      bg: "#150826", surface: "#1e0f33", raised: "#2a1745", border: "#3d2264",
      text: "#f5ecff", dim: "#9d86c2", accent: "#ff4fd8", accent2: "#00e5ff",
      success: "#2de6a8", error: "#ff5c7a", warning: "#ffc94d",
      glow: "rgba(255,79,216,0.40)", selectionBg: "rgba(0,229,255,0.30)", cursor: "#ff4fd8",
    },
    effects: { scanlines: 0.06, glow: 0.6, flicker: false, vignette: 0.3 },
    backdrop: { a: "#2b0a4e", b: "#a1128a", c: "#005e6b", intensity: 0.7 },
  },
};

export const DEFAULT_THEME: ThemeName = "void";
export const STORAGE_KEY = "yavor.theme";

export function isThemeName(v: unknown): v is ThemeName {
  return typeof v === "string" && (THEME_NAMES as readonly string[]).includes(v);
}

export function themeToCss(t: Theme): string {
  const k = t.tokens;
  const fx = t.effects;
  const vars = [
    `--t-bg:${k.bg}`, `--t-surface:${k.surface}`, `--t-raised:${k.raised}`,
    `--t-border:${k.border}`, `--t-text:${k.text}`, `--t-dim:${k.dim}`,
    `--t-accent:${k.accent}`, `--t-accent2:${k.accent2}`, `--t-success:${k.success}`,
    `--t-error:${k.error}`, `--t-warning:${k.warning}`, `--t-glow:${k.glow}`,
    `--t-selection-bg:${k.selectionBg}`, `--t-selection-text:${k.selectionText ?? "currentColor"}`,
    `--t-cursor:${k.cursor}`,
    `--fx-scanlines:${fx.scanlines}`, `--fx-glow:${fx.glow}`,
    `--fx-flicker:${fx.flicker ? 1 : 0}`, `--fx-vignette:${fx.vignette}`,
    `--backdrop-a:${t.backdrop.a}`, `--backdrop-b:${t.backdrop.b}`, `--backdrop-c:${t.backdrop.c}`,
    `--backdrop-intensity:${t.backdrop.intensity}`,
    `color-scheme:${t.colorScheme}`,
  ];
  return `[data-theme="${t.name}"]{${vars.join(";")}}`;
}

export const ALL_THEMES_CSS = Object.values(THEMES).map(themeToCss).join("\n");
