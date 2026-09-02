"use client";

import { useMemo, useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { useFinderPrefs, type SortKey } from "@/lib/desktop/finder-prefs";
import { useUserFolders } from "@/lib/desktop/user-folders";
import { NodeIcon } from "@/components/desktop/NodeIcon";
import { SideGlyph } from "@/components/desktop/SidebarGlyphs";
import { TrafficLights, useWindowControls } from "@/components/desktop/Window";
import { FS, KIND_LABEL, type FsNode } from "@/lib/desktop/filesystem";
import { fileMenuItems } from "@/lib/desktop/file-menu";

function ColHeader({
  label, k, sortBy, asc, onSort,
}: { label: string; k: SortKey; sortBy: SortKey; asc: boolean; onSort: (k: SortKey) => void }) {
  return (
    <button type="button" className="finder-col" onClick={() => onSort(k)}>
      {label}
      {sortBy === k && <span className="finder-sortarrow">{asc ? "▲" : "▼"}</span>}
    </button>
  );
}

const FAVORITES = ["AirDrop", "Recents", "Applications", "Desktop", "Documents", "Downloads", "Projects", "Photos"];

export function FinderApp({ folder: initialFolder }: { folder?: string }) {
  const [folder, setFolder] = useState(initialFolder && FS[initialFolder] ? initialFolder : "Desktop");
  const [history, setHistory] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { view, sortBy, sortAsc, setView, setSort } = useFinderPrefs();
  const openApp = useDesktop((s) => s.openApp);
  const openContextMenu = useDesktop((s) => s.openContextMenu);
  const setQuickLook = useDesktop((s) => s.setQuickLook);
  const trashEmpty = useDesktop((s) => s.trashEmpty);
  const userFolders = useUserFolders((s) => s.folders);
  const controls = useWindowControls();

  const base: FsNode[] = useMemo(() => {
    if (folder === "Trash" && trashEmpty) return [];
    const fsNodes = FS[folder] ?? [];
    if (folder !== "Desktop") return fsNodes;
    return [
      ...fsNodes,
      ...userFolders.map((name) => ({ name, kind: "folder" as const, modified: "Today", size: "--" })),
    ];
  }, [folder, trashEmpty, userFolders]);

  const items = useMemo(() => {
    const filtered = query ? base.filter((n) => n.name.toLowerCase().includes(query.toLowerCase())) : base;
    const dir = sortAsc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortBy === "kind") return dir * (KIND_LABEL[a.kind].localeCompare(KIND_LABEL[b.kind]) || a.name.localeCompare(b.name));
      if (sortBy === "modified") return dir * a.modified.localeCompare(b.modified);
      return dir * a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }, [base, query, sortAsc, sortBy]);

  const navigate = (next: string) => {
    setHistory((h) => [...h, folder]);
    setFolder(next);
    setSelected(null);
    setQuery("");
  };

  const back = () =>
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) { setFolder(prev); setSelected(null); }
      return h.slice(0, -1);
    });

  const activate = (node: FsNode) => {
    if (node.goto && FS[node.goto]) navigate(node.goto);
    else if (node.open) openApp(node.open.app, node.open.payload);
    else if (FS[node.name]) navigate(node.name);
    else setQuickLook({ name: node.name, kind: KIND_LABEL[node.kind], size: node.size, modified: node.modified });
  };

  const nodeContext = (e: React.MouseEvent, node: FsNode) => {
    e.preventDefault();
    setSelected(node.name);
    openContextMenu({ x: e.clientX, y: e.clientY, items: fileMenuItems(node, folder, () => activate(node)) });
  };

  const onKey = (e: React.KeyboardEvent, node: FsNode) => {
    if (e.key === "Enter") activate(node);
    if (e.key === " ") {
      e.preventDefault();
      setQuickLook({ name: node.name, kind: KIND_LABEL[node.kind], size: node.size, modified: node.modified });
    }
  };

  const sideItem = (f: string) => (
    <button
      key={f}
      type="button"
      className={`finder-side-item ${folder === f ? "finder-side-active" : ""}`}
      onClick={() => {
        if (FS[f]) { setFolder(f); setSelected(null); setQuery(""); }
        else useDesktop.getState().showToast(`${f} isn't wired up — try Desktop or Projects.`);
      }}
    >
      <SideGlyph name={f} />
      {f}
    </button>
  );

  return (
    <div className="finder unified">
      <aside className="finder-sidebar unified-sidebar">
        <div className="unified-sidebar-top" onPointerDown={(e) => controls?.startDrag(e)}>
          <TrafficLights />
        </div>
        <p className="finder-side-label">Favorites</p>
        {FAVORITES.map(sideItem)}
        <p className="finder-side-label">iCloud</p>
        {sideItem("iCloud")}
        <p className="finder-side-label">Tags</p>
        {[["Work", "#4a90d9"], ["Personal", "#f5a623"], ["Shipped", "#3ec46d"]].map(([t, c]) => (
          <button key={t} type="button" className="finder-side-item" onClick={() => useDesktop.getState().showToast(`No files tagged “${t}”.`)}>
            <span className="tag-dot" style={{ background: c }} />
            {t}
          </button>
        ))}
      </aside>

      <div className="finder-main">
        <div className="finder-toolbar unified-toolbar" onPointerDown={(e) => controls?.startDrag(e)}>
          <span className="finder-nav">
            <button type="button" onClick={back} disabled={history.length === 0} aria-label="Back">‹</button>
            <button type="button" disabled aria-label="Forward">›</button>
          </span>
          <strong className="finder-title">{folder}</strong>
          <span className="finder-viewtoggle">
            {(["icon", "list", "columns"] as const).map((v) => (
              <button key={v} type="button" className={view === v ? "vt-active" : ""} onClick={() => setView(v)} aria-label={`${v} view`}>
                {v === "icon" ? "▦" : v === "list" ? "☰" : "◫"}
              </button>
            ))}
          </span>
          <input className="finder-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search this folder" />
        </div>

        {view === "icon" && (
          <div className="finder-grid">
            {items.map((node) => (
              <button
                key={node.name}
                type="button"
                className={`finder-item ${selected === node.name ? "finder-item-selected" : ""}`}
                onClick={() => setSelected(node.name)}
                onDoubleClick={() => activate(node)}
                onKeyDown={(e) => onKey(e, node)}
                onContextMenu={(e) => nodeContext(e, node)}
              >
                <span className="finder-item-icon"><NodeIcon node={node} /></span>
                <span className="finder-item-name">{node.name}</span>
              </button>
            ))}
          </div>
        )}

        {view === "list" && (
          <div className="finder-list">
            <div className="finder-list-head">
              <ColHeader label="Name" k="name" sortBy={sortBy} asc={sortAsc} onSort={setSort} />
              <ColHeader label="Date Modified" k="modified" sortBy={sortBy} asc={sortAsc} onSort={setSort} />
              <span className="finder-col finder-col-static">Size</span>
              <ColHeader label="Kind" k="kind" sortBy={sortBy} asc={sortAsc} onSort={setSort} />
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
                  onKeyDown={(e) => onKey(e, node)}
                  onContextMenu={(e) => nodeContext(e, node)}
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

        {view === "columns" && (
          <div className="finder-columns">
            <div className="fcol">
              {Object.keys(FS).filter((f) => f !== "Trash").map((f) => (
                <button key={f} type="button" className={`fcol-row ${folder === f ? "fcol-sel" : ""}`} onClick={() => { setFolder(f); setSelected(null); }}>
                  <span className="fcol-name">{f}</span><span className="fcol-arrow">›</span>
                </button>
              ))}
            </div>
            <div className="fcol">
              {items.map((node) => (
                <button
                  key={node.name}
                  type="button"
                  className={`fcol-row ${selected === node.name ? "fcol-sel" : ""}`}
                  onClick={() => setSelected(node.name)}
                  onDoubleClick={() => activate(node)}
                  onContextMenu={(e) => nodeContext(e, node)}
                >
                  <span className="fcol-icon"><NodeIcon node={node} /></span>
                  <span className="fcol-name">{node.name}</span>
                  {(node.kind === "folder") && <span className="fcol-arrow">›</span>}
                </button>
              ))}
            </div>
            <div className="fcol fcol-preview">
              {selected ? (() => {
                const n = items.find((i) => i.name === selected);
                if (!n) return null;
                return (
                  <div className="fcol-prev-body">
                    <span className="fcol-prev-icon"><NodeIcon node={n} /></span>
                    <p className="fcol-prev-name">{n.name}</p>
                    <dl className="fcol-prev-meta">
                      <div><dt>Kind</dt><dd>{KIND_LABEL[n.kind]}</dd></div>
                      <div><dt>Size</dt><dd>{n.size ?? "--"}</dd></div>
                      <div><dt>Modified</dt><dd>{n.modified}</dd></div>
                    </dl>
                  </div>
                );
              })() : <p className="fcol-empty">No selection</p>}
            </div>
          </div>
        )}

        <div className="finder-pathbar">
          <span>Macintosh HD</span><span className="path-sep">›</span>
          <span>Users</span><span className="path-sep">›</span>
          <span>yavor</span><span className="path-sep">›</span>
          <strong>{folder}</strong>
        </div>
        <div className="finder-status">
          {items.length} of {base.length} items, 245.31 GB available
          {selected ? ` · ${selected}` : ""}
        </div>
      </div>
    </div>
  );
}
