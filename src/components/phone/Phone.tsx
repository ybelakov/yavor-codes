"use client";

import { useCallback, useEffect, useState } from "react";
import { WallpaperArt } from "@/components/desktop/WallpaperArt";
import { PhoneStatusBar } from "./PhoneStatusBar";
import { PhoneHome } from "./PhoneHome";
import { PhoneLock } from "./PhoneLock";
import { PHONE_APPS, type PhoneAppId } from "./apps";
import { TerminalApp } from "@/components/apps/TerminalApp";
import { ChromeApp } from "@/components/apps/ChromeApp";
import { FinderApp } from "@/components/apps/FinderApp";
import { NotesApp } from "@/components/apps/NotesApp";
import { PhotosApp } from "@/components/apps/PhotosApp";
import { MailApp } from "@/components/apps/MailApp";
import { SettingsApp } from "@/components/apps/SettingsApp";
import { useDesktop } from "@/lib/desktop/store";

function Surface({ id }: { id: PhoneAppId }) {
  switch (id) {
    case "terminal": return <TerminalApp />;
    case "chrome": return <ChromeApp />;
    case "notes": return <NotesApp />;
    case "photos": return <PhotosApp />;
    case "mail": return <MailApp />;
    case "settings": return <SettingsApp />;
    case "files": return <FinderApp folder="Desktop" />;
  }
}

export function Phone() {
  const [locked, setLocked] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return !sessionStorage.getItem("yc:iosUnlocked"); } catch { return true; }
  });
  const [open, setOpen] = useState<PhoneAppId | null>(null);
  const [closing, setClosing] = useState(false);
  const toast = useDesktop((s) => s.toast);

  const unlock = useCallback(() => {
    setLocked(false);
    try { sessionStorage.setItem("yc:iosUnlocked", "1"); } catch {}
  }, []);

  const goHome = useCallback(() => {
    if (!open) return;
    setClosing(true);
    setTimeout(() => {
      setOpen(null);
      setClosing(false);
    }, 260);
  }, [open]);

  /* swipe up from the bottom edge closes the app, like iOS */
  useEffect(() => {
    if (!open) return;
    let startY: number | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.clientY > window.innerHeight - 42) startY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (startY !== null && startY - e.clientY > 40) goHome();
      startY = null;
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [open, goHome]);

  if (locked) return <PhoneLock onUnlock={unlock} />;

  const dark = open === "terminal";

  return (
    <div className="iphone">
      <div className="ios-wall" aria-hidden="true"><WallpaperArt /></div>
      <PhoneStatusBar dark={dark} />

      <PhoneHome onOpen={setOpen} />

      {open && (
        <div className={`ios-app-window ${closing ? "ios-app-closing" : ""}`}>
          <div className="ios-app-body">
            <Surface id={open} />
          </div>
          <div className="ios-app-foot">
            <button type="button" className="ios-home-bar-btn" onClick={goHome} aria-label={`Close ${PHONE_APPS[open].title}`}>
              <span className="ios-home-bar" />
            </button>
          </div>
        </div>
      )}

      {toast && <p className="ios-toast" role="status">{toast}</p>}
    </div>
  );
}
