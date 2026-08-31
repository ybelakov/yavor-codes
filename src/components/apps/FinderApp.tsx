"use client";

import { useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { FileIcon, FolderIcon, AppIcon } from "@/components/desktop/AppIcons";
import type { AppId } from "@/lib/desktop/types";

interface Item {
  name: string;
  kind: "folder" | "file" | "app";
  opens?: { app: AppId; payload?: Record<string, string> };
  appId?: AppId;
  meta: string;
}

const TREE: Record<string, Item[]> = {
  Desktop: [
    { name: "Terminal.app", kind: "app", appId: "terminal", opens: { app: "terminal" }, meta: "Application" },
    { name: "Projects", kind: "folder", opens: undefined, meta: "Folder" },
    { name: "read-me-first.txt", kind: "file", opens: { app: "notes", payload: { note: "about" } }, meta: "Plain Text" },
  ],
  Documents: [
    { name: "about-me.txt", kind: "file", opens: { app: "notes", payload: { note: "about" } }, meta: "Plain Text" },
    { name: "san-francisco.md", kind: "file", opens: { app: "notes", payload: { note: "sf" } }, meta: "Markdown" },
    { name: "now.md", kind: "file", opens: { app: "notes", payload: { note: "now" } }, meta: "Markdown" },
    { name: "resume.pdf", kind: "file", opens: { app: "notes", payload: { note: "about" } }, meta: "PDF Document" },
  ],
  Projects: [
    { name: "juma", kind: "folder", opens: { app: "chrome", payload: { site: "juma" } }, meta: "Folder" },
    { name: "aief-europe", kind: "folder", opens: { app: "chrome", payload: { site: "aief" } }, meta: "Folder" },
    { name: "bezgradski", kind: "folder", opens: { app: "chrome", payload: { site: "github" } }, meta: "Folder" },
    { name: "yavor-codes", kind: "folder", opens: { app: "chrome", payload: { site: "github" } }, meta: "Folder" },
  ],
  Photos: [
    { name: "aief-events", kind: "folder", opens: { app: "photos" }, meta: "6 items" },
  ],
  Applications: [
    { name: "Terminal", kind: "app", appId: "terminal", opens: { app: "terminal" }, meta: "Application" },
    { name: "Google Chrome", kind: "app", appId: "chrome", opens: { app: "chrome" }, meta: "Application" },
    { name: "Notes", kind: "app", appId: "notes", opens: { app: "notes" }, meta: "Application" },
    { name: "Photos", kind: "app", appId: "photos", opens: { app: "photos" }, meta: "Application" },
    { name: "Mail", kind: "app", appId: "mail", opens: { app: "mail" }, meta: "Application" },
    { name: "System Settings", kind: "app", appId: "settings", opens: { app: "settings" }, meta: "Application" },
  ],
};

const SIDEBAR = ["Desktop", "Documents", "Projects", "Photos", "Applications"];

export function FinderApp() {
  const [folder, setFolder] = useState("Desktop");
  const [selected, setSelected] = useState<string | null>(null);
  const openApp = useDesktop((s) => s.openApp);
  const items = TREE[folder] ?? [];

  const activate = (item: Item) => {
    if (item.opens) openApp(item.opens.app, item.opens.payload);
    else if (TREE[item.name]) setFolder(item.name);
  };

  return (
    <div className="finder">
      <aside className="finder-sidebar">
        <p className="finder-side-label">Favorites</p>
        {SIDEBAR.map((f) => (
          <button
            key={f}
            type="button"
            className={`finder-side-item ${folder === f ? "finder-side-active" : ""}`}
            onClick={() => { setFolder(f); setSelected(null); }}
          >
            <span className="finder-side-glyph" aria-hidden="true">
              {f === "Applications" ? "◇" : f === "Photos" ? "◈" : "▤"}
            </span>
            {f}
          </button>
        ))}
      </aside>
      <div className="finder-main">
        <div className="finder-path">{folder}</div>
        <div className="finder-grid">
          {items.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`finder-item ${selected === item.name ? "finder-item-selected" : ""}`}
              onClick={() => setSelected(item.name)}
              onDoubleClick={() => activate(item)}
              onKeyDown={(e) => e.key === "Enter" && activate(item)}
            >
              <span className="finder-item-icon">
                {item.kind === "folder" ? <FolderIcon /> : item.kind === "app" && item.appId ? <AppIcon appId={item.appId} /> : <FileIcon />}
              </span>
              <span className="finder-item-name">{item.name}</span>
            </button>
          ))}
        </div>
        <div className="finder-status">
          {items.length} items{selected ? ` · ${selected} selected` : ""} · double-click to open
        </div>
      </div>
    </div>
  );
}
