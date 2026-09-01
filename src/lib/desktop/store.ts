import { create } from "zustand";
import type { AppId, WindowState } from "./types";
import { APPS } from "./apps-meta";

export interface MenuSpecItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  run?: () => void;
}
export type MenuSpecEntry = MenuSpecItem | "sep";

export interface ContextMenuState {
  x: number;
  y: number;
  items: MenuSpecEntry[];
}

const MENUBAR_H = 28;

type Overlay = "login" | "sleep" | "off" | null;

interface DesktopState {
  windows: WindowState[];
  topZ: number;
  bootDone: boolean;
  activeAppId: AppId | null;
  overlay: Overlay;
  contextMenu: ContextMenuState | null;
  spotlightOpen: boolean;
  toast: string | null;
  launchingApp: AppId | null;
  openApp: (appId: AppId, payload?: Record<string, string>) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  setBootDone: () => void;
  setActiveApp: (appId: AppId | null) => void;
  setOverlay: (o: Overlay) => void;
  openContextMenu: (menu: ContextMenuState) => void;
  closeContextMenu: () => void;
  setSpotlight: (open: boolean) => void;
  showToast: (msg: string) => void;
  clearLaunching: () => void;
}

function isSmall(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 820;
}

/** cascade new windows so they never land exactly on top of each other */
function placement(index: number, w: number, h: number) {
  if (typeof window === "undefined") return { x: 80, y: 60 };
  if (isSmall()) return { x: 0, y: MENUBAR_H };
  const maxX = Math.max(20, window.innerWidth - w - 20);
  const maxY = Math.max(MENUBAR_H + 10, window.innerHeight - h - 100);
  const baseX = Math.max(20, (window.innerWidth - w) / 2 - 60);
  const baseY = Math.max(MENUBAR_H + 12, (window.innerHeight - h) / 2 - 60);
  return {
    x: Math.min(maxX, baseX + index * 28),
    y: Math.min(maxY, baseY + index * 26),
  };
}

export const useDesktop = create<DesktopState>((set, get) => ({
  windows: [],
  topZ: 10,
  bootDone: false,
  activeAppId: null,
  overlay: null,
  contextMenu: null,
  spotlightOpen: false,
  toast: null,
  launchingApp: null,

  openApp: (appId, payload) => {
    const meta = APPS[appId];
    const existing = meta.multi ? undefined : get().windows.find((w) => w.appId === appId);
    if (existing) {
      // re-focus (and un-minimize) instead of spawning a duplicate
      set((s) => ({
        topZ: s.topZ + 1,
        activeAppId: appId,
        windows: s.windows.map((w) =>
          w.id === existing.id
            ? { ...w, minimized: false, z: s.topZ + 1, payload: payload ?? w.payload }
            : w,
        ),
      }));
      return;
    }
    const small = isSmall();
    const w = small ? window.innerWidth : meta.defaultSize.w;
    const h = small ? window.innerHeight - MENUBAR_H - 76 : meta.defaultSize.h;
    const { x, y } = placement(get().windows.length, w, h);
    set((s) => ({
      topZ: s.topZ + 1,
      activeAppId: appId,
      launchingApp: appId,
      contextMenu: null,
      windows: [
        ...s.windows,
        {
          id: `${appId}-${Date.now()}`,
          appId,
          title: payload?.title ?? meta.name,
          x,
          y,
          w,
          h,
          z: s.topZ + 1,
          minimized: false,
          maximized: false,
          payload,
        },
      ],
    }));
  },

  close: (id) =>
    set((s) => {
      const windows = s.windows.filter((w) => w.id !== id);
      const top = [...windows].filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
      return { windows, activeAppId: top?.appId ?? null };
    }),

  focus: (id) =>
    set((s) => {
      const target = s.windows.find((w) => w.id === id);
      if (!target || (target.z === s.topZ && !target.minimized)) return {};
      return {
        topZ: s.topZ + 1,
        activeAppId: target.appId,
        windows: s.windows.map((w) =>
          w.id === id ? { ...w, z: s.topZ + 1, minimized: false } : w,
        ),
      };
    }),

  minimize: (id) =>
    set((s) => {
      const windows = s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w));
      const top = windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
      return { windows, activeAppId: top?.appId ?? null };
    }),

  toggleMaximize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)),
    })),

  move: (id, x, y) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),

  resize: (id, w, h) =>
    set((s) => ({ windows: s.windows.map((win) => (win.id === id ? { ...win, w, h } : win)) })),

  setBootDone: () => set({ bootDone: true }),
  setActiveApp: (appId) => set({ activeAppId: appId }),
  setOverlay: (o) => set({ overlay: o, contextMenu: null, spotlightOpen: false }),
  openContextMenu: (menu) => set({ contextMenu: menu }),
  closeContextMenu: () => set({ contextMenu: null }),
  setSpotlight: (open) => set({ spotlightOpen: open, contextMenu: null }),
  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => {
      if (useDesktop.getState().toast === msg) set({ toast: null });
    }, 4200);
  },
  clearLaunching: () => set({ launchingApp: null }),
}));
