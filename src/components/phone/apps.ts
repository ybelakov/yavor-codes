export type PhoneAppId = "terminal" | "chrome" | "notes" | "photos" | "mail" | "settings" | "files";

export const PHONE_APPS: Record<PhoneAppId, { label: string; icon: string; title: string }> = {
  terminal: { label: "Terminal", icon: "terminal", title: "Terminal" },
  chrome: { label: "Chrome", icon: "chrome", title: "Google Chrome" },
  notes: { label: "Notes", icon: "notes", title: "Notes" },
  photos: { label: "Photos", icon: "photos", title: "Photos" },
  mail: { label: "Mail", icon: "mail", title: "Mail" },
  settings: { label: "Settings", icon: "settings", title: "Settings" },
  files: { label: "Files", icon: "folder", title: "Files" },
};

export const PHONE_GRID: PhoneAppId[] = ["terminal", "chrome", "notes", "photos", "files", "settings"];
export const PHONE_DOCK: PhoneAppId[] = ["terminal", "chrome", "photos", "mail"];
