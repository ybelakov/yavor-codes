"use client";

import { useCallback, useEffect, useState } from "react";
import { WallpaperArt } from "@/components/desktop/WallpaperArt";
import { PhoneStatusBar } from "./PhoneStatusBar";
import { PhoneHome } from "./PhoneHome";
import { PhoneLock } from "./PhoneLock";
import { PHONE_APPS, type PhoneAppId } from "./apps";
import { IosSettings } from "@/components/ios/apps/IosSettings";
import { IosNotes } from "@/components/ios/apps/IosNotes";
import { IosPhotos } from "@/components/ios/apps/IosPhotos";
import { IosMail } from "@/components/ios/apps/IosMail";
import { IosSafari } from "@/components/ios/apps/IosSafari";
import { IosFiles } from "@/components/ios/apps/IosFiles";
import { IosTerminal } from "@/components/ios/apps/IosTerminal";
import { useDesktop } from "@/lib/desktop/store";

function Surface({ id }: { id: PhoneAppId }) {
  switch (id) {
    case "terminal": return <IosTerminal />;
    case "safari": return <IosSafari />;
    case "notes": return <IosNotes />;
    case "photos": return <IosPhotos />;
    case "mail": return <IosMail />;
    case "settings": return <IosSettings />;
    case "files": return <IosFiles />;
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
    setOpen((cur) => {
      if (!cur) return cur;
      setClosing(true);
      setTimeout(() => { setOpen(null); setClosing(false); }, 260);
      return cur;
    });
  }, []);

  /* swipe up from the bottom edge, like iOS */
  useEffect(() => {
    if (!open) return;
    let startY: number | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.clientY > window.innerHeight - 34) startY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (startY !== null && startY - e.clientY > 36) goHome();
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

  const meta = open ? PHONE_APPS[open] : null;

  return (
    <div className={`iphone ${meta?.dark ? "iphone-dark-app" : ""}`}>
      <div className="ios-wall" aria-hidden="true"><WallpaperArt /></div>
      <PhoneStatusBar dark={meta?.dark} />
      <PhoneHome onOpen={setOpen} />

      {open && (
        <div className={`ios-app-window ${closing ? "ios-app-closing" : ""} ${meta?.dark ? "ios-app-dark" : ""}`}>
          <div className="ios-app-body"><Surface id={open} /></div>
          <button type="button" className="ios-home-bar-btn" onClick={goHome} aria-label={`Close ${meta?.title}`}>
            <span className="ios-home-bar" />
          </button>
        </div>
      )}

      {toast && <p className="ios-toast" role="status">{toast}</p>}
    </div>
  );
}
