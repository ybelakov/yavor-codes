"use client";

import { useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { FileIcon, FolderIcon, AppIcon } from "./AppIcons";
import type { AppId } from "@/lib/desktop/types";
import { trackEvent } from "@/lib/analytics";

interface DeskItem {
  id: string;
  name: string;
  kind: "app" | "folder" | "file";
  appId?: AppId;
  open: { app: AppId; payload?: Record<string, string> };
}

const ITEMS: DeskItem[] = [
  { id: "terminal", name: "Terminal", kind: "app", appId: "terminal", open: { app: "terminal" } },
  { id: "projects", name: "Projects", kind: "folder", open: { app: "finder" } },
  { id: "photos", name: "AIE.F events", kind: "folder", open: { app: "photos" } },
  { id: "readme", name: "read-me-first.txt", kind: "file", open: { app: "notes", payload: { note: "about" } } },
];

export function DesktopIcons() {
  const openApp = useDesktop((s) => s.openApp);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="desktop-icons">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`desk-icon ${selected === item.id ? "desk-icon-selected" : ""}`}
          onClick={() => setSelected(item.id)}
          onDoubleClick={() => {
            trackEvent("app_open", { app: item.open.app, source: "desktop" });
            openApp(item.open.app, item.open.payload);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") openApp(item.open.app, item.open.payload);
          }}
        >
          <span className="desk-icon-img">
            {item.kind === "app" && item.appId ? (
              <AppIcon appId={item.appId} />
            ) : item.kind === "folder" ? (
              <FolderIcon />
            ) : (
              <FileIcon />
            )}
          </span>
          <span className="desk-icon-label">{item.name}</span>
        </button>
      ))}
    </div>
  );
}
