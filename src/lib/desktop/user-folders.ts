import { create } from "zustand";

const KEY = "yavor.userFolders";

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string").slice(0, 12);
  } catch {}
  return [];
}

interface UserFolders {
  folders: string[];
  addFolder: () => string;
  removeFolder: (name: string) => void;
}

/** Folders the visitor creates on the desktop — the one bit of the fake
 *  filesystem that's genuinely writable. Persisted per-browser. */
export const useUserFolders = create<UserFolders>((set, get) => ({
  folders: typeof window === "undefined" ? [] : read(),
  addFolder: () => {
    const existing = get().folders;
    let name = "untitled folder";
    let i = 2;
    while (existing.includes(name)) name = `untitled folder ${i++}`;
    const folders = [...existing, name];
    try { localStorage.setItem(KEY, JSON.stringify(folders)); } catch {}
    set({ folders });
    return name;
  },
  removeFolder: (name) => {
    const folders = get().folders.filter((f) => f !== name);
    try { localStorage.setItem(KEY, JSON.stringify(folders)); } catch {}
    set({ folders });
  },
}));
