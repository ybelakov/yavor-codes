"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { APPS } from "@/lib/desktop/apps-meta";

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="apple-logo" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.6 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.2-.8c-1.6 0-3.1 1-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8 2.2-1.2 3-2.3c.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.6-3.7zM15.2 4.9c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"
      />
    </svg>
  );
}

/* The clock lives outside React so the menu bar never sets state from an
   effect (and so SSR and first client render agree on an empty string). */
let clockTick = 0;
const clockListeners = new Set<() => void>();

function subscribeClock(cb: () => void): () => void {
  clockListeners.add(cb);
  if (clockListeners.size === 1) {
    clockTick = Date.now();
    queueMicrotask(() => clockListeners.forEach((l) => l()));
  }
  const t = setInterval(() => {
    clockTick = Date.now();
    clockListeners.forEach((l) => l());
  }, 30_000);
  return () => {
    clearInterval(t);
    clockListeners.delete(cb);
  };
}

function useClock(): string {
  const tick = useSyncExternalStore(
    subscribeClock,
    () => clockTick,
    () => 0,
  );
  if (!tick) return "";
  const now = new Date(tick);
  const day = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day.replace(",", "")} ${time}`;
}

const MENUS = ["File", "Edit", "View", "Go", "Window", "Help"];

export function MenuBar() {
  const activeAppId = useDesktop((s) => s.activeAppId);
  const openApp = useDesktop((s) => s.openApp);
  const windows = useDesktop((s) => s.windows);
  const closeWin = useDesktop((s) => s.close);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const clock = useClock();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setMenuOpen(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const activeName = activeAppId ? APPS[activeAppId].name : "Finder";
  const activeWindow = windows.find((w) => w.appId === activeAppId && !w.minimized);

  return (
    <div className="menubar" ref={barRef}>
      <div className="menubar-left">
        <button
          type="button"
          className={`menubar-item menubar-apple ${menuOpen === "apple" ? "menu-open" : ""}`}
          onClick={() => setMenuOpen(menuOpen === "apple" ? null : "apple")}
          aria-label="Apple menu"
        >
          <AppleLogo />
        </button>
        <span className="menubar-item menubar-appname">{activeName}</span>
        {MENUS.map((m) => (
          <button
            key={m}
            type="button"
            className={`menubar-item ${menuOpen === m ? "menu-open" : ""}`}
            onClick={() => setMenuOpen(menuOpen === m ? null : m)}
          >
            {m}
          </button>
        ))}

        {menuOpen === "apple" && (
          <div className="menu-dropdown menu-dropdown-apple">
            <button type="button" onClick={() => { openApp("about"); setMenuOpen(null); }}>
              About This Mac
            </button>
            <hr />
            <button type="button" onClick={() => { openApp("settings"); setMenuOpen(null); }}>
              System Settings…
            </button>
            <hr />
            <button type="button" className="menu-disabled" disabled>Sleep</button>
            <button type="button" className="menu-disabled" disabled>Restart…</button>
            <button type="button" className="menu-disabled" disabled>Shut Down…</button>
          </div>
        )}
        {menuOpen && menuOpen !== "apple" && (
          <div className="menu-dropdown">
            {menuOpen === "Go" ? (
              <>
                {(["Desktop", "Documents", "Downloads", "Projects", "Applications"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => { openApp("finder", { folder: f }); setMenuOpen(null); }}>
                    {f}
                  </button>
                ))}
              </>
            ) : menuOpen === "Window" && activeWindow ? (
              <button type="button" onClick={() => { closeWin(activeWindow.id); setMenuOpen(null); }}>
                Close Window
              </button>
            ) : menuOpen === "Help" ? (
              <button type="button" onClick={() => { openApp("terminal"); setMenuOpen(null); }}>
                Open Terminal and type &lsquo;help&rsquo;
              </button>
            ) : (
              <button type="button" className="menu-disabled" disabled>
                Nothing here — it&rsquo;s a portfolio
              </button>
            )}
          </div>
        )}
      </div>

      <div className="menubar-right">
        <svg viewBox="0 0 26 13" className="menubar-glyph" aria-label="Battery">
          <rect x="0.6" y="0.6" width="21" height="11" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.5" />
          <rect x="2.2" y="2.2" width="17" height="7.8" rx="1.6" fill="currentColor" />
          <path d="M23 4.5v4a2.4 2.4 0 0 0 0-4z" fill="currentColor" fillOpacity="0.5" />
        </svg>
        <svg viewBox="0 0 16 12" className="menubar-glyph" aria-label="Wi-Fi">
          <path d="M8 10.6l1.9-2.3a2.9 2.9 0 0 0-3.8 0z" fill="currentColor" />
          <path d="M3.6 5.6a6.6 6.6 0 0 1 8.8 0M1.2 3a10 10 0 0 1 13.6 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 14 14" className="menubar-glyph" aria-label="Search">
          <circle cx="6.2" cy="6.2" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.6 9.6L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 16 12" className="menubar-glyph" aria-label="Control Center">
          <rect x="0.7" y="0.7" width="14.6" height="4.2" rx="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="11" cy="2.8" r="1.15" fill="currentColor" />
          <rect x="0.7" y="7.1" width="14.6" height="4.2" rx="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="5" cy="9.2" r="1.15" fill="currentColor" />
        </svg>
        <span className="menubar-clock">{clock}</span>
      </div>
    </div>
  );
}
