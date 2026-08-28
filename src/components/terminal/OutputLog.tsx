"use client";

import { useEffect, useRef } from "react";
import { useTerminal } from "@/lib/terminal/store";
import { OutputBlock } from "./OutputBlock";

export function OutputLog() {
  const entries = useTerminal((s) => s.entries);
  const resetKey = useTerminal((s) => s.resetKey);
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const last = entries[entries.length - 1];
    if (!last) return;
    if (last.source === "typed" || last.source === "chip" || pinned.current) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        pinned.current = true;
      });
    }
  }, [entries]);

  return (
    <div
      key={resetKey}
      ref={ref}
      className="output-log"
      role="log"
      aria-live="off"
      aria-label="Terminal output"
      tabIndex={-1}
    >
      {entries.map((e) => (
        <OutputBlock key={e.id} entry={e} />
      ))}
    </div>
  );
}
