"use client";

import { useSyncExternalStore } from "react";

let tick = 0;
const listeners = new Set<() => void>();
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (listeners.size === 1) {
    tick = Date.now();
    queueMicrotask(() => listeners.forEach((l) => l()));
  }
  const t = setInterval(() => {
    tick = Date.now();
    listeners.forEach((l) => l());
  }, 20_000);
  return () => {
    clearInterval(t);
    listeners.delete(cb);
  };
}

export function useIosClock(): string {
  const t = useSyncExternalStore(subscribe, () => tick, () => 0);
  if (!t) return "";
  return new Date(t)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(/\s?[AP]M/, "");
}

export function PhoneStatusBar({ dark }: { dark?: boolean }) {
  const time = useIosClock();
  return (
    <div className={`ios-status ${dark ? "ios-status-dark" : ""}`}>
      <span className="ios-time">{time}</span>
      <span className="ios-notch" aria-hidden="true" />
      <span className="ios-status-right" aria-hidden="true">
        <svg viewBox="0 0 18 12" className="ios-glyph">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.4} y={8 - i * 2.4} width="3" height={4 + i * 2.4} rx="1" fill="currentColor" />
          ))}
        </svg>
        <svg viewBox="0 0 16 12" className="ios-glyph">
          <path d="M8 10.4l1.8-2.2a2.8 2.8 0 0 0-3.6 0z" fill="currentColor" />
          <path d="M3.6 5.5a6.4 6.4 0 0 1 8.8 0M1.3 3a9.8 9.8 0 0 1 13.4 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 27 13" className="ios-glyph ios-battery">
          <rect x="0.6" y="0.6" width="22" height="11.8" rx="3.4" fill="none" stroke="currentColor" strokeOpacity=".4" />
          <rect x="2.2" y="2.2" width="16" height="8.6" rx="2" fill="currentColor" />
          <path d="M24.4 4.6v3.8a2.2 2.2 0 0 0 0-3.8z" fill="currentColor" fillOpacity=".4" />
        </svg>
      </span>
    </div>
  );
}
