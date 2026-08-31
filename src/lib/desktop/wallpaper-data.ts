export interface Wallpaper {
  id: string;
  name: string;
  css: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "sonoma",
    name: "Horizon",
    css: "linear-gradient(160deg,#2b1b4d 0%,#6d3b8f 32%,#c05a86 58%,#f0916b 80%,#ffd9a0 100%)",
  },
  {
    id: "sofia",
    name: "Sofia Night",
    css: "linear-gradient(170deg,#050b1e 0%,#0d2149 40%,#1c3f7a 70%,#2f6ea8 100%)",
  },
  {
    id: "bay",
    name: "Bay Fog",
    css: "linear-gradient(180deg,#1d2b3a 0%,#3d5a72 45%,#8aa4b3 75%,#d7c9b4 100%)",
  },
  {
    id: "graphite",
    name: "Graphite",
    css: "linear-gradient(150deg,#101014 0%,#1e1e26 50%,#2c2c38 100%)",
  },
];

export const WALLPAPER_KEY = "yavor.wallpaper";
