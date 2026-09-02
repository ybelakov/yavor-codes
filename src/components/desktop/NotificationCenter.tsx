"use client";

import { useEffect } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { Icon } from "./AppIcons";
import aief from "@/content/aief.json";

export function NotificationCenter() {
  const open = useDesktop((s) => s.ncOpen);
  const setNcOpen = useDesktop((s) => s.setNcOpen);
  const openApp = useDesktop((s) => s.openApp);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNcOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setNcOpen]);

  if (!open) return null;

  const upcoming = aief.milestones.slice(-3).reverse();

  return (
    <>
      <div className="nc-scrim" onPointerDown={() => setNcOpen(false)} />
      <aside className="notification-center" aria-label="Notification Center">
        <div className="nc-card nc-notif">
          <button type="button" onClick={() => { setNcOpen(false); openApp("chrome", { site: "aief" }); }}>
            <span className="nc-icon"><Icon name="calendar" /></span>
            <span className="nc-text">
              <strong>After Hours #51</strong>
              <span>Wednesday, 7:00 PM · Work&amp;Share, Synergy Tower</span>
            </span>
          </button>
        </div>

        <p className="nc-heading">Widgets</p>

        <div className="nc-card nc-widget">
          <p className="nc-widget-title">AIE.F Europe</p>
          <ul className="nc-list">
            {upcoming.map((m) => (
              <li key={m.text}><span>{m.date}</span>{m.text}</li>
            ))}
          </ul>
        </div>

        <div className="nc-card nc-widget">
          <p className="nc-widget-title">Screen Time</p>
          <div className="nc-bars">
            {[62, 88, 40, 95, 71, 30, 12].map((v, i) => (
              <span key={i} style={{ height: `${v}%` }} />
            ))}
          </div>
          <p className="nc-widget-sub">Mostly Terminal. As it should be.</p>
        </div>
      </aside>
    </>
  );
}
