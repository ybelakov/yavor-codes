/** macOS Sequoia-ish flowing wave. Rendered as the bottom layer; gradient
 *  wallpapers simply paint over it (their css is opaque). */
export function WallpaperArt() {
  return (
    <svg
      className="wallpaper-art"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#cfe9f7" />
          <stop offset="0.35" stopColor="#eaf4fb" />
          <stop offset="0.62" stopColor="#f6e9d8" />
          <stop offset="1" stopColor="#f3d9bd" />
        </linearGradient>
        <linearGradient id="wp-deep" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#0b4f9e" />
          <stop offset="0.5" stopColor="#1668c7" />
          <stop offset="1" stopColor="#0a3f83" />
        </linearGradient>
        <linearGradient id="wp-mid" x1="0" y1="0.2" x2="1" y2="1">
          <stop offset="0" stopColor="#38c8e8" />
          <stop offset="0.45" stopColor="#2b9fdd" />
          <stop offset="1" stopColor="#1d6fc4" />
        </linearGradient>
        <linearGradient id="wp-teal" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#8fe6e0" />
          <stop offset="0.55" stopColor="#46c9e6" />
          <stop offset="1" stopColor="#2ea8dd" />
        </linearGradient>
        <linearGradient id="wp-crest" x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#eaf8ff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
        <filter id="wp-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id="wp-softer" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="34" />
        </filter>
      </defs>

      <rect width="1600" height="1000" fill="url(#wp-sky)" />

      {/* deep water mass sweeping in from the bottom-left */}
      <path
        d="M0 470 C 320 400, 520 700, 900 700 C 1240 700, 1420 470, 1600 380 L1600 1000 L0 1000 Z"
        fill="url(#wp-deep)"
      />
      {/* mid band */}
      <path
        d="M0 430 C 300 350, 540 640, 920 640 C 1260 640, 1430 420, 1600 330 L1600 470 C 1400 560, 1230 760, 900 760 C 520 760, 300 470, 0 545 Z"
        fill="url(#wp-mid)"
        opacity="0.95"
      />
      {/* teal crest */}
      <path
        d="M0 392 C 300 312, 560 596, 940 592 C 1270 588, 1440 372, 1600 288 L1600 352 C 1430 440, 1270 650, 930 654 C 550 658, 300 372, 0 452 Z"
        fill="url(#wp-teal)"
        filter="url(#wp-soft)"
      />
      {/* bright specular line along the wave */}
      <path
        d="M0 372 C 300 292, 570 576, 950 572 C 1280 568, 1450 352, 1600 268 L1600 300 C 1440 384, 1285 604, 950 608 C 565 612, 300 330, 0 410 Z"
        fill="url(#wp-crest)"
      />
      {/* soft glow above the crest */}
      <path
        d="M0 330 C 320 250, 590 540, 960 536 C 1290 532, 1470 316, 1600 236 L1600 176 C 1450 262, 1280 470, 960 474 C 600 478, 330 200, 0 268 Z"
        fill="#ffffff"
        opacity="0.35"
        filter="url(#wp-softer)"
      />
      {/* far-left cool haze */}
      <ellipse cx="120" cy="700" rx="420" ry="260" fill="#7fe3e0" opacity="0.28" filter="url(#wp-softer)" />
      {/* warm top-right light */}
      <ellipse cx="1420" cy="120" rx="520" ry="300" fill="#ffe9c9" opacity="0.5" filter="url(#wp-softer)" />
    </svg>
  );
}
