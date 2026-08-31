import { create } from "zustand";
import { DEFAULT_WALLPAPER, WALLPAPERS, WALLPAPER_KEY } from "./wallpaper-data";

export { WALLPAPERS };
export type { Wallpaper } from "./wallpaper-data";

interface WallpaperState {
  wallpaper: string;
  setWallpaper: (id: string) => void;
}

/** The pre-hydration script in layout.tsx already stamped --wallpaper, so the
 *  store only has to keep the Settings UI in sync — never the paint itself. */
export const useWallpaper = create<WallpaperState>((set) => ({
  wallpaper: DEFAULT_WALLPAPER,
  setWallpaper: (id) => {
    const wp = WALLPAPERS.find((w) => w.id === id);
    if (!wp) return;
    document.documentElement.style.setProperty("--wallpaper", wp.css);
    document.documentElement.dataset.wpfg = wp.fg;
    try {
      localStorage.setItem(WALLPAPER_KEY, id);
    } catch {}
    set({ wallpaper: id });
  },
}));

export function readStoredWallpaper(): string {
  try {
    const v = localStorage.getItem(WALLPAPER_KEY);
    if (v && WALLPAPERS.some((w) => w.id === v)) return v;
  } catch {}
  return DEFAULT_WALLPAPER;
}
