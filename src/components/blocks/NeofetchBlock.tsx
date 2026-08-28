"use client";

import profile from "@/content/profile.json";
import { ASCII_PORTRAIT } from "@/content/ascii";
import { THEMES, THEME_NAMES } from "@/lib/themes";
import { ChipRow } from "./shared";

function uptime(): string {
  const birth = new Date(`${profile.neofetch.birthYearMonth}-15T00:00:00`);
  const ms = Date.now() - birth.getTime();
  const years = Math.floor(ms / (365.25 * 24 * 3600 * 1000));
  const days = Math.floor((ms % (365.25 * 24 * 3600 * 1000)) / (24 * 3600 * 1000));
  return `${years} yrs, ${days} days`;
}

export function NeofetchBlock() {
  return (
    <div className="block-frame">
      <h2 className="sr-only">System specs</h2>
      <div className="neofetch">
        <pre className="ascii-portrait" aria-hidden="true">
          {ASCII_PORTRAIT.join("\n")}
        </pre>
        <div className="neofetch-specs">
          <p className="accent-text">{profile.neofetch.host}</p>
          <p className="dim-text">─────────────────</p>
          {profile.neofetch.specs.map((s) => (
            <p key={s.key}>
              <span className="accent-text">{s.key}</span>
              <span className="dim-text">: </span>
              {s.value}
            </p>
          ))}
          <p>
            <span className="accent-text">uptime</span>
            <span className="dim-text">: </span>
            {uptime()}
          </p>
          <div className="swatch-row" aria-hidden="true">
            {THEME_NAMES.map((n) => (
              <span key={n} className="swatch" style={{ background: THEMES[n].tokens.accent }} />
            ))}
          </div>
        </div>
      </div>
      <ChipRow commands={["whoami", "history", "contact"]} />
    </div>
  );
}
