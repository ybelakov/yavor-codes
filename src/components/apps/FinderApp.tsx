"use client";

import { useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { NodeIcon } from "@/components/desktop/NodeIcon";
import { FS, KIND_LABEL, SIDEBAR_SECTIONS, type FsNode } from "@/lib/desktop/filesystem";

type View = "icon" | "list";

export function FinderApp({ folder: initialFolder }: { folder?: string }) {
  const [folder, setFolder] = useState(initialFolder && FS[initialFolder] ? initialFolder : "Desktop");
  const [history, setHistory] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [query, setQuery] = useState("");
  const openApp = useDesktop((s) => s.openApp);

  const all = FS[folder] ?? [];
  const items = query
    ? all.filter((n) => n.name.toLowerCase().includes(query.toLowerCase()))
    : all;

  const navigate = (next: string) => {
    setHistory((h) => [...h, folder]);
    setFolder(next);
    setSelected(null);
    setQuery("");
  };

  const back = () => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) {
        setFolder(prev);
        setSelected(null);
      }
      return h.slice(0, -1);
    });
  };

  const activate = (node: FsNode) => {
    if (node.goto && FS[node.goto]) navigate(node.goto);
    else if (node.open) openApp(node.open.app, node.open.payload);
    else if (FS[node.name]) navigate(node.name);
  };

  return (
    <div className="finder">
      <aside className="finder-sidebar">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="finder-side-label">{section.label}</p>
            {section.items.map((f) => (
              <button
                key={f}
                type="button"
                className={`finder-side-item ${folder === f ? "finder-side-active" : ""}`}
                onClick={() => { setFolder(f); setSelected(null); setQuery(""); }}
              >
                <span className="finder-side-glyph" aria-hidden="true">
                  {f === "Applications" ? "◇" : f === "Photos" ? "◈" : f === "Downloads" ? "⤓" : "▤"}
                </span>
                {f}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <div className="finder-main">
        <div className="finder-toolbar">
          <span className="finder-nav">
            <button type="button" onClick={back} disabled={history.length === 0} aria-label="Back">‹</button>
            <button type="button" disabled aria-label="Forward">›</button>
          </span>
          <strong className="finder-title">{folder}</strong>
          <span className="finder-viewtoggle">
            <button
              type="button"
              className={view === "icon" ? "vt-active" : ""}
              onClick={() => setView("icon")}
              aria-label="Icon view"
            >▦</button>
            <button
              type="button"
              className={view === "list" ? "vt-active" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
            >☰</button>
          </span>
          <input
            className="finder-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search this folder"
          />
        </div>

        {view === "icon" ? (
          <div className="finder-grid">
            {items.map((node) => (
              <button
                key={node.name}
                type="button"
                className={`finder-item ${selected === node.name ? "finder-item-selected" : ""}`}
                onClick={() => setSelected(node.name)}
                onDoubleClick={() => activate(node)}
                onKeyDown={(e) => e.key === "Enter" && activate(node)}
              >
                <span className="finder-item-icon"><NodeIcon node={node} /></span>
                <span className="finder-item-name">{node.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="finder-list" role="table">
            <div className="finder-list-head" role="row">
              <span role="columnheader">Name</span>
              <span role="columnheader">Date Modified</span>
              <span role="columnheader">Size</span>
              <span role="columnheader">Kind</span>
            </div>
            <div className="finder-list-body">
              {items.map((node) => (
                <div
                  key={node.name}
                  role="row"
                  tabIndex={0}
                  className={`finder-row ${selected === node.name ? "finder-row-selected" : ""}`}
                  onClick={() => setSelected(node.name)}
                  onDoubleClick={() => activate(node)}
                  onKeyDown={(e) => e.key === "Enter" && activate(node)}
                >
                  <span className="finder-row-name">
                    <span className="finder-row-icon"><NodeIcon node={node} /></span>
                    {node.name}
                  </span>
                  <span>{node.modified}</span>
                  <span>{node.size ?? "--"}</span>
                  <span>{KIND_LABEL[node.kind]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="finder-status">
          {items.length} of {all.length} items{selected ? ` · ${selected}` : ""} · double-click to open
        </div>
      </div>
    </div>
  );
}
