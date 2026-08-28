"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Chip } from "@/components/terminal/Chip";

export function ChipRow({ commands }: { commands: string[] }) {
  return (
    <nav className="chip-row" aria-label="Related commands">
      {commands.map((c) => (
        <Chip key={c} command={c} />
      ))}
    </nav>
  );
}

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p className="section-header"># ── {children} ──</p>;
}

export function useCountUp(target: number, duration = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const raf = useRef(0);
  useEffect(() => {
    if (reduced) {
      raf.current = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf.current);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, reduced]);
  return value;
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`.replace("$", "");
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}
