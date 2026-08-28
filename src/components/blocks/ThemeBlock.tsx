"use client";

import { THEMES, THEME_NAMES, isThemeName, type ThemeName } from "@/lib/themes";
import { useTheme } from "@/components/providers/ThemeProvider";
import { runCommand } from "@/lib/terminal/run";
import { ChipRow } from "./shared";

function Swatches({ name }: { name: ThemeName }) {
  const t = THEMES[name].tokens;
  return (
    <span className="swatch-row" aria-hidden="true">
      {[t.bg, t.text, t.accent, t.accent2, t.error].map((c, i) => (
        <span key={i} className="swatch swatch-bordered" style={{ background: c }} />
      ))}
    </span>
  );
}

export function ThemeListBlock() {
  const { theme, previewTheme } = useTheme();
  return (
    <div className="block-frame">
      <h2 className="block-title">themes — hover to preview, click to set</h2>
      <ul className="theme-list">
        {THEME_NAMES.map((n) => (
          <li key={n}>
            <button
              type="button"
              className="theme-row"
              onMouseEnter={() => previewTheme(n)}
              onMouseLeave={() => previewTheme(null)}
              onFocus={() => previewTheme(n)}
              onBlur={() => previewTheme(null)}
              onClick={() => runCommand(`theme ${n}`, "chip")}
            >
              <Swatches name={n} />
              <span className="accent-text theme-name">{n}</span>
              <span className="dim-text">{THEMES[n].tagline}</span>
              {theme === n && <span className="accent-text"> ● active</span>}
            </button>
          </li>
        ))}
      </ul>
      <ChipRow commands={["help", "whoami"]} />
    </div>
  );
}

export function ThemeSetBlock({ name }: { name: string }) {
  if (!isThemeName(name)) return null;
  return <p className="accent-text">{THEMES[name].confirmLine}</p>;
}
