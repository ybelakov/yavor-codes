import type { AppId, AppMeta } from "./types";

export const APPS: Record<AppId, AppMeta> = {
  finder: { id: "finder", name: "Finder", inDock: true, defaultSize: { w: 780, h: 500 } },
  terminal: {
    id: "terminal",
    name: "Terminal",
    inDock: true,
    onDesktop: true,
    dark: true,
    defaultSize: { w: 760, h: 520 },
    minSize: { w: 420, h: 280 },
  },
  chrome: {
    id: "chrome",
    name: "Google Chrome",
    inDock: true,
    frameless: true,
    defaultSize: { w: 900, h: 600 },
    minSize: { w: 480, h: 360 },
  },
  notes: { id: "notes", name: "Notes", inDock: true, defaultSize: { w: 720, h: 480 } },
  photos: {
    id: "photos",
    name: "Photos",
    inDock: true,
    onDesktop: true,
    defaultSize: { w: 800, h: 540 },
  },
  mail: { id: "mail", name: "Mail", inDock: true, defaultSize: { w: 680, h: 460 } },
  settings: {
    id: "settings",
    name: "System Settings",
    inDock: true,
    defaultSize: { w: 640, h: 460 },
  },
  about: {
    id: "about",
    name: "About This Mac",
    inDock: false,
    defaultSize: { w: 480, h: 400 },
    fixed: true,
  },
  info: {
    id: "info",
    name: "Info",
    inDock: false,
    multi: true,
    defaultSize: { w: 300, h: 360 },
    fixed: true,
  },
};

export const DOCK_ORDER: AppId[] = [
  "finder",
  "terminal",
  "chrome",
  "notes",
  "photos",
  "mail",
  "settings",
];
