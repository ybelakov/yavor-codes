import type { AppId } from "@/lib/desktop/types";

const R = 22; // corner radius on the 96x96 squircle-ish grid

export function TerminalIcon() {
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <rect width="96" height="96" rx={R} fill="#1c1c1e" />
      <rect x="6" y="6" width="84" height="84" rx={R - 5} fill="#2b2b2e" />
      <rect x="6" y="6" width="84" height="18" rx={8} fill="#3a3a3d" />
      <text x="16" y="52" fill="#e8e8ea" fontFamily="ui-monospace, monospace" fontSize="26" fontWeight="700">
        &gt;_
      </text>
    </svg>
  );
}

export function ChromeIcon() {
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <circle cx="48" cy="48" r="46" fill="#fff" />
      <path d="M48 2a46 46 0 0 1 39.8 23H48a23 23 0 0 0-20.5 12.6L13.2 20.4A45.9 45.9 0 0 1 48 2z" fill="#ea4335" />
      <path d="M13.2 20.4 27.5 37.6A23 23 0 0 0 40 71.3L26.6 92A46 46 0 0 1 13.2 20.4z" fill="#34a853" />
      <path d="M87.8 25A46 46 0 0 1 26.6 92l14.2-24.6A23 23 0 0 0 68.6 37h19.2z" fill="#fbbc05" />
      <circle cx="48" cy="48" r="20" fill="#4285f4" />
      <circle cx="48" cy="48" r="14" fill="#fff" fillOpacity="0.15" />
    </svg>
  );
}

export function FinderIcon() {
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <defs>
        <linearGradient id="fnd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4fc3f7" />
          <stop offset="1" stopColor="#1e88e5" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx={R} fill="url(#fnd)" />
      <path d="M48 4v88" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M48 4H26A22 22 0 0 0 4 26v44a22 22 0 0 0 22 22h22z" fill="#e8f4fd" fillOpacity="0.92" />
      <path d="M22 36v10M36 36v10" stroke="#1c3f5f" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M60 36v10M74 36v10" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M24 64c8 7 16 7 24 7s16 0 24-7" stroke="#1c3f5f" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function NotesIcon() {
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <rect width="96" height="96" rx={R} fill="#fdf6d8" />
      <rect width="96" height="24" rx={R} fill="#fbc02d" />
      <rect y="16" width="96" height="10" fill="#fbc02d" />
      {[40, 52, 64, 76].map((y) => (
        <rect key={y} x="14" y={y} width={y === 76 ? 40 : 68} height="4" rx="2" fill="#d9c48a" />
      ))}
    </svg>
  );
}

export function PhotosIcon() {
  const petals = [
    ["#f44336", 0], ["#ff9800", 45], ["#ffeb3b", 90], ["#8bc34a", 135],
    ["#00bcd4", 180], ["#3f51b5", 225], ["#9c27b0", 270], ["#e91e63", 315],
  ] as const;
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <rect width="96" height="96" rx={R} fill="#fff" />
      <g style={{ mixBlendMode: "multiply" }}>
        {petals.map(([color, angle]) => (
          <ellipse
            key={angle}
            cx="48"
            cy="32"
            rx="11"
            ry="19"
            fill={color}
            fillOpacity="0.85"
            transform={`rotate(${angle} 48 48)`}
          />
        ))}
      </g>
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <defs>
        <linearGradient id="mail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#39b3fb" />
          <stop offset="1" stopColor="#127bf0" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx={R} fill="url(#mail)" />
      <rect x="16" y="28" width="64" height="42" rx="7" fill="#fff" />
      <path d="M18 33l27 21a5 5 0 0 0 6 0l27-21" stroke="#127bf0" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <rect width="96" height="96" rx={R} fill="#7b7f88" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="#e6e8ec" strokeWidth="7" />
      <circle cx="48" cy="48" r="9" fill="#e6e8ec" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="45"
          y="10"
          width="6"
          height="14"
          rx="3"
          fill="#e6e8ec"
          transform={`rotate(${i * 45} 48 48)`}
        />
      ))}
    </svg>
  );
}

export function FolderIcon() {
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <path d="M8 26a8 8 0 0 1 8-8h20l8 9h36a8 8 0 0 1 8 8v41a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8z" fill="#6ec6f5" />
      <path d="M8 34h80v42a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8z" fill="#8fd4f8" />
    </svg>
  );
}

export function FileIcon() {
  return (
    <svg viewBox="0 0 96 96" className="app-icon-svg">
      <path d="M22 8h36l18 18v62a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#fdfdfd" />
      <path d="M58 8l18 18H62a4 4 0 0 1-4-4z" fill="#d6dae0" />
      {[40, 50, 60, 70].map((y) => (
        <rect key={y} x="28" y={y} width={y === 70 ? 24 : 40} height="3.5" rx="1.75" fill="#c3c8d0" />
      ))}
    </svg>
  );
}

export function AppIcon({ appId }: { appId: AppId }) {
  switch (appId) {
    case "terminal": return <TerminalIcon />;
    case "chrome": return <ChromeIcon />;
    case "finder": return <FinderIcon />;
    case "notes": return <NotesIcon />;
    case "photos": return <PhotosIcon />;
    case "mail": return <MailIcon />;
    case "settings": return <SettingsIcon />;
    default: return <FinderIcon />;
  }
}
