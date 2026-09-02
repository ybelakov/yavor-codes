"use client";

import { useEffect, useRef, useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { APPS, DOCK_ORDER } from "@/lib/desktop/apps-meta";
import { AppIcon, FolderIcon, Icon } from "./AppIcons";
import { sounds } from "@/lib/desktop/sounds";
import { trackEvent } from "@/lib/analytics";
import type { AppId } from "@/lib/desktop/types";

const BASE = 50;
const MAX_EXTRA = 30; // how much a fully magnified icon grows
const REACH = 120; // px of influence either side

export function Dock() {
  const windows = useDesktop((s) => s.windows);
  const openApp = useDesktop((s) => s.openApp);
  const focus = useDesktop((s) => s.focus);
  const launchingApp = useDesktop((s) => s.launchingApp);
  const clearLaunching = useDesktop((s) => s.clearLaunching);
  const openContextMenu = useDesktop((s) => s.openContextMenu);
  const showToast = useDesktop((s) => s.showToast);
  const magnifyEnabled = useDesktop((s) => s.magnifyEnabled);
  const setMagnifyEnabled = useDesktop((s) => s.setMagnifyEnabled);
  const trashEmpty = useDesktop((s) => s.trashEmpty);
  const setTrashEmpty = useDesktop((s) => s.setTrashEmpty);
  const panelRef = useRef<HTMLDivElement>(null);
  const [canMag] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (!launchingApp) return;
    const t = setTimeout(clearLaunching, 900);
    return () => clearTimeout(t);
  }, [launchingApp, clearLaunching]);

  /** Real magnification grows each icon's *box*, so neighbours are pushed
   *  apart — that's the dock wave. Scaling in place just overlaps them. */
  const applyWave = (clientX: number | null) => {
    const panel = panelRef.current;
    if (!panel) return;
    const icons = [...panel.querySelectorAll<HTMLElement>(".dock-icon")];
    if (clientX === null || !canMag || !magnifyEnabled) {
      for (const el of icons) {
        el.style.width = `${BASE}px`;
        el.style.height = `${BASE}px`;
        el.style.marginBottom = "0px";
      }
      return;
    }
    for (const el of icons) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(clientX - (r.left + r.width / 2));
      const f = Math.max(0, 1 - d / REACH) ** 1.6;
      const size = BASE + MAX_EXTRA * f;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.marginBottom = `${(size - BASE) * 0.42}px`;
    }
  };

  const dockContext = (e: React.MouseEvent, id: AppId) => {
    e.preventDefault();
    e.stopPropagation();
    const running = windows.filter((w) => w.appId === id);
    const s = useDesktop.getState();
    openContextMenu({
      x: e.clientX,
      y: e.clientY - (running.length ? 150 : 120),
      items: [
        ...(running.length
          ? [{ label: "Show All Windows", run: () => running.forEach((w) => s.focus(w.id)) } as const, "sep" as const]
          : []),
        { label: "Open", run: () => s.openApp(id) },
        { label: "Show in Finder", run: () => s.openApp("finder", { folder: "Applications" }) },
        "sep",
        { label: "Options", submenu: [{ label: "Keep in Dock", checked: true, run: () => {} }, { label: "Open at Login", run: () => {} }] },
        "sep",
        running.length
          ? { label: "Quit", shortcut: "⌘Q", run: () => running.forEach((w) => s.close(w.id)) }
          : { label: "Quit", disabled: true },
      ],
    });
  };

  const dockBgContext = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".dock-item")) return;
    e.preventDefault();
    e.stopPropagation();
    openContextMenu({
      x: e.clientX,
      y: e.clientY - 110,
      items: [
        { label: `Turn Magnification ${magnifyEnabled ? "Off" : "On"}`, run: () => setMagnifyEnabled(!magnifyEnabled) },
        { label: "Position on Screen", submenu: [
          { label: "Left", run: () => showToast("Bottom is the only correct answer.") },
          { label: "Bottom", checked: true, run: () => {} },
          { label: "Right", run: () => showToast("Bottom is the only correct answer.") },
        ] },
        "sep",
        { label: "Dock Settings…", run: () => useDesktop.getState().openApp("settings") },
      ],
    });
  };

  const minimized = windows.filter((w) => w.minimized);

  return (
    <nav className="dock" aria-label="Dock">
      <div
        className="dock-panel"
        ref={panelRef}
        onMouseMove={(e) => applyWave(e.clientX)}
        onMouseLeave={() => applyWave(null)}
        onContextMenu={dockBgContext}
      >
        {DOCK_ORDER.map((id) => {
          const running = windows.some((w) => w.appId === id);
          return (
            <button
              key={id}
              type="button"
              className="dock-item"
              onClick={() => {
                trackEvent("app_open", { app: id, source: "dock" });
                if (!running) sounds.thud();
                openApp(id);
              }}
              onContextMenu={(e) => dockContext(e, id)}
              aria-label={APPS[id].name}
            >
              <span className="dock-tooltip">{APPS[id].name}</span>
              <span className={`dock-icon ${launchingApp === id ? "dock-bounce" : ""}`}>
                <AppIcon appId={id} />
              </span>
              <span className={`dock-dot ${running ? "dock-dot-on" : ""}`} aria-hidden="true" />
            </button>
          );
        })}

        <span className="dock-sep" aria-hidden="true" />

        {minimized.map((w) => (
          <button key={w.id} type="button" className="dock-item dock-min" onClick={() => focus(w.id)} aria-label={`Restore ${w.title}`}>
            <span className="dock-tooltip">{w.title}</span>
            <span className="dock-icon dock-min-thumb">
              <span className="dock-min-titlebar" />
              <span className="dock-min-app"><AppIcon appId={w.appId} /></span>
            </span>
            <span className="dock-dot" aria-hidden="true" />
          </button>
        ))}

        <button type="button" className="dock-item" onClick={() => openApp("finder", { folder: "Downloads" })} aria-label="Downloads">
          <span className="dock-tooltip">Downloads</span>
          <span className="dock-icon"><FolderIcon variant="downloads" /></span>
          <span className="dock-dot" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="dock-item"
          onClick={() => openApp("finder", { folder: "Trash" })}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openContextMenu({
              x: e.clientX,
              y: e.clientY - 90,
              items: [
                { label: "Open", run: () => openApp("finder", { folder: "Trash" }) },
                {
                  label: "Empty Trash…",
                  disabled: trashEmpty,
                  run: trashEmpty
                    ? undefined
                    : () => {
                        setTrashEmpty(true);
                        sounds.trash();
                        showToast("Trash emptied. Those drafts are gone forever. Probably for the best.");
                      },
                },
              ],
            });
          }}
          aria-label="Trash"
        >
          <span className="dock-tooltip">Trash</span>
          <span className="dock-icon"><Icon name={trashEmpty ? "trash-empty" : "trash"} /></span>
          <span className="dock-dot" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
