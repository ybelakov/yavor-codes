"use client";

import { useRef, useState } from "react";
import type { MenuSpecEntry } from "@/lib/desktop/store";

/** macOS menus: the chosen item blinks twice before the menu closes. */
export function MenuList({
  entries,
  onClose,
  className = "",
  style,
}: {
  entries: MenuSpecEntry[];
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [blinking, setBlinking] = useState<number | null>(null);
  const [openSub, setOpenSub] = useState<number | null>(null);
  const subTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const choose = (i: number, run?: () => void) => {
    if (!run) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      run();
      onClose();
      return;
    }
    setBlinking(i);
    setTimeout(() => {
      setBlinking(null);
      run();
      onClose();
    }, 160);
  };

  const hoverSub = (i: number, has: boolean) => {
    if (subTimer.current) clearTimeout(subTimer.current);
    if (!has) {
      subTimer.current = setTimeout(() => setOpenSub(null), 180);
      return;
    }
    subTimer.current = setTimeout(() => setOpenSub(i), 200);
  };

  return (
    <div className={`menu-dropdown ${className}`} style={style} role="menu">
      {entries.map((e, i) =>
        e === "sep" ? (
          <hr key={i} />
        ) : (
          <div key={i} className="menu-item-wrap" onMouseEnter={() => hoverSub(i, !!e.submenu)}>
            <button
              type="button"
              role="menuitem"
              className={[
                e.disabled || (!e.run && !e.submenu) ? "menu-disabled" : "",
                blinking === i ? "menu-blink" : "",
              ].join(" ")}
              disabled={e.disabled || (!e.run && !e.submenu)}
              onMouseUp={() => choose(i, e.run)}
              onClick={() => choose(i, e.run)}
            >
              <span className="menu-check">{e.checked ? "✓" : ""}</span>
              <span className="menu-label">{e.label}</span>
              {e.submenu ? <span className="menu-arrow">›</span> : e.shortcut ? <kbd className="menu-shortcut">{e.shortcut}</kbd> : null}
            </button>
            {e.submenu && openSub === i && (
              <MenuList entries={e.submenu} onClose={onClose} className="menu-submenu" />
            )}
          </div>
        ),
      )}
    </div>
  );
}
