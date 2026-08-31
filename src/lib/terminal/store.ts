import { create } from "zustand";
import type { HistoryEntry } from "./types";

const MAX_ENTRIES = 100;

interface TerminalState {
  entries: HistoryEntry[];
  inputValue: string;
  inputHistory: string[];
  historyCursor: number | null;
  draft: string;
  booting: boolean;
  resetKey: number;
  appendEntry: (entry: HistoryEntry) => void;
  clearEntries: () => void;
  setInput: (v: string) => void;
  pushInputHistory: (line: string) => void;
  historyPrev: () => void;
  historyNext: () => void;
  setBooting: (v: boolean) => void;
}

export const useTerminal = create<TerminalState>((set) => ({
  entries: [],
  inputValue: "",
  inputHistory: [],
  historyCursor: null,
  draft: "",
  booting: false,
  resetKey: 0,
  appendEntry: (entry) =>
    set((s) => ({ entries: [...s.entries, entry].slice(-MAX_ENTRIES) })),
  clearEntries: () => set((s) => ({ entries: [], resetKey: s.resetKey + 1 })),
  setInput: (v) => set({ inputValue: v, historyCursor: null }),
  pushInputHistory: (line) =>
    set((s) =>
      s.inputHistory[s.inputHistory.length - 1] === line
        ? {}
        : { inputHistory: [...s.inputHistory, line].slice(-50) },
    ),
  historyPrev: () =>
    set((s) => {
      if (s.inputHistory.length === 0) return {};
      if (s.historyCursor === null) {
        const idx = s.inputHistory.length - 1;
        return { historyCursor: idx, draft: s.inputValue, inputValue: s.inputHistory[idx] ?? "" };
      }
      const idx = Math.max(0, s.historyCursor - 1);
      return { historyCursor: idx, inputValue: s.inputHistory[idx] ?? "" };
    }),
  historyNext: () =>
    set((s) => {
      if (s.historyCursor === null) return {};
      const idx = s.historyCursor + 1;
      if (idx >= s.inputHistory.length) {
        return { historyCursor: null, inputValue: s.draft };
      }
      return { historyCursor: idx, inputValue: s.inputHistory[idx] ?? "" };
    }),
  setBooting: (v) => set({ booting: v }),
}));
