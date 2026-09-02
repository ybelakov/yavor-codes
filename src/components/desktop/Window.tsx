"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { APPS } from "@/lib/desktop/apps-meta";
import { sounds } from "@/lib/desktop/sounds";
import type { WindowState } from "@/lib/desktop/types";

const MENUBAR_H = 25;
const DOCK_SPACE = 96;

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface WindowControls {
  close: () => void;
  minimize: () => void;
  zoom: () => void;
  startDrag: (e: React.PointerEvent) => void;
  isActive: boolean;
  title: string;
  dirty?: boolean;
}

const Ctx = createContext<WindowControls | null>(null);
export const useWindowControls = () => useContext(Ctx);

/** Traffic lights + the Sequoia tiling popover on the green button. */
export function TrafficLights({ proxyIcon }: { proxyIcon?: React.ReactNode }) {
  const c = useWindowControls();
  const [tilesOpen, setTilesOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setBounds, setFullscreen } = useDesktop();

  if (!c) return null;

  const tile = (kind: "left" | "right" | "tl" | "tr" | "bl" | "br" | "full") => {
    setTilesOpen(false);
    const target = useDesktop.getState().windows.find((w) => w.title === c.title);
    if (!target) return;
    if (kind === "full") return c.zoom();
    const W = window.innerWidth;
    const H = window.innerHeight - MENUBAR_H - 8;
    const half = { w: Math.round(W / 2), h: H };
    const quarter = { w: Math.round(W / 2), h: Math.round(H / 2) };
    const map = {
      left: { x: 0, y: MENUBAR_H, ...half },
      right: { x: Math.round(W / 2), y: MENUBAR_H, ...half },
      tl: { x: 0, y: MENUBAR_H, ...quarter },
      tr: { x: Math.round(W / 2), y: MENUBAR_H, ...quarter },
      bl: { x: 0, y: MENUBAR_H + Math.round(H / 2), ...quarter },
      br: { x: Math.round(W / 2), y: MENUBAR_H + Math.round(H / 2), ...quarter },
    } as const;
    setBounds(target.id, map[kind]);
  };

  const enterFullscreen = () => {
    setTilesOpen(false);
    const target = useDesktop.getState().windows.find((w) => w.title === c.title);
    if (target) {
      setFullscreen(target.id);
      void document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  const openLater = () => {
    timer.current = setTimeout(() => setTilesOpen(true), 420);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <div className="traffic-wrap">
      <div className="traffic-lights" onMouseLeave={() => { cancel(); setTilesOpen(false); }}>
        <button type="button" className={`traffic-light tl-close ${c.dirty ? "tl-dirty" : ""}`} aria-label="Close" onClick={c.close}>
          <svg viewBox="0 0 12 12"><path d="M4 4l4 4M8 4l-4 4" stroke="#7a0f0a" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <button type="button" className="traffic-light tl-min" aria-label="Minimize" onClick={c.minimize}>
          <svg viewBox="0 0 12 12"><path d="M3.5 6h5" stroke="#7d5b00" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <button
          type="button"
          className="traffic-light tl-zoom"
          aria-label="Zoom"
          onClick={() => { cancel(); enterFullscreen(); }}
          onMouseEnter={openLater}
        >
          <svg viewBox="0 0 12 12"><path d="M4 8V4h4" stroke="#0b5000" strokeWidth="1.6" strokeLinecap="round" fill="none" /></svg>
        </button>

        {tilesOpen && (
          <div className="tile-pop" onMouseEnter={cancel}>
            <p className="tile-pop-title">Move &amp; Resize</p>
            <div className="tile-row">
              <button type="button" onClick={() => tile("left")} aria-label="Left half"><span className="tile-g tile-left" /></button>
              <button type="button" onClick={() => tile("right")} aria-label="Right half"><span className="tile-g tile-right" /></button>
              <button type="button" onClick={() => tile("full")} aria-label="Fill"><span className="tile-g tile-full" /></button>
            </div>
            <div className="tile-row">
              <button type="button" onClick={() => tile("tl")} aria-label="Top left"><span className="tile-g tile-tl" /></button>
              <button type="button" onClick={() => tile("tr")} aria-label="Top right"><span className="tile-g tile-tr" /></button>
              <button type="button" onClick={() => tile("bl")} aria-label="Bottom left"><span className="tile-g tile-bl" /></button>
              <button type="button" onClick={() => tile("br")} aria-label="Bottom right"><span className="tile-g tile-br" /></button>
            </div>
            <hr />
            <button type="button" className="tile-fs" onClick={enterFullscreen}>Enter Full Screen</button>
          </div>
        )}
      </div>
      {proxyIcon && <span className="proxy-icon">{proxyIcon}</span>}
    </div>
  );
}

function displayTitle(win: WindowState): string {
  if (win.appId === "terminal") return "yavor — -zsh — 80×24";
  return win.title;
}

export function Window({ win, children }: { win: WindowState; children: React.ReactNode }) {
  const { close, focus, minimize, toggleMaximize, move, setBounds } = useDesktop();
  const activeAppId = useDesktop((s) => s.activeAppId);
  const fullscreenId = useDesktop((s) => s.fullscreenId);
  const setFullscreen = useDesktop((s) => s.setFullscreen);
  const isActive = activeAppId === win.appId && !win.minimized;
  const meta = APPS[win.appId];
  const [small, setSmall] = useState(false);
  const [anim, setAnim] = useState<"none" | "closing" | "minimizing" | "restoring">("none");
  const [minTransform, setMinTransform] = useState<string | null>(null);
  const [snapZone, setSnapZone] = useState<null | "left" | "right" | "top">(null);
  const wasMinimized = useRef(win.minimized);
  const isFullscreen = fullscreenId === win.id;

  useEffect(() => {
    const check = () => setSmall(window.innerWidth < 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (wasMinimized.current && !win.minimized) {
      setAnim("restoring");
      const t = setTimeout(() => setAnim("none"), 260);
      wasMinimized.current = false;
      return () => clearTimeout(t);
    }
    wasMinimized.current = win.minimized;
  }, [win.minimized]);

  /* leaving browser fullscreen (Esc) exits our fullscreen too */
  useEffect(() => {
    if (!isFullscreen) return;
    const onFs = () => {
      if (!document.fullscreenElement) setFullscreen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreen(null);
        void document.exitFullscreen?.().catch(() => {});
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("keydown", onKey);
    };
  }, [isFullscreen, setFullscreen]);

  const reduced = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleClose = useCallback(() => {
    if (reduced()) return close(win.id);
    setAnim("closing");
    setTimeout(() => close(win.id), 130);
  }, [close, win.id]);

  const handleMinimize = useCallback(() => {
    if (isFullscreen) {
      setFullscreen(null);
      void document.exitFullscreen?.().catch(() => {});
    }
    if (reduced()) return minimize(win.id);
    const dx = window.innerWidth / 2 - (win.x + win.w / 2);
    const dy = window.innerHeight - (win.y + win.h / 2);
    setMinTransform(`translate(${dx}px, ${dy}px) scale(0.06)`);
    setAnim("minimizing");
    setTimeout(() => {
      minimize(win.id);
      setMinTransform(null);
      setAnim("none");
    }, 300);
  }, [isFullscreen, minimize, setFullscreen, win.h, win.id, win.w, win.x, win.y]);

  const handleZoom = useCallback(() => {
    if (!meta.fixed) toggleMaximize(win.id);
  }, [meta.fixed, toggleMaximize, win.id]);

  /* drag with edge snap-to-tile */
  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (small || win.maximized || isFullscreen) return;
      if ((e.target as HTMLElement).closest(".traffic-light, button, input, a, .chrome-tab, .tile-pop")) return;
      focus(win.id);
      const startX = e.clientX;
      const startY = e.clientY;
      const originX = win.x;
      const originY = win.y;
      let zone: null | "left" | "right" | "top" = null;
      const onMove = (ev: PointerEvent) => {
        move(win.id, originX + (ev.clientX - startX), Math.max(MENUBAR_H, originY + (ev.clientY - startY)));
        const next = ev.clientX < 14 ? "left" : ev.clientX > window.innerWidth - 14 ? "right" : ev.clientY < MENUBAR_H + 6 ? "top" : null;
        if (next !== zone) {
          zone = next;
          setSnapZone(next);
        }
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.classList.remove("dragging");
        setSnapZone(null);
        if (zone) {
          const W = window.innerWidth;
          const H = window.innerHeight - MENUBAR_H - 8;
          if (zone === "top") setBounds(win.id, { x: 0, y: MENUBAR_H, w: W, h: H });
          else setBounds(win.id, { x: zone === "left" ? 0 : Math.round(W / 2), y: MENUBAR_H, w: Math.round(W / 2), h: H });
        }
      };
      document.body.classList.add("dragging");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [focus, isFullscreen, move, setBounds, small, win.id, win.maximized, win.x, win.y],
  );

  /* resize from any edge or corner */
  const startResize = useCallback(
    (edge: Edge) => (e: React.PointerEvent) => {
      e.stopPropagation();
      const sx = e.clientX;
      const sy = e.clientY;
      const b0 = { x: win.x, y: win.y, w: win.w, h: win.h };
      const min = meta.minSize ?? { w: 360, h: 260 };
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        const b = { ...b0 };
        if (edge.includes("e")) b.w = Math.max(min.w, b0.w + dx);
        if (edge.includes("s")) b.h = Math.max(min.h, b0.h + dy);
        if (edge.includes("w")) {
          b.w = Math.max(min.w, b0.w - dx);
          b.x = b0.x + (b0.w - b.w);
        }
        if (edge.includes("n")) {
          b.h = Math.max(min.h, b0.h - dy);
          b.y = Math.max(MENUBAR_H, b0.y + (b0.h - b.h));
        }
        setBounds(win.id, b);
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
    [meta.minSize, setBounds, win.h, win.id, win.w, win.x, win.y],
  );

  if (win.minimized && anim !== "minimizing") return null;

  const maximized = win.maximized || small;
  const title = displayTitle(win);

  const style: React.CSSProperties = isFullscreen
    ? { left: 0, top: 0, width: "100vw", height: "100dvh", zIndex: 9999 }
    : maximized
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
    title: win.title,
    dirty: win.appId === "mail",
  };

  const resizable = !maximized && !isFullscreen && !meta.fixed;
  const edges: Edge[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

  return (
    <Ctx.Provider value={controls}>
      {snapZone && (
        <div
          className="snap-zone"
          style={
            snapZone === "top"
              ? { left: 0, top: MENUBAR_H, width: "100vw", height: `calc(100dvh - ${MENUBAR_H}px)` }
              : {
                  left: snapZone === "left" ? 0 : "50vw",
                  top: MENUBAR_H,
                  width: "50vw",
                  height: `calc(100dvh - ${MENUBAR_H}px)`,
                }
          }
          aria-hidden="true"
        />
      )}
      <section
        className={[
          "window",
          isActive ? "window-active" : "",
          maximized ? "window-max" : "",
          isFullscreen ? "window-fs" : "",
          meta.dark ? "window-dark" : "",
          meta.frameless ? "window-frameless" : "",
          anim !== "none" ? `window-${anim}` : "",
        ].join(" ")}
        style={style}
        onPointerDown={() => focus(win.id)}
        aria-label={title}
      >
        {!meta.frameless && (
          <header className="titlebar" onPointerDown={startDrag} onDoubleClick={() => !small && handleZoom()}>
            <TrafficLights />
            <span className="window-title">{title}</span>
            <span className="titlebar-spacer" />
          </header>
        )}
        <div className="window-body">{children}</div>
        {resizable && edges.map((edge) => (
          <span key={edge} className={`rz rz-${edge}`} onPointerDown={startResize(edge)} aria-hidden="true" />
        ))}
      </section>
    </Ctx.Provider>
  );
}

export { sounds };
