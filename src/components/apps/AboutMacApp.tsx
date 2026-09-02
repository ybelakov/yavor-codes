"use client";

import profile from "@/content/profile.json";
import { useDesktop } from "@/lib/desktop/store";

function uptimeYears(): number {
  const birth = new Date(`${profile.neofetch.birthYearMonth}-15T00:00:00`);
  return Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
}

/** Real About This Mac: laptop art, macOS name, then the spec table.
 *  The joke is that the specs are Yavor's. */
export function AboutMacApp() {
  const openApp = useDesktop((s) => s.openApp);

  return (
    <div className="about-mac">
      <svg viewBox="0 0 220 130" className="about-laptop" aria-hidden="true">
        <rect x="26" y="10" width="168" height="102" rx="8" fill="#b8bcc4" />
        <rect x="31" y="15" width="158" height="92" rx="5" fill="#0f1a2e" />
        <image href={profile.avatar} x="86" y="38" width="48" height="48" clipPath="circle(24px at 24px 24px)" />
        <rect x="6" y="112" width="208" height="8" rx="4" fill="#c8ccd4" />
        <rect x="92" y="112" width="36" height="4" rx="2" fill="#a6abb5" />
      </svg>

      <h2 className="about-os">macOS Sequoia</h2>
      <p className="about-version">Version 15.6</p>

      <dl className="about-specs">
        <div><dt>Owner</dt><dd>{profile.name}</dd></div>
        <div><dt>Role</dt><dd>{profile.headline}</dd></div>
        <div><dt>Chip</dt><dd>Apple M4 Max</dd></div>
        <div><dt>Memory</dt><dd>48 GB (mostly Chrome tabs)</dd></div>
        <div><dt>Startup disk</dt><dd>Macintosh HD</dd></div>
        <div><dt>Location</dt><dd>Sofia, BG ⇄ San Francisco</dd></div>
        <div><dt>Uptime</dt><dd>{uptimeYears()} years</dd></div>
      </dl>

      <div className="about-actions">
        <button type="button" className="about-btn" onClick={() => openApp("settings")}>
          More Info…
        </button>
        <a href="https://linkedin.com/in/yavor-belakov" target="_blank" rel="noopener noreferrer" className="about-btn about-btn-plain">
          LinkedIn
        </a>
      </div>
      <p className="about-legal">™ and © a portfolio. All rights reserved.</p>
    </div>
  );
}
