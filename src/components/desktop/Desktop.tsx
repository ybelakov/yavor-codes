"use client";

import { useCallback } from "react";
import { useDesktop } from "@/lib/desktop/store";

import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { DesktopIcons } from "./DesktopIcons";
import { Window } from "./Window";
import { BootScreen } from "./BootScreen";
import { TerminalApp } from "@/components/apps/TerminalApp";
import { ChromeApp } from "@/components/apps/ChromeApp";
import { FinderApp } from "@/components/apps/FinderApp";
import { NotesApp } from "@/components/apps/NotesApp";
import { PhotosApp } from "@/components/apps/PhotosApp";
import { MailApp } from "@/components/apps/MailApp";
import { SettingsApp } from "@/components/apps/SettingsApp";
import { AboutMacApp } from "@/components/apps/AboutMacApp";
import type { WindowState } from "@/lib/desktop/types";

function AppSurface({ win }: { win: WindowState }) {
  switch (win.appId) {
    case "terminal": return <TerminalApp />;
    case "chrome": return <ChromeApp site={win.payload?.site} />;
    case "finder": return <FinderApp />;
    case "notes": return <NotesApp note={win.payload?.note} />;
    case "photos": return <PhotosApp />;
    case "mail": return <MailApp />;
    case "settings": return <SettingsApp />;
    case "about": return <AboutMacApp />;
    default: return null;
  }
}

export function Desktop() {
  const windows = useDesktop((s) => s.windows);
  const openApp = useDesktop((s) => s.openApp);
  const bootDone = useDesktop((s) => s.bootDone);
  const setBootDone = useDesktop((s) => s.setBootDone);
  const handleBootDone = useCallback(() => {
    setBootDone();
    // open the Terminal so the site still leads with its best trick
    setTimeout(() => openApp("terminal"), 260);
  }, [openApp, setBootDone]);

  return (
    <div className="desktop">
      {!bootDone && <BootScreen onDone={handleBootDone} />}
      <MenuBar />
      <DesktopIcons />
      {windows.map((win) => (
        <Window key={win.id} win={win}>
          <AppSurface win={win} />
        </Window>
      ))}
      <Dock />
    </div>
  );
}
