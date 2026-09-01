import { useDesktop, type MenuSpecEntry } from "./store";
import type { AppId } from "./types";
import { runCommand } from "@/lib/terminal/run";

const d = () => useDesktop.getState();

function activeWindow() {
  const s = d();
  return s.windows.filter((w) => !w.minimized && w.appId === s.activeAppId).sort((a, b) => b.z - a.z)[0];
}

const item = (label: string, shortcut?: string, run?: () => void): MenuSpecEntry =>
  run ? { label, shortcut, run } : { label, shortcut, disabled: true };

const EDIT: MenuSpecEntry[] = [
  item("Undo", "⌘Z"),
  item("Redo", "⇧⌘Z"),
  "sep",
  item("Cut", "⌘X"),
  item("Copy", "⌘C"),
  item("Paste", "⌘V"),
  item("Select All", "⌘A"),
];

const VIEW: MenuSpecEntry[] = [
  item("Show Tab Bar", "⇧⌘T"),
  item("Show All Tabs", "⇧⌘\\"),
  "sep",
  item("Enter Full Screen", "🌐F"),
];

function windowMenu(): MenuSpecEntry[] {
  const win = activeWindow();
  const s = d();
  return [
    item("Minimize", "⌘M", win ? () => s.minimize(win.id) : undefined),
    item("Zoom", undefined, win ? () => s.toggleMaximize(win.id) : undefined),
    "sep",
    item("Bring All to Front"),
    ...(win ? ["sep" as const, { label: `✓ ${win.title}`, run: () => s.focus(win.id) }] : []),
  ];
}

const HELP: MenuSpecEntry[] = [
  item("yavor.codes Help", undefined, () => {
    d().openApp("terminal");
    runCommand("help", "chip");
  }),
];

function fileMenu(appId: AppId | null): MenuSpecEntry[] {
  const s = d();
  const win = activeWindow();
  return [
    item("New Window", "⌘N", appId ? () => s.openApp(appId) : undefined),
    item("New Tab", "⌘T"),
    item("Open…", "⌘O"),
    "sep",
    item("Close Window", "⌘W", win ? () => s.close(win.id) : undefined),
    item("Save", "⌘S"),
    "sep",
    item("Print…", "⌘P"),
  ];
}

const goMenu = (): MenuSpecEntry[] =>
  (["Desktop", "Documents", "Downloads", "Projects", "Applications"] as const).map((f) =>
    item(f, undefined, () => d().openApp("finder", { folder: f })),
  );

export function menuTitlesFor(appId: AppId | null): string[] {
  switch (appId) {
    case "terminal": return ["Shell", "Edit", "View", "Window", "Help"];
    case "chrome": return ["File", "Edit", "View", "History", "Bookmarks", "Window", "Help"];
    case "notes": return ["File", "Edit", "Format", "View", "Window", "Help"];
    case "photos": return ["File", "Edit", "Image", "View", "Window", "Help"];
    case "mail": return ["File", "Edit", "View", "Mailbox", "Message", "Window", "Help"];
    default: return ["File", "Edit", "View", "Go", "Window", "Help"];
  }
}

export function menuEntriesFor(appId: AppId | null, title: string): MenuSpecEntry[] {
  const s = d();
  switch (title) {
    case "File": return fileMenu(appId);
    case "Shell":
      return [
        item("New Window", "⌘N", () => s.openApp("terminal")),
        item("New Tab", "⌘T"),
        "sep",
        item("Close Window", "⌘W", activeWindow() ? () => s.close(activeWindow()!.id) : undefined),
      ];
    case "Edit": return EDIT;
    case "View": return VIEW;
    case "Go": return goMenu();
    case "History":
      return [
        item("Home", "⇧⌘H", () => s.openApp("chrome", { site: "juma" })),
        "sep",
        item("juma.ai", undefined, () => s.openApp("chrome", { site: "juma" })),
        item("AI Engineer Foundation Europe", undefined, () => s.openApp("chrome", { site: "aief" })),
        item("Yavor Belakov | LinkedIn", undefined, () => s.openApp("chrome", { site: "linkedin" })),
      ];
    case "Bookmarks":
      return [
        item("Bookmark This Tab…", "⌘D"),
        "sep",
        item("juma.ai", undefined, () => s.openApp("chrome", { site: "juma" })),
        item("aief.europe", undefined, () => s.openApp("chrome", { site: "aief" })),
        item("linkedin.com", undefined, () => s.openApp("chrome", { site: "linkedin" })),
        item("github.com/ybelakov", undefined, () => s.openApp("chrome", { site: "github" })),
      ];
    case "Format":
      return [item("Bold", "⌘B"), item("Italic", "⌘I"), item("Underline", "⌘U"), "sep", item("Make Checklist", "⇧⌘L")];
    case "Image":
      return [item("Rotate Counterclockwise", "⌘R"), item("Duplicate", "⌘D"), "sep", item("Adjust Date and Time…")];
    case "Mailbox": return [item("Get New Mail", "⇧⌘N"), "sep", item("Erase Junk Mail", "⌥⌘J")];
    case "Message":
      return [item("Send", "⇧⌘D", () => { s.showToast("Use the Send button — it opens your real mail app."); }), item("Reply", "⌘R")];
    case "Window": return windowMenu();
    case "Help": return HELP;
    default: return [];
  }
}

export function appleMenu(): MenuSpecEntry[] {
  const s = d();
  const win = activeWindow();
  return [
    item("About This Mac", undefined, () => s.openApp("about")),
    "sep",
    item("System Settings…", undefined, () => s.openApp("settings")),
    item("App Store…"),
    "sep",
    item("Recent Items"),
    "sep",
    item(
      "Force Quit…",
      "⌥⌘⎋",
      win
        ? () => {
            s.close(win.id);
            s.showToast(`${win.title} was force quit. It didn't have unsaved changes. Probably.`);
          }
        : undefined,
    ),
    "sep",
    item("Sleep", undefined, () => s.setOverlay("sleep")),
    item("Restart…", undefined, () => {
      try { localStorage.removeItem("yc:booted"); } catch {}
      window.location.reload();
    }),
    item("Shut Down…", undefined, () => s.setOverlay("off")),
    "sep",
    item("Lock Screen", "⌃⌘Q", () => s.setOverlay("login")),
    item("Log Out Yavor Belakov…", "⇧⌘Q", () => s.setOverlay("login")),
  ];
}
