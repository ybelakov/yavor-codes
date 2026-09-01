"use client";

import { useCallback, useEffect } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { desktopMenuItems } from "@/lib/desktop/file-menu";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { DesktopIcons } from "./DesktopIcons";
import { Window } from "./Window";
import { BootScreen } from "./BootScreen";
import { WallpaperArt } from "./WallpaperArt";
import { Widgets } from "./Widgets";
import { Spotlight } from "./Spotlight";
import { ContextMenuOverlay } from "./ContextMenu";
import { PowerOverlay } from "./PowerOverlay";
import { NotificationBanner } from "./NotificationBanner";
import { TerminalApp } from "@/components/apps/TerminalApp";
import { ChromeApp } from "@/components/apps/ChromeApp";
import { FinderApp } from "@/components/apps/FinderApp";
import { NotesApp } from "@/components/apps/NotesApp";
import { PhotosApp } from "@/components/apps/PhotosApp";
import { MailApp } from "@/components/apps/MailApp";
import { SettingsApp } from "@/components/apps/SettingsApp";
import { AboutMacApp } from "@/components/apps/AboutMacApp";
import { InfoApp } from "@/components/apps/InfoApp";
import type { WindowState } from "@/lib/desktop/types";

function AppSurface({ win }: { win: WindowState }) {
  switch (win.appId) {
    case "terminal": return <TerminalApp />;
    case "chrome": return <ChromeApp site={win.payload?.site} />;
    case "finder": return <FinderApp folder={win.payload?.folder} />;
    case "notes": return <NotesApp note={win.payload?.note} />;
    case "photos": return <PhotosApp />;
    case "mail": return <MailApp />;
    case "settings": return <SettingsApp />;
    case "about": return <AboutMacApp />;
    case "info": return <InfoApp {...win.payload} />;
    default: return null;
  }
}

export function Desktop() {
  const windows = useDesktop((s) => s.windows);
  const openApp = useDesktop((s) => s.openApp);
  const bootDone = useDesktop((s) => s.bootDone);
  const setBootDone = useDesktop((s) => s.setBootDone);
  const setOverlay = useDesktop((s) => s.setOverlay);
  const setActiveApp = useDesktop((s) => s.setActiveApp);
  const setSpotlight = useDesktop((s) => s.setSpotlight);
  const openContextMenu = useDesktop((s) => s.openContextMenu);
  const toast = useDesktop((s) => s.toast);

  const handleBootDone = useCallback(
    (played: boolean) => {
      setBootDone();
      if (played) {
        setOverlay("login");
      } else {
        setTimeout(() => openApp("terminal"), 260);
      }
    },
    [openApp, setBootDone, setOverlay],
  );

  /* login dismissed → open the Terminal like a fresh session */
  const overlay = useDesktop((s) => s.overlay);
  useEffect(() => {
    if (bootDone && overlay === null) {
      const s = useDesktop.getState();
      if (s.windows.length === 0) {
        const t = setTimeout(() => useDesktop.getState().openApp("terminal"), 300);
        return () => clearTimeout(t);
      }
    }
  }, [bootDone, overlay]);

  /* keyboard: cmd+K opens Spotlight */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpotlight(!useDesktop.getState().spotlightOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSpotlight]);

  const onBackgroundDown = (e: React.PointerEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest(".window, .dock, .menubar, .widget, .desk-icon, .context-menu, .spotlight, .notif")) return;
    setActiveApp(null); // Finder
  };

  const onContextMenu = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest(".window, .dock, .menubar, .widget, .desk-icon, .context-menu, .spotlight, .notif")) return;
    e.preventDefault();
    openContextMenu({ x: e.clientX, y: e.clientY, items: desktopMenuItems() });
  };

  return (
    <div className="desktop" onPointerDown={onBackgroundDown} onContextMenu={onContextMenu}>
      <WallpaperArt />
      {!bootDone && <BootScreen onDone={handleBootDone} />}
      <MenuBar />
      <Widgets />
      <DesktopIcons />
      {windows.map((win) => (
        <Window key={win.id} win={win}>
          <AppSurface win={win} />
        </Window>
      ))}
      <Dock />
      <Spotlight />
      <ContextMenuOverlay />
      <NotificationBanner />
      <PowerOverlay />
      {toast && <p className="trash-toast os-toast" role="status">{toast}</p>}
    </div>
  );
}
