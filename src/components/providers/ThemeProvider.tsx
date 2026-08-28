"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, STORAGE_KEY, THEMES, isThemeName, type ThemeName } from "@/lib/themes";
import { registerThemeSetter } from "@/lib/terminal/run";
import { trackEvent } from "@/lib/analytics";

interface ThemeCtx {
  theme: ThemeName;
  setTheme: (name: string) => boolean;
  previewTheme: (name: ThemeName | null) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: DEFAULT_THEME, setTheme: () => false, previewTheme: () => {} });

export function useTheme(): ThemeCtx {
  return useContext(Ctx);
}

function applyDom(name: ThemeName): void {
  document.documentElement.dataset.theme = name;
  document.documentElement.style.colorScheme = THEMES[name].colorScheme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEMES[name].tokens.bg);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof document !== "undefined") {
      const current = document.documentElement.dataset.theme;
      if (isThemeName(current)) return current;
    }
    return DEFAULT_THEME;
  });

  const setTheme = useCallback(
    (name: string): boolean => {
      if (!isThemeName(name)) return false;
      trackEvent("theme_change", { theme: name });
      setThemeState((prev) => {
        if (prev === name) return prev;
        return name;
      });
      applyDom(name);
      try {
        localStorage.setItem(STORAGE_KEY, name);
      } catch {}
      return true;
    },
    [],
  );

  const previewTheme = useCallback(
    (name: ThemeName | null) => {
      applyDom(name ?? theme);
    },
    [theme],
  );

  useEffect(() => {
    registerThemeSetter(setTheme);
  }, [setTheme]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && isThemeName(e.newValue)) {
        setThemeState(e.newValue);
        applyDom(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <Ctx.Provider value={{ theme, setTheme, previewTheme }}>{children}</Ctx.Provider>;
}
