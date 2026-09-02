"use client";

import { useEffect, useRef, useState } from "react";

export interface Rect { x: number; y: number; w: number; h: number }

/** Drag on the wallpaper to draw macOS's translucent selection rectangle. */
export function useMarquee(onSelect: (names: string[]) => void) {
  const [rect, setRect] = useState<Rect | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const start = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    origin.current = { x: e.clientX, y: e.clientY };
    setRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
  };

  const active = rect !== null;
  useEffect(() => {
    if (!active || !origin.current) return;
    const onMove = (ev: PointerEvent) => {
      const o = origin.current;
      if (!o) return;
      const r = {
        x: Math.min(o.x, ev.clientX),
        y: Math.min(o.y, ev.clientY),
        w: Math.abs(ev.clientX - o.x),
        h: Math.abs(ev.clientY - o.y),
      };
      setRect(r);
      const hits: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("[data-icon-name]")) {
        const b = el.getBoundingClientRect();
        if (b.left < r.x + r.w && b.right > r.x && b.top < r.y + r.h && b.bottom > r.y) {
          hits.push(el.dataset.iconName!);
        }
      }
      onSelect(hits);
    };
    const onUp = () => {
      origin.current = null;
      setRect(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [active, onSelect]);

  return { rect, start };
}

export function MarqueeRect({ rect }: { rect: Rect | null }) {
  if (!rect || (rect.w < 3 && rect.h < 3)) return null;
  return <div className="marquee" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} aria-hidden="true" />;
}
