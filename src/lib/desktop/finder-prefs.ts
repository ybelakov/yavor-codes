import { create } from "zustand";

export type FinderView = "icon" | "list" | "columns";
export type SortKey = "name" | "kind" | "modified";

interface FinderPrefs {
  view: FinderView;
  sortBy: SortKey;
  sortAsc: boolean;
  setView: (v: FinderView) => void;
  setSort: (k: SortKey) => void;
}

export const useFinderPrefs = create<FinderPrefs>((set) => ({
  view: "list",
  sortBy: "name",
  sortAsc: true,
  setView: (view) => set({ view }),
  setSort: (k) =>
    set((s) => (s.sortBy === k ? { sortAsc: !s.sortAsc } : { sortBy: k, sortAsc: true })),
}));
