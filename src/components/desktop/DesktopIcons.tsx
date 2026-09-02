"use client";

import { useCallback, useRef, useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { useUserFolders } from "@/lib/desktop/user-folders";
import { NodeIcon } from "./NodeIcon";
import { DESKTOP_ITEMS, KIND_LABEL, type FsNode } from "@/lib/desktop/filesystem";
import { fileMenuItems } from "@/lib/desktop/file-menu";
import { trackEvent } from "@/lib/analytics";

const CELL_W = 100;
const CELL_H = 96;
const TOP = 40;
const POS_KEY = "yavor.iconPositions";

type Pos = Record<string, { x: number; y: number }>;

function readPositions(): Pos {
  try {
    const v = JSON.parse(localStorage.getItem(POS_KEY) ?? "{}");
    if (v && typeof v === "object") return v as Pos;
  } catch {}
  return {};
}

/** Right-edge column layout, matching macOS's default desktop grid. */
function defaultPos(i: number): { x: number; y: number } {
  const cols = 1;
  return { x: (i % cols) * CELL_W, y: TOP + Math.floor(i / cols) * CELL_H };
}

export function DesktopIcons({ marqueeSel }: { marqueeSel: string[] }) {
  const openApp = useDesktop((s) => s.openApp);
  const openContextMenu = useDesktop((s) => s.openContextMenu);
  const setQuickLook = useDesktop((s) => s.setQuickLook);
  const userFolders = useUserFolders((s) => s.folders);
  const removeFolder = useUserFolders((s) => s.removeFolder);
  const [selected, setSelected] = useState<string[]>([]);
  const [positions, setPositions] = useState<Pos>(() => (typeof window === "undefined" ? {} : readPositions()));
  const [renaming, setRenaming] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes: FsNode[] = [
    ...DESKTOP_ITEMS,
    ...userFolders.map((name) => ({ name, kind: "folder" as const, modified: "Today", size: "--" })),
  ];

  const savePositions = useCallback((next: Pos) => {
    setPositions(next);
    try { localStorage.setItem(POS_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const activate = (node: FsNode) => {
    if (node.goto) {
      trackEvent("app_open", { app: "finder", source: "desktop" });
      openApp("finder", { folder: node.goto });
    } else if (node.open) {
      trackEvent("app_open", { app: node.open.app, source: "desktop" });
      openApp(node.open.app, node.open.payload);
    } else {
      openApp("finder", { folder: "Desktop" });
    }
  };

  /* D2: free drag with snap-to-grid on release */
  const startDrag = (e: React.PointerEvent, node: FsNode, index: number) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelected([node.name]);
    const el = e.currentTarget as HTMLElement;
    const start = { x: e.clientX, y: e.clientY };
    const base = positions[node.name] ?? defaultPos(index);
    let moved = false;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.zIndex = "5";
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.style.transform = "";
      el.style.zIndex = "";
      if (!moved) return;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      const snapped = {
        x: Math.round((base.x + dx) / CELL_W) * CELL_W,
        y: Math.max(TOP, Math.round((base.y + dy) / CELL_H) * CELL_H),
      };
      const bounded = {
        x: Math.min(0, Math.max(-(window.innerWidth - 200), snapped.x)),
        y: Math.min(window.innerHeight - 200, snapped.y),
      };
      savePositions({ ...positions, [node.name]: bounded });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const isSelected = (name: string) => selected.includes(name) || marqueeSel.includes(name);

  return (
    <div className="desktop-icons" ref={containerRef}>
      {nodes.map((node, i) => {
        const p = positions[node.name] ?? defaultPos(i);
        const isUser = userFolders.includes(node.name);
        return (
          <button
            key={node.name}
            type="button"
            data-icon-name={node.name}
            className={[
              "desk-icon",
              isSelected(node.name) ? "desk-icon-selected" : "",
              shake === node.name ? "desk-icon-shake" : "",
            ].join(" ")}
            style={{ right: -p.x, top: p.y }}
            onPointerDown={(e) => startDrag(e, node, i)}
            onClick={() => setSelected([node.name])}
            onDoubleClick={() => activate(node)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                /* D4: Enter renames on macOS — show it, then refuse politely */
                setRenaming(node.name);
                setTimeout(() => {
                  setRenaming(null);
                  setShake(node.name);
                  setTimeout(() => setShake(null), 420);
                  useDesktop.getState().showToast("This desktop is read-only — but you can make new folders.");
                }, 900);
              }
              if (e.key === " ") {
                e.preventDefault();
                setQuickLook({ name: node.name, kind: KIND_LABEL[node.kind], size: node.size, modified: node.modified });
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelected([node.name]);
              const items = fileMenuItems(node, "Desktop", () => activate(node));
              openContextMenu({
                x: e.clientX,
                y: e.clientY,
                items: isUser
                  ? [
                      ...items.slice(0, -1),
                      { label: "Move to Trash", shortcut: "⌘⌫", run: () => removeFolder(node.name) },
                    ]
                  : items,
              });
            }}
          >
            <span className="desk-icon-img"><NodeIcon node={node} /></span>
            {renaming === node.name ? (
              <input className="desk-rename" defaultValue={node.name} autoFocus readOnly />
            ) : (
              <span className="desk-icon-label">{node.name}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
