import type { AppId } from "./types";

export type NodeKind = "folder" | "text" | "image" | "pdf" | "code" | "app" | "archive" | "key";

export interface FsNode {
  name: string;
  kind: NodeKind;
  size?: string;
  modified: string;
  /** what double-clicking does */
  open?: { app: AppId; payload?: Record<string, string> };
  /** folders navigate here instead */
  goto?: string;
  appId?: AppId;
  onDesktop?: boolean;
}

export const KIND_LABEL: Record<NodeKind, string> = {
  folder: "Folder",
  text: "Plain Text",
  image: "PNG image",
  pdf: "PDF Document",
  code: "JSON Document",
  app: "Application",
  archive: "ZIP archive",
  key: "Keynote",
};

export const FS: Record<string, FsNode[]> = {
  Desktop: [
    { name: "Terminal", kind: "app", appId: "terminal", modified: "Today, 09:41", open: { app: "terminal" }, onDesktop: true },
    { name: "Projects", kind: "folder", modified: "Yesterday, 23:12", goto: "Projects", onDesktop: true },
    { name: "AIE.F events", kind: "folder", modified: "Feb 11, 2026", open: { app: "photos" }, onDesktop: true },
    { name: "read-me-first.txt", kind: "text", size: "2 KB", modified: "Today, 08:02", open: { app: "notes", payload: { note: "about" } }, onDesktop: true },
    { name: "Screenshot 2026-08-28 at 10.14.32.png", kind: "image", size: "1.4 MB", modified: "Aug 28, 2026", open: { app: "photos" }, onDesktop: true },
  ],
  Documents: [
    { name: "read-me-first.txt", kind: "text", size: "2 KB", modified: "Today, 08:02", open: { app: "notes", payload: { note: "about" } } },
    { name: "san-francisco.md", kind: "text", size: "6 KB", modified: "Dec 3, 2025", open: { app: "notes", payload: { note: "sf" } } },
    { name: "now.md", kind: "text", size: "3 KB", modified: "Today, 07:55", open: { app: "notes", payload: { note: "now" } } },
    { name: "juma-launch-deck.key", kind: "key", size: "48.2 MB", modified: "Nov 19, 2025", open: { app: "chrome", payload: { site: "juma" } } },
    { name: "aief-season-3-plan.md", kind: "text", size: "11 KB", modified: "Sep 24, 2025", open: { app: "chrome", payload: { site: "aief" } } },
    { name: "resume.pdf", kind: "pdf", size: "212 KB", modified: "Jan 7, 2026", open: { app: "notes", payload: { note: "about" } } },
    { name: "agent-blueprint-keynote.pdf", kind: "pdf", size: "9.8 MB", modified: "Jan 19, 2026", open: { app: "notes", payload: { note: "now" } } },
  ],
  Projects: [
    { name: "juma", kind: "folder", modified: "Today, 09:30", open: { app: "chrome", payload: { site: "juma" } } },
    { name: "yavor-codes", kind: "folder", modified: "Today, 10:02", open: { app: "chrome", payload: { site: "github" } } },
    { name: "bezgradski", kind: "folder", modified: "May 20, 2025", open: { app: "chrome", payload: { site: "github" } } },
    { name: "spookify", kind: "folder", modified: "Oct 31, 2025", open: { app: "chrome", payload: { site: "github" } } },
    { name: "hackerpassport", kind: "folder", modified: "Oct 13, 2025", open: { app: "chrome", payload: { site: "github" } } },
    { name: "aief-website", kind: "folder", modified: "Sep 24, 2025", open: { app: "chrome", payload: { site: "aief" } } },
  ],
  Downloads: [
    { name: "Basic_LinkedInDataExport.zip", kind: "archive", size: "8.9 MB", modified: "Apr 3, 2026", open: { app: "chrome", payload: { site: "linkedin" } } },
    { name: "dataset_linkedin-profile-posts.json", kind: "code", size: "257 KB", modified: "Jan 31, 2026", open: { app: "terminal" } },
    { name: "true-ventures-launch-party.jpg", kind: "image", size: "3.2 MB", modified: "Nov 25, 2025", open: { app: "photos" } },
    { name: "stack-auth-hackathon-receipt.pdf", kind: "pdf", size: "88 KB", modified: "Oct 13, 2025", open: { app: "notes", payload: { note: "sf" } } },
    { name: "JetBrainsMono.zip", kind: "archive", size: "2.1 MB", modified: "Aug 28, 2026" },
  ],
  Photos: [
    { name: "aief-events", kind: "folder", size: "6 items", modified: "Feb 11, 2026", open: { app: "photos" } },
    { name: "san-francisco-2025", kind: "folder", size: "41 items", modified: "Dec 3, 2025", open: { app: "notes", payload: { note: "sf" } } },
  ],
  Applications: [
    { name: "Terminal", kind: "app", appId: "terminal", modified: "Aug 31, 2026", open: { app: "terminal" } },
    { name: "Google Chrome", kind: "app", appId: "chrome", modified: "Aug 31, 2026", open: { app: "chrome" } },
    { name: "Finder", kind: "app", appId: "finder", modified: "Aug 31, 2026", open: { app: "finder" } },
    { name: "Notes", kind: "app", appId: "notes", modified: "Aug 31, 2026", open: { app: "notes" } },
    { name: "Photos", kind: "app", appId: "photos", modified: "Aug 31, 2026", open: { app: "photos" } },
    { name: "Mail", kind: "app", appId: "mail", modified: "Aug 31, 2026", open: { app: "mail" } },
    { name: "System Settings", kind: "app", appId: "settings", modified: "Aug 31, 2026", open: { app: "settings" } },
  ],
};

export const SIDEBAR_SECTIONS: { label: string; items: string[] }[] = [
  { label: "Favorites", items: ["Desktop", "Documents", "Downloads", "Projects", "Photos", "Applications"] },
];

export const DESKTOP_ITEMS = FS.Desktop!.filter((n) => n.onDesktop);
