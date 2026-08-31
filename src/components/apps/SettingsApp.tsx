"use client";

import { useState } from "react";
import { THEMES, THEME_NAMES, type ThemeName } from "@/lib/themes";
import { useTheme } from "@/components/providers/ThemeProvider";
import { readStoredWallpaper, useWallpaper, WALLPAPERS } from "@/lib/desktop/wallpaper";

const PANES = ["Appearance", "Terminal", "About"] as const;
type Pane = (typeof PANES)[number];

export function SettingsApp() {
  const [pane, setPane] = useState<Pane>("Appearance");
  const { theme, setTheme, previewTheme } = useTheme();
  const setWallpaper = useWallpaper((s) => s.setWallpaper);
  const picked = useWallpaper((s) => s.wallpaper);
  const [initial] = useState(() => readStoredWallpaper());
  const wallpaper = picked === "sequoia" ? initial : picked;

  return (
    <div className="settings">
      <aside className="settings-sidebar">
        {PANES.map((p) => (
          <button
            key={p}
            type="button"
            className={`settings-side-item ${pane === p ? "settings-side-active" : ""}`}
            onClick={() => setPane(p)}
          >
            {p}
          </button>
        ))}
      </aside>
      <div className="settings-main">
        {pane === "Appearance" && (
          <>
            <h2>Wallpaper</h2>
            <div className="wallpaper-grid">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`wallpaper-swatch ${wallpaper === w.id ? "wallpaper-active" : ""}`}
                  style={{ background: w.css }}
                  onClick={() => setWallpaper(w.id)}
                  aria-label={w.name}
                >
                  <span>{w.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {pane === "Terminal" && (
          <>
            <h2>Terminal Profile</h2>
            <p className="settings-hint">Hover to preview, click to apply.</p>
            <div className="settings-themes">
              {THEME_NAMES.map((n: ThemeName) => (
                <button
                  key={n}
                  type="button"
                  className={`settings-theme ${theme === n ? "settings-theme-active" : ""}`}
                  onMouseEnter={() => previewTheme(n)}
                  onMouseLeave={() => previewTheme(null)}
                  onFocus={() => previewTheme(n)}
                  onBlur={() => previewTheme(null)}
                  onClick={() => setTheme(n)}
                >
                  <span
                    className="settings-theme-preview"
                    style={{ background: THEMES[n].tokens.bg, color: THEMES[n].tokens.text }}
                  >
                    <b style={{ color: THEMES[n].tokens.accent }}>❯</b> yavor
                  </span>
                  <strong>{THEMES[n].label}</strong>
                  <em>{THEMES[n].tagline}</em>
                </button>
              ))}
            </div>
          </>
        )}
        {pane === "About" && (
          <>
            <h2>About</h2>
            <p className="settings-hint">
              This desktop is a portfolio, not an operating system. Everything you can click is real
              content — the Terminal is the fastest way through it.
            </p>
            <dl className="settings-about">
              <div><dt>Machine</dt><dd>MacBook Pro (M4 Max)</dd></div>
              <div><dt>Owner</dt><dd>Yavor Belakov</dd></div>
              <div><dt>Built with</dt><dd>Next.js · TypeScript · a lot of coffee</dd></div>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
