import { create } from "zustand";
import { WALLPAPERS, WALLPAPER_KEY } from "./wallpaper-data";

export { WALLPAPERS };
export type { Wallpaper } from "./wallpaper-data";

interface WallpaperState {
  wallpaper: string;
  setWallpaper: (id: string) => void;
}

/** The pre-hydration script in layout.tsx already stamped --wallpaper, so the
 *  store only has to keep the Settings UI in sync — never the paint itself. */
export const useWallpaper = create<WallpaperState>((set) => ({
  wallpaper: "sonoma",
  setWallpaper: (id) => {
    const css = WALLPAPERS.find((w) => w.id === id)?.css;
    if (!css) return;
    document.documentElement.style.setProperty("--wallpaper", css);
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
  return "sonoma";
}
