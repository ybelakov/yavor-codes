"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { APPS } from "@/lib/desktop/apps-meta";
import type { WindowState } from "@/lib/desktop/types";

const MENUBAR_H = 28;
const DOCK_SPACE = 96;

export function Window({ win, children }: { win: WindowState; children: React.ReactNode }) {
  const { close, focus, minimize, toggleMaximize, move, resize } = useDesktop();
  const activeAppId = useDesktop((s) => s.activeAppId);
  const isActive = activeAppId === win.appId && !win.minimized;
  const meta = APPS[win.appId];
  const ref = useRef<HTMLDivElement>(null);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const check = () => setSmall(window.innerWidth < 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (small || win.maximized) return;
      if ((e.target as HTMLElement).closest(".traffic-light, button, input, a")) return;
      focus(win.id);
      const startX = e.clientX;
      const startY = e.clientY;
      const originX = win.x;
      const originY = win.y;
      const onMove = (ev: PointerEvent) => {
        const nx = originX + (ev.clientX - startX);
        const ny = Math.max(MENUBAR_H, originY + (ev.clientY - startY));
        move(win.id, nx, ny);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.classList.remove("dragging");
      };
      document.body.classList.add("dragging");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [focus, move, small, win.id, win.maximized, win.x, win.y],
  );

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const w0 = win.w;
      const h0 = win.h;
      const min = meta.minSize ?? { w: 360, h: 260 };
      const onMove = (ev: PointerEvent) => {
        resize(
          win.id,
          Math.max(min.w, w0 + (ev.clientX - startX)),
          Math.max(min.h, h0 + (ev.clientY - startY)),
        );
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.classList.remove("dragging");
      };
      document.body.classList.add("dragging");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [meta.minSize, resize, win.h, win.id, win.w],
  );

  if (win.minimized) return null;

  const maximized = win.maximized || small;
  const style: React.CSSProperties = maximized
    ? {
        left: 0,
        top: MENUBAR_H,
        width: "100vw",
        height: `calc(100dvh - ${MENUBAR_H + (small ? DOCK_SPACE : 0)}px)`,
        zIndex: win.z,
      }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <section
      ref={ref}
      className={`window ${isActive ? "window-active" : ""} ${maximized ? "window-max" : ""}`}
      style={style}
      onPointerDown={() => focus(win.id)}
      aria-label={win.title}
    >
      <header className="titlebar" onPointerDown={startDrag} onDoubleClick={() => !small && toggleMaximize(win.id)}>
        <div className="traffic-lights">
          <button
            type="button"
            className="traffic-light tl-close"
            aria-label={`Close ${win.title}`}
            onClick={() => close(win.id)}
          >
            <svg viewBox="0 0 12 12"><path d="M4 4l4 4M8 4l-4 4" stroke="#7a0f0a" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          <button
            type="button"
            className="traffic-light tl-min"
            aria-label={`Minimize ${win.title}`}
            onClick={() => minimize(win.id)}
          >
            <svg viewBox="0 0 12 12"><path d="M3.5 6h5" stroke="#7d5b00" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          <button
            type="button"
            className={`traffic-light tl-zoom ${meta.fixed ? "tl-disabled" : ""}`}
            aria-label={`Zoom ${win.title}`}
            onClick={() => !meta.fixed && toggleMaximize(win.id)}
          >
            <svg viewBox="0 0 12 12"><path d="M4 8V4h4" stroke="#0b5000" strokeWidth="1.6" strokeLinecap="round" fill="none" /></svg>
          </button>
        </div>
        <span className="window-title">{win.title}</span>
        <span className="titlebar-spacer" />
      </header>
      <div className="window-body">{children}</div>
      {!maximized && !meta.fixed && (
        <span className="resize-handle" onPointerDown={startResize} aria-hidden="true" />
      )}
    </section>
  );
}
