"use client";

import { useEffect, useRef, useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { APPS, DOCK_ORDER } from "@/lib/desktop/apps-meta";
import { AppIcon, FolderIcon, TrashIcon } from "./AppIcons";
import { trackEvent } from "@/lib/analytics";
import type { AppId } from "@/lib/desktop/types";

function canMagnify(): boolean {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function Dock() {
  const windows = useDesktop((s) => s.windows);
  const openApp = useDesktop((s) => s.openApp);
  const focus = useDesktop((s) => s.focus);
  const launchingApp = useDesktop((s) => s.launchingApp);
  const clearLaunching = useDesktop((s) => s.clearLaunching);
  const openContextMenu = useDesktop((s) => s.openContextMenu);
  const showToast = useDesktop((s) => s.showToast);
  const panelRef = useRef<HTMLDivElement>(null);
  const [magnify, setMagnify] = useState(false);

  useEffect(() => {
    setTimeout(() => setMagnify(canMagnify()), 0);
  }, []);

  useEffect(() => {
    if (!launchingApp) return;
    const t = setTimeout(clearLaunching, 900);
    return () => clearTimeout(t);
  }, [launchingApp, clearLaunching]);

  /* fisheye: scale each icon by its distance to the pointer */
  const onMove = (e: React.MouseEvent) => {
    if (!magnify || !panelRef.current) return;
    for (const el of panelRef.current.querySelectorAll<HTMLElement>(".dock-icon")) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const scale = 1 + 0.55 * Math.max(0, 1 - d / 140) ** 2;
      el.style.setProperty("--mag", scale.toFixed(3));
    }
  };
  const onLeave = () => {
    if (!panelRef.current) return;
    for (const el of panelRef.current.querySelectorAll<HTMLElement>(".dock-icon")) {
      el.style.setProperty("--mag", "1");
    }
  };

  const dockContext = (e: React.MouseEvent, id: AppId) => {
    e.preventDefault();
    const running = windows.filter((w) => w.appId === id);
    const s = useDesktop.getState();
    openContextMenu({
      x: e.clientX,
      y: e.clientY - (running.length ? 130 : 110),
      items: [
        { label: "Open", run: () => s.openApp(id) },
        { label: "Show in Finder", run: () => s.openApp("finder", { folder: "Applications" }) },
        "sep",
        { label: "Options", disabled: true },
        "sep",
        running.length
          ? { label: "Quit", run: () => running.forEach((w) => s.close(w.id)) }
          : { label: "Quit", disabled: true },
      ],
    });
  };

  const minimized = windows.filter((w) => w.minimized);

  return (
    <nav className="dock" aria-label="Dock">
      <div className="dock-panel" ref={panelRef} onMouseMove={onMove} onMouseLeave={onLeave}>
        {DOCK_ORDER.map((id) => {
          const running = windows.some((w) => w.appId === id);
          return (
            <button
              key={id}
              type="button"
              className="dock-item"
              onClick={() => {
                trackEvent("app_open", { app: id, source: "dock" });
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
          <button
            key={w.id}
            type="button"
            className="dock-item dock-min"
            onClick={() => focus(w.id)}
            aria-label={`Restore ${w.title}`}
          >
            <span className="dock-tooltip">{w.title}</span>
            <span className="dock-icon dock-min-thumb">
              <span className="dock-min-titlebar" />
              <span className="dock-min-app"><AppIcon appId={w.appId} /></span>
            </span>
            <span className="dock-dot" aria-hidden="true" />
          </button>
        ))}

        <button
          type="button"
          className="dock-item"
          onClick={() => openApp("finder", { folder: "Downloads" })}
          aria-label="Downloads"
        >
          <span className="dock-tooltip">Downloads</span>
          <span className="dock-icon"><FolderIcon variant="downloads" /></span>
          <span className="dock-dot" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="dock-item"
          onClick={() => showToast("Trash is full of drafts. Nothing in here is ready.")}
          onContextMenu={(e) => {
            e.preventDefault();
            useDesktop.getState().openContextMenu({
              x: e.clientX,
              y: e.clientY - 90,
              items: [
                { label: "Open", run: () => showToast("Trash is full of drafts. Nothing in here is ready.") },
                { label: "Empty Trash…", run: () => showToast("Some drafts deserve a second chance. Not emptying.") },
              ],
            });
          }}
          aria-label="Trash"
        >
          <span className="dock-tooltip">Trash</span>
          <span className="dock-icon"><TrashIcon /></span>
          <span className="dock-dot" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
