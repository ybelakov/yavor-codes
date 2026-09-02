"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import profile from "@/content/profile.json";
import { THEMES, THEME_NAMES, type ThemeName } from "@/lib/themes";
import { useTheme } from "@/components/providers/ThemeProvider";
import { readStoredWallpaper, useWallpaper, WALLPAPERS } from "@/lib/desktop/wallpaper";
import { TrafficLights, useWindowControls } from "@/components/desktop/Window";
import { useDesktop } from "@/lib/desktop/store";

const PANES = [
  { id: "Wallpaper", tint: "#4a90d9", glyph: "▧" },
  { id: "Appearance", tint: "#7b7f88", glyph: "◐" },
  { id: "Terminal", tint: "#1c1c1e", glyph: "❯" },
  { id: "Sound", tint: "#e5484d", glyph: "♪" },
  { id: "General", tint: "#8a8a8e", glyph: "⚙" },
] as const;
type Pane = (typeof PANES)[number]["id"];

export function SettingsApp() {
  const [pane, setPane] = useState<Pane>("Wallpaper");
  const { theme, setTheme, previewTheme } = useTheme();
  const setWallpaper = useWallpaper((s) => s.setWallpaper);
  const picked = useWallpaper((s) => s.wallpaper);
  const [initial] = useState(() => readStoredWallpaper());
  const wallpaper = picked === "sequoia" ? initial : picked;
  const controls = useWindowControls();
  const soundOn = useDesktop((s) => !s.focusMode ? true : true);
  const magnify = useDesktop((s) => s.magnifyEnabled);
  const setMagnifyEnabled = useDesktop((s) => s.setMagnifyEnabled);
  const [sfx, setSfx] = useState(true);

  return (
    <div className="settings unified">
      <aside className="settings-sidebar unified-sidebar">
        <div className="unified-sidebar-top" onPointerDown={(e) => controls?.startDrag(e)}>
          <TrafficLights />
        </div>
        <div className="settings-account">
          <img src={profile.avatar} alt="" />
          <div>
            <p className="settings-account-name">{profile.name}</p>
            <p className="settings-account-sub">Apple Account</p>
          </div>
        </div>
        <div className="settings-search-wrap">
          <input className="settings-search" placeholder="Search" aria-label="Search settings" readOnly />
        </div>
        {PANES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`settings-side-item ${pane === p.id ? "settings-side-active" : ""}`}
            onClick={() => setPane(p.id)}
          >
            <span className="settings-tile" style={{ background: p.tint }}>{p.glyph}</span>
            {p.id}
          </button>
        ))}
      </aside>

      <div className="settings-main">
        <div className="settings-titlebar" onPointerDown={(e) => controls?.startDrag(e)}>
          <strong>{pane}</strong>
        </div>
        <div className="settings-scroll">
          {pane === "Wallpaper" && (
            <section className="settings-card">
              <h3>Desktop Picture</h3>
              <div className="wallpaper-grid">
                {WALLPAPERS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className={`wallpaper-swatch ${wallpaper === w.id ? "wallpaper-active" : ""}`}
                    style={{ background: w.css === "transparent" ? "linear-gradient(160deg,#cfe9f7,#2b9fdd 55%,#0b4f9e)" : w.css }}
                    onClick={() => setWallpaper(w.id)}
                    aria-label={w.name}
                  >
                    <span>{w.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {pane === "Appearance" && (
            <section className="settings-card">
              <h3>Dock</h3>
              <label className="settings-row">
                <span>Magnification</span>
                <input type="checkbox" className="sw" checked={magnify} onChange={(e) => setMagnifyEnabled(e.target.checked)} />
              </label>
              <p className="settings-note">Turn this off if the dock wave makes you seasick.</p>
            </section>
          )}

          {pane === "Terminal" && (
            <section className="settings-card">
              <h3>Profiles</h3>
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
                    <span className="settings-theme-preview" style={{ background: THEMES[n].tokens.bg, color: THEMES[n].tokens.text }}>
                      <b style={{ color: THEMES[n].tokens.accent }}>yavor@MacBook-Pro</b> ~ %
                    </span>
                    <strong>{THEMES[n].label}</strong>
                    <em>{THEMES[n].tagline}</em>
                  </button>
                ))}
              </div>
            </section>
          )}

          {pane === "Sound" && (
            <section className="settings-card">
              <h3>Sound Effects</h3>
              <label className="settings-row">
                <span>Play user interface sound effects</span>
                <input
                  type="checkbox"
                  className="sw"
                  checked={sfx}
                  onChange={(e) => {
                    setSfx(e.target.checked);
                    import("@/lib/desktop/sounds").then((m) => m.setMuted(!e.target.checked));
                  }}
                />
              </label>
              <p className="settings-note">Approximations, not Apple&rsquo;s actual sounds.</p>
            </section>
          )}

          {pane === "General" && (
            <section className="settings-card">
              <h3>About</h3>
              <dl className="settings-about">
                <div><dt>Machine</dt><dd>MacBook Pro 14&Prime; (M4 Max)</dd></div>
                <div><dt>Owner</dt><dd>{profile.name}</dd></div>
                <div><dt>Built with</dt><dd>Next.js · TypeScript · a lot of coffee</dd></div>
              </dl>
              <p className="settings-note">
                This desktop is a portfolio, not an operating system. The Terminal is the fastest way through it.
              </p>
              {soundOn ? null : null}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
