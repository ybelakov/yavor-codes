"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useDesktop, type MenuSpecEntry } from "@/lib/desktop/store";
import { APPS } from "@/lib/desktop/apps-meta";
import { appleMenu, menuEntriesFor, menuTitlesFor } from "@/lib/desktop/menus";

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

/* clock kept outside React so SSR and first client paint agree */
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
  const tick = useSyncExternalStore(subscribeClock, () => clockTick, () => 0);
  if (!tick) return "";
  const now = new Date(tick);
  const day = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day.replace(",", "")} ${time}`;
}

function Dropdown({ entries, left, onClose }: { entries: MenuSpecEntry[]; left: number; onClose: () => void }) {
  return (
    <div className="menu-dropdown" style={{ left }} role="menu">
      {entries.map((e, i) =>
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
              onClose();
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

type StatusPop = "battery" | "wifi" | "cc" | null;

export function MenuBar() {
  const activeAppId = useDesktop((s) => s.activeAppId);
  const setSpotlight = useDesktop((s) => s.setSpotlight);
  const [menuOpen, setMenuOpenState] = useState<string | null>(null);
  const [menuLeft, setMenuLeft] = useState(4);
  const setMenuOpen = (title: string | null, el?: HTMLElement) => {
    setMenuOpenState(title);
    if (el) setMenuLeft(Math.max(4, el.offsetLeft));
  };
  const [statusPop, setStatusPop] = useState<StatusPop>(null);
  const clock = useClock();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) {
        setMenuOpen(null);
        setStatusPop(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(null);
        setStatusPop(null);
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const activeName = activeAppId ? APPS[activeAppId].name : "Finder";
  const titles = menuTitlesFor(activeAppId);
  const anyOpen = menuOpen !== null;

  /* real macOS: once one menu is open, hovering another title switches to it */
  const titleProps = (title: string) => ({
    onClick: (e: React.MouseEvent<HTMLButtonElement>) =>
      setMenuOpen(menuOpen === title ? null : title, e.currentTarget),
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) =>
      anyOpen && setMenuOpen(title, e.currentTarget),
  });

  return (
    <div className="menubar" ref={barRef}>
      <div className="menubar-left">
        <button
          type="button"
          className={`menubar-item menubar-apple ${menuOpen === "apple" ? "menu-open" : ""}`}
          {...titleProps("apple")}
          aria-label="Apple menu"
        >
          <AppleLogo />
        </button>
        <button
          type="button"
          className={`menubar-item menubar-appname ${menuOpen === "app" ? "menu-open" : ""}`}
          {...titleProps("app")}
        >
          {activeName}
        </button>
        {titles.map((m) => (
          <button
            key={m}
            type="button"
            className={`menubar-item ${menuOpen === m ? "menu-open" : ""}`}
            {...titleProps(m)}
          >
            {m}
          </button>
        ))}

        {menuOpen === "apple" && <Dropdown entries={appleMenu()} left={menuLeft} onClose={() => setMenuOpen(null)} />}
        {menuOpen === "app" && (
          <Dropdown
            entries={[
              { label: `About ${activeName}`, run: () => useDesktop.getState().openApp("about") },
              "sep",
              { label: `Hide ${activeName}`, shortcut: "⌘H", disabled: true },
              { label: "Hide Others", shortcut: "⌥⌘H", disabled: true },
              "sep",
              {
                label: `Quit ${activeName}`,
                shortcut: "⌘Q",
                run: () => {
                  const s = useDesktop.getState();
                  s.windows.filter((w) => w.appId === s.activeAppId).forEach((w) => s.close(w.id));
                },
              },
            ]}
            left={menuLeft}
            onClose={() => setMenuOpen(null)}
          />
        )}
        {menuOpen && menuOpen !== "apple" && menuOpen !== "app" && (
          <Dropdown entries={menuEntriesFor(activeAppId, menuOpen)} left={menuLeft} onClose={() => setMenuOpen(null)} />
        )}
      </div>

      <div className="menubar-right">
        <button
          type="button"
          className={`menubar-status ${statusPop === "battery" ? "menu-open" : ""}`}
          onClick={() => setStatusPop(statusPop === "battery" ? null : "battery")}
          aria-label="Battery"
        >
          <svg viewBox="0 0 26 13" className="menubar-glyph">
            <rect x="0.6" y="0.6" width="21" height="11" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.5" />
            <rect x="2.2" y="2.2" width="17" height="7.8" rx="1.6" fill="currentColor" />
            <path d="M23 4.5v4a2.4 2.4 0 0 0 0-4z" fill="currentColor" fillOpacity="0.5" />
          </svg>
        </button>
        <button
          type="button"
          className={`menubar-status ${statusPop === "wifi" ? "menu-open" : ""}`}
          onClick={() => setStatusPop(statusPop === "wifi" ? null : "wifi")}
          aria-label="Wi-Fi"
        >
          <svg viewBox="0 0 16 12" className="menubar-glyph">
            <path d="M8 10.6l1.9-2.3a2.9 2.9 0 0 0-3.8 0z" fill="currentColor" />
            <path d="M3.6 5.6a6.6 6.6 0 0 1 8.8 0M1.2 3a10 10 0 0 1 13.6 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="menubar-status" onClick={() => setSpotlight(true)} aria-label="Spotlight">
          <svg viewBox="0 0 14 14" className="menubar-glyph">
            <circle cx="6.2" cy="6.2" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.6 9.6L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className={`menubar-status ${statusPop === "cc" ? "menu-open" : ""}`}
          onClick={() => setStatusPop(statusPop === "cc" ? null : "cc")}
          aria-label="Control Center"
        >
          <svg viewBox="0 0 16 12" className="menubar-glyph">
            <rect x="0.7" y="0.7" width="14.6" height="4.2" rx="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="11" cy="2.8" r="1.15" fill="currentColor" />
            <rect x="0.7" y="7.1" width="14.6" height="4.2" rx="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="5" cy="9.2" r="1.15" fill="currentColor" />
          </svg>
        </button>
        <span className="menubar-clock">{clock}</span>

        {statusPop === "battery" && (
          <div className="status-pop">
            <p className="status-pop-title">Battery</p>
            <p className="status-pop-row"><span>100%</span><span className="status-dim">Power Adapter</span></p>
            <hr />
            <p className="status-dim status-pop-note">Using significant energy: Cursor</p>
          </div>
        )}
        {statusPop === "wifi" && (
          <div className="status-pop">
            <p className="status-pop-title">Wi-Fi</p>
            {["Work&Share 5G", "AIEF-Guest", "iPhone (Yavor)"].map((n, i) => (
              <p key={n} className="status-pop-row">
                <span>{n}</span>
                <span className="status-dim">{i === 0 ? "✓" : ""}</span>
              </p>
            ))}
          </div>
        )}
        {statusPop === "cc" && (
          <div className="status-pop status-pop-cc">
            <div className="cc-tiles">
              <div className="cc-tile cc-on">Wi-Fi<br /><small>Work&Share 5G</small></div>
              <div className="cc-tile cc-on">Bluetooth<br /><small>On</small></div>
              <div className="cc-tile">AirDrop<br /><small>Contacts Only</small></div>
              <div className="cc-tile">Focus<br /><small>Shipping</small></div>
            </div>
            <label className="cc-slider">
              <span>Display</span>
              <input type="range" defaultValue={82} aria-label="Display brightness" />
            </label>
            <label className="cc-slider">
              <span>Sound</span>
              <input type="range" defaultValue={55} aria-label="Volume" />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
