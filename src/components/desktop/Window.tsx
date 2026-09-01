"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDesktop } from "@/lib/desktop/store";
import { APPS } from "@/lib/desktop/apps-meta";
import type { WindowState } from "@/lib/desktop/types";

const MENUBAR_H = 25;
const DOCK_SPACE = 96;

interface WindowControls {
  close: () => void;
  minimize: () => void;
  zoom: () => void;
  startDrag: (e: React.PointerEvent) => void;
  isActive: boolean;
}

const Ctx = createContext<WindowControls | null>(null);
export const useWindowControls = () => useContext(Ctx);

export function TrafficLights({ title }: { title: string }) {
  const c = useWindowControls();
  if (!c) return null;
  return (
    <div className="traffic-lights">
      <button type="button" className="traffic-light tl-close" aria-label={`Close ${title}`} onClick={c.close}>
        <svg viewBox="0 0 12 12"><path d="M4 4l4 4M8 4l-4 4" stroke="#7a0f0a" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      <button type="button" className="traffic-light tl-min" aria-label={`Minimize ${title}`} onClick={c.minimize}>
        <svg viewBox="0 0 12 12"><path d="M3.5 6h5" stroke="#7d5b00" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      <button type="button" className="traffic-light tl-zoom" aria-label={`Zoom ${title}`} onClick={c.zoom}>
        <svg viewBox="0 0 12 12"><path d="M4 8V4h4" stroke="#0b5000" strokeWidth="1.6" strokeLinecap="round" fill="none" /></svg>
      </button>
    </div>
  );
}

function displayTitle(win: WindowState): string {
  if (win.appId === "terminal") return "yavor — -zsh — 80×24";
  return win.title;
}

export function Window({ win, children }: { win: WindowState; children: React.ReactNode }) {
  const { close, focus, minimize, toggleMaximize, move, resize } = useDesktop();
  const activeAppId = useDesktop((s) => s.activeAppId);
  const isActive = activeAppId === win.appId && !win.minimized;
  const meta = APPS[win.appId];
  const [small, setSmall] = useState(false);
  const [anim, setAnim] = useState<"none" | "closing" | "minimizing" | "restoring">("none");
  const [minTransform, setMinTransform] = useState<string | null>(null);
  const wasMinimized = useRef(win.minimized);

  useEffect(() => {
    const check = () => setSmall(window.innerWidth < 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* restore animation when coming back from the dock */
  useEffect(() => {
    if (wasMinimized.current && !win.minimized) {
      setAnim("restoring");
      const t = setTimeout(() => setAnim("none"), 260);
      wasMinimized.current = false;
      return () => clearTimeout(t);
    }
    wasMinimized.current = win.minimized;
  }, [win.minimized]);

  const reduced = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleClose = useCallback(() => {
    if (reduced()) return close(win.id);
    setAnim("closing");
    setTimeout(() => close(win.id), 130);
  }, [close, win.id]);

  const handleMinimize = useCallback(() => {
    if (reduced()) return minimize(win.id);
    /* genie-lite: fly toward the dock */
    const dx = window.innerWidth / 2 - (win.x + win.w / 2);
    const dy = window.innerHeight - (win.y + win.h / 2);
    setMinTransform(`translate(${dx}px, ${dy}px) scale(0.06)`);
    setAnim("minimizing");
    setTimeout(() => {
      minimize(win.id);
      setMinTransform(null);
      setAnim("none");
    }, 300);
  }, [minimize, win.h, win.id, win.w, win.x, win.y]);

  const handleZoom = useCallback(() => {
    if (!meta.fixed) toggleMaximize(win.id);
  }, [meta.fixed, toggleMaximize, win.id]);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (small || win.maximized) return;
      if ((e.target as HTMLElement).closest(".traffic-light, button, input, a, .chrome-tab")) return;
      focus(win.id);
      const startX = e.clientX;
      const startY = e.clientY;
      const originX = win.x;
      const originY = win.y;
      const onMove = (ev: PointerEvent) => {
        move(win.id, originX + (ev.clientX - startX), Math.max(MENUBAR_H, originY + (ev.clientY - startY)));
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
        resize(win.id, Math.max(min.w, w0 + (ev.clientX - startX)), Math.max(min.h, h0 + (ev.clientY - startY)));
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

  if (win.minimized && anim !== "minimizing") return null;

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
  if (anim === "minimizing" && minTransform) {
    style.transform = minTransform;
    style.opacity = 0;
  }

  const controls: WindowControls = {
    close: handleClose,
    minimize: handleMinimize,
    zoom: handleZoom,
    startDrag,
    isActive,
  };

  const title = displayTitle(win);

  return (
    <Ctx.Provider value={controls}>
      <section
        className={[
          "window",
          isActive ? "window-active" : "",
          maximized ? "window-max" : "",
          meta.dark ? "window-dark" : "",
          anim !== "none" ? `window-${anim}` : "",
        ].join(" ")}
        style={style}
        onPointerDown={() => focus(win.id)}
        aria-label={title}
      >
        {!meta.frameless && (
          <header className="titlebar" onPointerDown={startDrag} onDoubleClick={() => !small && handleZoom()}>
            <TrafficLights title={title} />
            <span className="window-title">{title}</span>
            <span className="titlebar-spacer" />
          </header>
        )}
        <div className="window-body">{children}</div>
        {!maximized && !meta.fixed && (
          <span className="resize-handle" onPointerDown={startResize} aria-hidden="true" />
        )}
      </section>
    </Ctx.Provider>
  );
}
