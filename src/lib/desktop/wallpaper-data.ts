export interface Wallpaper {
  id: string;
  name: string;
  /** `transparent` lets the painted <WallpaperArt/> layer show through */
  css: string;
  /** menu-bar foreground: light wallpapers need dark glyphs, like real macOS */
  fg: "light" | "dark";
}

export const WALLPAPERS: Wallpaper[] = [
  { id: "sequoia", name: "Sequoia", css: "transparent", fg: "dark" },
  {
    id: "sofia",
    name: "Sofia Night",
    css: "linear-gradient(170deg,#050b1e 0%,#0d2149 40%,#1c3f7a 70%,#2f6ea8 100%)",
    fg: "light",
  },
  {
    id: "horizon",
    name: "Horizon",
    css: "linear-gradient(160deg,#2b1b4d 0%,#6d3b8f 32%,#c05a86 58%,#f0916b 80%,#ffd9a0 100%)",
    fg: "light",
  },
  {
    id: "graphite",
    name: "Graphite",
    css: "linear-gradient(150deg,#101014 0%,#1e1e26 50%,#2c2c38 100%)",
    fg: "light",
  },
];

export const WALLPAPER_KEY = "yavor.wallpaper";
export const DEFAULT_WALLPAPER = "sequoia";
