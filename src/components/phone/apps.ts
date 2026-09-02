export type PhoneAppId = "terminal" | "safari" | "notes" | "photos" | "mail" | "settings" | "files";

export const PHONE_APPS: Record<PhoneAppId, { label: string; icon: string; title: string; dark?: boolean }> = {
  terminal: { label: "Terminal", icon: "terminal", title: "Terminal", dark: true },
  safari: { label: "Safari", icon: "safari", title: "Safari" },
  notes: { label: "Notes", icon: "notes", title: "Notes" },
  photos: { label: "Photos", icon: "photos", title: "Photos", dark: true },
  mail: { label: "Mail", icon: "mail", title: "Mail" },
  settings: { label: "Settings", icon: "settings", title: "Settings" },
  files: { label: "Files", icon: "files", title: "Files" },
};

export const PHONE_GRID: PhoneAppId[] = ["terminal", "notes", "photos", "files"];
export const PHONE_DOCK: PhoneAppId[] = ["settings", "safari", "mail", "terminal"];
