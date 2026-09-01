"use client";

import { useEffect, useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { Icon } from "./AppIcons";

export function NotificationBanner() {
  const bootDone = useDesktop((s) => s.bootDone);
  const overlay = useDesktop((s) => s.overlay);
  const openApp = useDesktop((s) => s.openApp);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!bootDone || overlay) return;
    let seen = false;
    try { seen = !!sessionStorage.getItem("yc:notif"); } catch {}
    if (seen) return;
    const inT = setTimeout(() => {
      setShow(true);
      try { sessionStorage.setItem("yc:notif", "1"); } catch {}
    }, 9000);
    return () => clearTimeout(inT);
  }, [bootDone, overlay]);

  useEffect(() => {
    if (!show) return;
    const outT = setTimeout(() => setShow(false), 8000);
    return () => clearTimeout(outT);
  }, [show]);

  if (!show) return null;

  return (
    <div className="notif" role="status">
      <button
        type="button"
        className="notif-body"
        onClick={() => {
          setShow(false);
          openApp("chrome", { site: "aief" });
        }}
      >
        <span className="notif-icon"><Icon name="calendar" /></span>
        <span className="notif-text">
          <strong>After Hours #51</strong>
          <span>Wednesday, 7:00 PM · Work&Share, Synergy Tower</span>
        </span>
      </button>
      <button type="button" className="notif-close" aria-label="Dismiss" onClick={() => setShow(false)}>
        ×
      </button>
    </div>
  );
}
