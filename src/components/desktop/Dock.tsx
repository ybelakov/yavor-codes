"use client";

import { useDesktop } from "@/lib/desktop/store";
import { APPS, DOCK_ORDER } from "@/lib/desktop/apps-meta";
import { useState } from "react";
import { AppIcon, FolderIcon, TrashIcon } from "./AppIcons";
import { trackEvent } from "@/lib/analytics";

export function Dock() {
  const windows = useDesktop((s) => s.windows);
  const openApp = useDesktop((s) => s.openApp);
  const [trashOpen, setTrashOpen] = useState(false);

  return (
    <nav className="dock" aria-label="Dock">
      <div className="dock-panel">
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
              aria-label={APPS[id].name}
            >
              <span className="dock-tooltip">{APPS[id].name}</span>
              <span className="dock-icon">
                <AppIcon appId={id} />
              </span>
              <span className={`dock-dot ${running ? "dock-dot-on" : ""}`} aria-hidden="true" />
            </button>
          );
        })}
        <span className="dock-sep" aria-hidden="true" />
        <button
          type="button"
          className="dock-item"
          onClick={() => openApp("finder", { folder: "Downloads" })}
          aria-label="Downloads"
        >
          <span className="dock-tooltip">Downloads</span>
          <span className="dock-icon"><FolderIcon /></span>
          <span className="dock-dot" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="dock-item"
          onClick={() => setTrashOpen(true)}
          aria-label="Trash"
        >
          <span className="dock-tooltip">Trash</span>
          <span className="dock-icon"><TrashIcon full /></span>
          <span className="dock-dot" aria-hidden="true" />
        </button>
      </div>
      {trashOpen && (
        <div className="trash-toast" role="status">
          Trash is full of drafts. Nothing in here is ready.
          <button type="button" onClick={() => setTrashOpen(false)} aria-label="Dismiss">×</button>
        </div>
      )}
    </nav>
  );
}
