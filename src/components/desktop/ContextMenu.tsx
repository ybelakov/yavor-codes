"use client";

import { useEffect, useRef } from "react";
import { useDesktop } from "@/lib/desktop/store";

export function ContextMenuOverlay() {
  const menu = useDesktop((s) => s.contextMenu);
  const close = useDesktop((s) => s.closeContextMenu);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, close]);

  if (!menu) return null;

  const maxX = typeof window !== "undefined" ? window.innerWidth - 230 : 0;
  const maxY = typeof window !== "undefined" ? window.innerHeight - menu.items.length * 26 - 30 : 0;

  return (
    <div
      ref={ref}
      className="menu-dropdown context-menu"
      style={{ left: Math.min(menu.x, maxX), top: Math.min(menu.y, maxY) }}
      role="menu"
    >
      {menu.items.map((e, i) =>
        e === "sep" ? (
          <hr key={i} />
        ) : (
          <button
            key={i}
            type="button"
            role="menuitem"
            className={e.disabled || !e.run ? "menu-disabled" : ""}
            disabled={e.disabled || !e.run}
            onClick={() => {
              e.run?.();
              close();
            }}
          >
            <span>{e.label}</span>
            {e.shortcut && <kbd className="menu-shortcut">{e.shortcut}</kbd>}
          </button>
        ),
      )}
    </div>
  );
}
