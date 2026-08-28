# yavor.codes — Theme System Implementation Plan

Scope: complete multi-theme system for the terminal site — theme roster, tokens, CSS architecture, persistence, the `theme` command UX, CRT effects, and the shader color bridge. Terminal engine internals, block content, and deployment are out of scope.

---

## 1. Theme Roster

Five themes. Names are lowercase single words so they read well as command arguments (`theme set phosphor`). Every theme defines the **same token set** — no theme gets to skip a token, which is what makes them "complete."

All contrast ratios below are WCAG 2.x relative-luminance ratios against the theme `bg`, rounded. Targets: primary text ≥ 7:1 (AAA), dim/secondary text ≥ 4.5:1 (AA), accents used as text ≥ 4.5:1.

### 1.1 `void` — default. Modern dark violet, Vercel/Linear energy.

Personality: quiet, precise, expensive-looking. Glow is barely there. This is the theme that says "I ship."

| Token | Value | Contrast vs bg | Notes |
|---|---|---|---|
| `bg` | `#0b0b12` | — | near-black with a violet undertone |
| `surface` | `#12121c` | — | panels, terminal chrome |
| `surface-raised` | `#1a1a28` | — | hover states, chips |
| `border` | `#26263a` | — | 1px hairlines |
| `text` | `#e6e6f0` | 15.8:1 | primary terminal text |
| `text-dim` | `#8b8ba3` | 5.9:1 | timestamps, comments, hints |
| `accent` | `#a78bfa` | 7.2:1 | violet — prompt symbol, links, cursor |
| `accent-2` | `#22d3ee` | 10.8:1 | cyan — secondary highlights, chips |
| `success` | `#34d399` | ~11:1 | |
| `error` | `#f87171` | 7.1:1 | |
| `warning` | `#fbbf24` | ~10:1 | |
| `glow` | `rgba(167,139,250,0.25)` | — | used only on cursor + prompt |
| `selection-bg` | `rgba(167,139,250,0.30)` | — | `::selection` |
| `cursor` | `#a78bfa` | — | |

Effects: scanlines **off**, glow **0.25** (subtle), flicker off, vignette 0.15.
Backdrop palette: `["#2e1065", "#4c1d95", "#0e7490"]`, intensity 0.6, style `nebula`.
Font: base stack (Geist Mono or JetBrains Mono).
`color-scheme: dark`.

### 1.2 `phosphor` — green P1 phosphor CRT.

Personality: 1978 VT100 in a dark lab. Maximal CRT: scanlines, glow, faint flicker. Near-monochrome — accents are brightness steps of green, not new hues; only `error` breaks the monochrome (legibility wins).

| Token | Value | Contrast vs bg | Notes |
|---|---|---|---|
| `bg` | `#050a05` | — | |
| `surface` | `#0a140b` | — | |
| `surface-raised` | `#102010` | — | |
| `border` | `#1c3a22` | — | |
| `text` | `#33ff66` | ~15:1 | classic phosphor green |
| `text-dim` | `#1e9e50` | ~5.9:1 | "aged phosphor" |
| `accent` | `#aaffcc` | ~18:1 | bright-green — links, prompt |
| `accent-2` | `#e8ffe8` | ~19:1 | near-white green — emphasis |
| `success` | `#33ff66` | — | same as text; success is the default state of a CRT |
| `error` | `#ff6b5e` | 7.2:1 | deliberate hue break |
| `warning` | `#d9ff5e` | ~17:1 | |
| `glow` | `rgba(51,255,102,0.55)` | — | applied to whole terminal text layer |
| `selection-bg` | `rgba(51,255,102,0.90)` | — | inverse-video feel; `::selection` color flips to `#050a05` |
| `cursor` | `#33ff66` | — | block cursor, blinks |

Effects: scanlines **on** (opacity 0.14), glow **1.0**, flicker **on** (subtle), vignette 0.45.
Backdrop palette: `["#02160a", "#0a3d1f", "#33ff66"]`, intensity 0.35, style `grain` (backdrop stays quiet so the text glow owns the scene).
Font: base mono. (Optional per-theme `fontVariant: 'crt'` → VT323 — see Open Questions; default is no font swap for readability.)
`color-scheme: dark`.

### 1.3 `amber` — amber P3 phosphor CRT.

Personality: `phosphor`'s warmer sibling; late-night air-traffic-control. Same effect stack, warmer vignette.

| Token | Value | Contrast vs bg | Notes |
|---|---|---|---|
| `bg` | `#100a00` | — | warm black |
| `surface` | `#1a1204` | — | |
| `surface-raised` | `#241a08` | — | |
| `border` | `#3f2d0a` | — | |
| `text` | `#ffb000` | 10.4:1 | the canonical amber |
| `text-dim` | `#b37700` | 5.0:1 | |
| `accent` | `#ffd23f` | ~14:1 | |
| `accent-2` | `#ffe9b8` | ~17:1 | near-white amber |
| `success` | `#ffd23f` | — | monochrome discipline |
| `error` | `#ff5533` | ~6.5:1 | hue break |
| `warning` | `#ffb000` | — | warning *is* amber |
| `glow` | `rgba(255,176,0,0.50)` | — | |
| `selection-bg` | `rgba(255,176,0,0.90)` | — | inverse video; selection text `#100a00` |
| `cursor` | `#ffb000` | — | |

Effects: scanlines **on** (0.12), glow **0.9**, flicker on (subtle), vignette 0.45.
Backdrop palette: `["#1c1000", "#5c3a00", "#ffb000"]`, intensity 0.35, style `grain`.
`color-scheme: dark`.

### 1.4 `paper` — light, warm, solarized-adjacent.

Personality: printed man-page. For daylight, projectors, and people who read docs outside. Zero glow, zero scanlines, backdrop nearly off.

| Token | Value | Contrast vs bg | Notes |
|---|---|---|---|
| `bg` | `#f4eee1` | — | warm paper, not solarized's yellow-heavy base3 |
| `surface` | `#ece4d2` | — | |
| `surface-raised` | `#e3d9c3` | — | |
| `border` | `#d4c8ac` | — | |
| `text` | `#2c2a26` | 12.0:1 | warm ink, not pure black |
| `text-dim` | `#6b6353` | 5.1:1 | |
| `accent` | `#a63c0c` | 5.5:1 | burnt sienna — links, prompt |
| `accent-2` | `#0c6478` | ~5.3:1 | deep teal |
| `success` | `#166534` | ~5.9:1 | |
| `error` | `#b91c1c` | 5.6:1 | |
| `warning` | `#92610a` | ~4.8:1 | |
| `glow` | `rgba(166,60,12,0)` | — | token exists, alpha 0 — no branching in components |
| `selection-bg` | `rgba(166,60,12,0.22)` | — | |
| `cursor` | `#a63c0c` | — | |

Effects: scanlines **off**, glow **0**, flicker off, vignette 0.
Backdrop palette: `["#f4eee1", "#e0d5ba", "#c9b98f"]`, intensity 0.15, style `grain` (or fully `off` — R3F can pause its frame loop; see §6).
`color-scheme: light` (fixes native form controls/scrollbar defaults).

### 1.5 `outrun` — synthwave wildcard.

Personality: sunset grid, hot pink and cyan, Kavinsky on loop. Glow medium-high, thin scanlines for VHS texture.

| Token | Value | Contrast vs bg | Notes |
|---|---|---|---|
| `bg` | `#150826` | — | deep violet-black |
| `surface` | `#1e0f33` | — | |
| `surface-raised` | `#2a1745` | — | |
| `border` | `#3d2264` | — | |
| `text` | `#f5ecff` | ~15:1 | |
| `text-dim` | `#9d86c2` | 6.2:1 | |
| `accent` | `#ff4fd8` | 6.9:1 | hot pink — prompt, links |
| `accent-2` | `#00e5ff` | 12.7:1 | cyan — the counter-color |
| `success` | `#2de6a8` | ~12:1 | |
| `error` | `#ff5c7a` | ~7:1 | |
| `warning` | `#ffc94d` | ~12:1 | |
| `glow` | `rgba(255,79,216,0.40)` | — | |
| `selection-bg` | `rgba(0,229,255,0.30)` | — | cyan selection against pink accents |
| `cursor` | `#ff4fd8` | — | |

Effects: scanlines **on** (0.06, thin), glow **0.6**, flicker off, vignette 0.30.
Backdrop palette: `["#2b0a4e", "#ff4fd8", "#00e5ff"]`, intensity 0.85, style `grid` (this is the theme where the backdrop shows off).
`color-scheme: dark`.

---

## 2. Architecture Decisions

### 2.1 Source of truth: TypeScript registry, CSS generated from it

**Decision:** `lib/themes.ts` is the single source of truth. A `themeToCss()` helper serializes each theme into a `[data-theme="name"] { --t-bg: ...; }` block; the root layout (a Server Component) injects the concatenated result into a `<style>` tag at build/render time. CSS custom properties remain the **runtime** source of truth that Tailwind, components, and effects consume.

**Tradeoffs considered:**

| Option | Pros | Cons |
|---|---|---|
| Hand-written CSS blocks in `globals.css`, TS holds only metadata | Zero codegen, CSS-native | Two files to keep in sync per theme; shader palette and swatches drift from actual tokens |
| **TS registry → generated `<style>` in layout (chosen)** | One definition per theme; swatches, shader, and CSS provably identical; type-checked completeness (a new theme *must* fill every token) | `<style>` blob in HTML (~2KB total for 5 themes — trivial); tokens not visible in `globals.css` |
| Runtime injection via `style.setProperty` in ThemeProvider | Max flexibility | FOUC risk, hydration complexity, breaks no-JS rendering |

### 2.2 Theme selection: `data-theme` attribute on `<html>`

`document.documentElement.dataset.theme = name`. Attribute (not class) so it can't collide with utility classes and is trivially matched by `[data-theme="x"]` selectors. `:root` carries the `void` token values as fallback so the site renders correctly even if the attribute is somehow absent. `<html suppressHydrationWarning>` because the inline script mutates the attribute before React hydrates.

### 2.3 Tailwind v4 consumes the variables via `@theme inline`

```css
@theme inline {
  --color-bg: var(--t-bg);
  --color-surface: var(--t-surface);
  --color-raised: var(--t-surface-raised);
  --color-border: var(--t-border);
  --color-text: var(--t-text);
  --color-dim: var(--t-text-dim);
  --color-accent: var(--t-accent);
  --color-accent-2: var(--t-accent-2);
  --color-success: var(--t-success);
  --color-error: var(--t-error);
  --color-warning: var(--t-warning);
}
```

The `inline` keyword is load-bearing in Tailwind v4: it makes utilities emit `var(--t-bg)` references instead of resolving values at build, so `bg-bg text-accent border-border` all re-resolve live when `data-theme` flips. Components **never** hardcode a color — a rich block written once is automatically complete in all five themes.

### 2.4 Rich blocks and the R3F shader: CSS vars → JS bridge

- **Rich React blocks** need no bridge — they use Tailwind semantic utilities (`text-accent`, `bg-surface`) or `var(--t-*)` in inline styles. Framer Motion can animate to `"var(--t-accent)"` directly for color targets.
- **The R3F shader** cannot use CSS vars in uniforms. Two options: `getComputedStyle(document.documentElement).getPropertyValue('--t-accent')` on theme change (works but string-parsing and layout-read), or read the palette **from the TS registry** via ThemeProvider context (chosen — since TS is the source of truth, the shader gets typed hex values with zero DOM reads). The backdrop converts `theme.backdrop.palette` to `THREE.Color` instances and **lerps uniforms in `useFrame`** (damped, ~600ms) so a theme switch morphs the backdrop instead of snapping it. `backdrop.intensity === 0` (or `style: 'off'`) pauses the frame loop (`frameloop="demand"` / conditional invalidate) to save battery on `paper`.

### 2.5 Persistence and initial default

- localStorage key: `"yavor.theme"`, written inside `try/catch` (Safari private mode, storage-disabled contexts). Read also guarded and **validated against the known-names list** — garbage in storage falls through to default.
- **`prefers-color-scheme` recommendation: honor it on first visit only.** First visit + `(prefers-color-scheme: light)` → `paper`; otherwise → `void`. Once the visitor sets any theme explicitly, the stored value wins forever. Rationale: light-preference is often an accessibility/comfort signal (astigmatism, sunlight); overriding it to show off a dark theme is hostile. The brand-first counter-argument (the terminal *is* dark) is real, but it's a one-line change in the inline script, and `paper` is a complete theme, not a downgrade. No `matchMedia` change listener after first visit — an explicit choice on a terminal site shouldn't be overridden by the OS flipping at sunset.
- Cross-tab sync: ThemeProvider listens for the `storage` event and applies changes from other tabs.
- `<meta name="theme-color">` updated on switch (mobile browser chrome matches `bg`).

### 2.6 Theme-switch transition

Layered approach:

1. **View Transitions API where available:** `document.startViewTransition(() => applyTheme(name))` gives a free ~250ms crossfade of the entire page, including scanline overlays appearing/disappearing. Feature-detect; it's progressive enhancement.
2. **Fallback:** add `html.theme-switching` for 350ms; a scoped rule `html.theme-switching :is(body, .term, .block, .chip) { transition: background-color .3s, color .3s, border-color .3s, box-shadow .3s; }` — scoped to known containers, **not** `*`, to avoid a layout-tree-wide style recalc storm. Class removed via `setTimeout`.
3. **Backdrop** lerps independently in the shader (§2.4) — always smooth regardless of API support.
4. `prefers-reduced-motion: reduce` → skip both, snap instantly.

Flavor detail (cheap, high charm): the terminal prints the theme's `confirmLine` as output, and the cursor blinks once in the new accent color.

---

## 3. TypeScript Shape

```ts
// lib/themes.ts

export const THEME_NAMES = ['void', 'phosphor', 'amber', 'paper', 'outrun'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textDim: string;
  accent: string;
  accent2: string;
  success: string;
  error: string;
  warning: string;
  glow: string;          // rgba() — alpha 0 in themes without glow
  selectionBg: string;   // rgba()
  selectionText?: string; // only CRT themes override (inverse video)
  cursor: string;
}

export interface ThemeEffects {
  scanlines: boolean;
  scanlineOpacity: number;  // 0–1, only read when scanlines=true
  glowStrength: number;     // 0–1, scales the text-shadow stack
  flicker: boolean;
  vignette: number;         // 0–1, radial-gradient overlay opacity
}

export interface ThemeBackdrop {
  palette: [string, string, string]; // hex triplet fed to shader uniforms
  intensity: number;                 // 0–1; 0 pauses the frame loop
  style: 'nebula' | 'grain' | 'grid' | 'off';
}

export interface Theme {
  name: ThemeName;
  label: string;          // "Void"
  tagline: string;        // shown in `theme list`
  confirmLine: string;    // printed on `theme set` — e.g. "phosphor: it's 1978 somewhere."
  colorScheme: 'dark' | 'light';  // → CSS color-scheme property
  tokens: ThemeTokens;
  effects: ThemeEffects;
  backdrop: ThemeBackdrop;
}

export const THEMES: Record<ThemeName, Theme> = { /* §1 data */ };
export const DEFAULT_THEME: ThemeName = 'void';
export const STORAGE_KEY = 'yavor.theme';

export function isThemeName(v: unknown): v is ThemeName {
  return typeof v === 'string' && (THEME_NAMES as readonly string[]).includes(v);
}

/** Serializes one theme to a CSS block: [data-theme="void"]{--t-bg:#0b0b12;...}
 *  Also emits effect knobs as vars: --fx-scanline-opacity, --fx-glow, --fx-vignette. */
export function themeToCss(theme: Theme): string { /* ... */ }
```

`Record<ThemeName, Theme>` + required token fields means adding a sixth theme is compiler-enforced completeness. Effect flags are serialized into CSS vars too (`--fx-glow: 0.55`), so the CRT overlay component is pure CSS with zero per-theme JS branching.

---

## 4. No-Flash Inline Script

The classic dark-mode-flash problem, solved the classic way: a tiny **blocking** inline script in `<head>`, before any paint, before hydration. Kept in TS as an exported string constant (`lib/theme-script.ts`) so the theme-name list is stamped in from `THEME_NAMES` at build time — one source of truth, no drift.

```html
<script>
(function () {
  var d = document.documentElement, t = null;
  try { t = localStorage.getItem('yavor.theme'); } catch (e) {}
  var valid = ['void','phosphor','amber','paper','outrun']; // stamped from THEME_NAMES
  if (valid.indexOf(t) === -1) {
    t = null;
    try {
      if (matchMedia('(prefers-color-scheme: light)').matches) t = 'paper';
    } catch (e) {}
  }
  d.dataset.theme = t || 'void';
  d.style.colorScheme = (t === 'paper') ? 'light' : 'dark';
})();
</script>
```

Injection in `app/layout.tsx`:

```tsx
<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
    <style dangerouslySetInnerHTML={{ __html: ALL_THEMES_CSS }} />
  </head>
  ...
```

Key points: script runs synchronously before first paint (that's the point — it's ~200 bytes, the render-blocking cost is negligible); every storage/matchMedia touch is try/catch'd; unknown stored values fall back cleanly; ThemeProvider later reads `document.documentElement.dataset.theme` as its initial state instead of re-deriving, so React state and DOM can never disagree. SSR renders no `data-theme` (server can't know it) — `:root` fallback vars keep even the pre-script millisecond correct for the default, and `suppressHydrationWarning` absorbs the attribute mismatch.

---

## 5. The `theme` Command UX

Registered with the terminal engine as one command with subcommands (engine internals out of scope; this defines the contract).

- **`theme` / `theme list`** → renders `<ThemeBlock mode="list">`: one row per theme — five swatch dots (bg, text, accent, accent-2, error) rendered from `THEMES[name].tokens` (actual values, not the live CSS vars — so `void`'s swatches look right even while `amber` is active), label, tagline, and an `● active` marker in the current accent. Rows stagger in with Framer Motion (~40ms).
  - **Live preview on hover/focus:** pointer enter (120ms debounce) calls `previewTheme(name)` — sets `data-theme` **without** touching localStorage or React state; pointer leave restores the committed theme. Whole-site preview for free, since everything hangs off the attribute. Keyboard: arrow keys move a focus ring and preview; Enter commits. Touch devices skip preview (tap = commit).
- **`theme set <name>`** → validates via `isThemeName`; on success runs the transition (§2.6), persists, and prints the theme's `confirmLine`:
  - `void` — "void: back to black."
  - `phosphor` — "phosphor: it's 1978 somewhere."
  - `amber` — "amber: cleared for approach."
  - `paper` — "paper: sunlight-readable. touch grass responsibly."
  - `outrun` — "outrun: night drive engaged."
  - Unknown name → error line in `--t-error` + suggestion via nearest-match: `theme: no theme 'ambr'. did you mean 'amber'? try 'theme list'.`
- **`theme <name>`** shorthand aliases to `theme set <name>`.
- Command metadata exports `THEME_NAMES` for the engine's tab-completion.

---

## 6. CRT Effects Without Killing Performance

All effects are **static CSS driven by per-theme vars** — no JS per frame, no canvas, no `backdrop-filter`.

**Structure** (`<CrtOverlay />`, mounted once in layout, `pointer-events: none`):

```
<div class="crt" aria-hidden="true">   <!-- fixed, inset-0, z-index above content -->
  <div class="crt-scanlines" />
  <div class="crt-vignette" />
</div>
```

- **Scanlines:** `background: repeating-linear-gradient(to bottom, rgba(0,0,0,var(--fx-scanline-opacity)) 0 1px, transparent 1px 3px);` with `opacity` gated by the theme var (0 ⇒ effectively absent). One fixed element = one composited layer; the gradient rasterizes once. **Do not animate scanline position** — a scrolling scanline animation forces continuous repaint of a viewport-sized layer.
- **Glow:** applied to the terminal **container**, not per character: `.term-output { text-shadow: 0 0 calc(6px * var(--fx-glow)) var(--t-glow), 0 0 calc(18px * var(--fx-glow)) var(--t-glow); }`. Two shadows max — CRT look plateaus after two, and text-shadow cost scales with shadow count × glyph count. `--fx-glow: 0` compiles to zero-blur shadows; if profiling shows cost even at 0, gate with `[data-theme="paper"] .term-output { text-shadow: none }`. **Never animate text-shadow**; the theme-switch transition covers colors only.
- **Flicker:** animate **overlay opacity only** (`opacity` = compositor-only): `@keyframes crt-flicker { 0%,100% {opacity:1} 97% {opacity:1} 98% {opacity:.92} }` over ~4s on `.crt`. Enabled by `--fx-flicker` gate. Suppressed entirely under `@media (prefers-reduced-motion: reduce)` — flicker is the single most migraine-triggering effect in the stack; keep amplitude ≤ 8%.
- **Vignette:** `background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%); opacity: var(--fx-vignette);` — doubles as the "curved glass" illusion.
- **Curvature: faked, not real.** True curvature (SVG `feDisplacementMap` or 3D transform on the content) blurs text, breaks selection hit-testing, and forces expensive re-rasterization on scroll. Verdict: **skip real curvature**; vignette + a slight `border-radius` on the terminal frame + scanlines reads as "CRT" to everyone who wasn't there in 1982.
- **Scrollbars & selection:** `::selection { background: var(--t-selection-bg); color: var(--t-selection-text, currentColor); }`; `scrollbar-color: var(--t-border) var(--t-bg)` plus WebKit pseudo-element styling; `color-scheme` per theme so native UI (autofill, scrollbar defaults) matches.

Budget: two fixed composited layers + one container text-shadow. Verify with DevTools paint flashing that scrolling the terminal doesn't repaint the overlays (it shouldn't — they're `position: fixed` with no dependence on scroll).

---

## 7. File List

| File | Responsibility |
|---|---|
| `lib/themes.ts` | `Theme` types, `THEMES` registry (all token data from §1), `THEME_NAMES`, `DEFAULT_THEME`, `STORAGE_KEY`, `isThemeName`, `themeToCss()` serializer. No React. Importable by server components, client components, and the R3F layer. |
| `lib/theme-script.ts` | Exports `THEME_INIT_SCRIPT` (the §4 inline script as a string, theme names interpolated from `THEME_NAMES`). |
| `components/providers/ThemeProvider.tsx` | Client context: `{ theme, themeName, setTheme, previewTheme, endPreview }`. `setTheme` = View-Transition/fallback animation + `data-theme` + localStorage write (guarded) + `meta[name=theme-color]` + `color-scheme`. Listens to `storage` for cross-tab sync. Initial state read from `document.documentElement.dataset.theme`. |
| `app/globals.css` | Tailwind import, `@theme inline` semantic color mapping (§2.3), `:root` fallback (= `void` tokens), `::selection`, scrollbar rules, `.crt-*` effect classes and keyframes, `.theme-switching` transition rules, `prefers-reduced-motion` guards. |
| `app/layout.tsx` | Injects `THEME_INIT_SCRIPT` and the `themeToCss`-generated `<style>` in `<head>`; `<html suppressHydrationWarning>`; mounts `ThemeProvider` and `CrtOverlay`. |
| `components/chrome/CrtOverlay.tsx` | Dumb fixed overlay markup from §6. Zero props, zero state — fully CSS-var-driven. |
| `components/blocks/ThemeBlock.tsx` | Rich block for `theme list` / set confirmation: swatch rows, hover/keyboard live preview (via provider's `previewTheme`), Framer Motion stagger, active marker. |
| `commands/theme.ts` | Command definition: arg parsing (`list` / `set <name>` / `<name>` shorthand), validation + nearest-match suggestion, returns `ThemeBlock` render descriptor, exports completions. |
| `components/backdrop/Backdrop.tsx` (theme-relevant part) | Reads `theme.backdrop` from context; converts palette hexes to `THREE.Color`; damped uniform lerp in `useFrame`; pauses frameloop when `intensity === 0` or `style === 'off'`. |

---

## 8. Open Questions

1. **Font swap for CRT themes?** VT323/Departure Mono would sell `phosphor`/`amber` hard, but hurts readability and adds ~2 font payloads. The `Theme` type reserves an optional `fontVariant`; recommend shipping without it and deciding after seeing glow + scanlines alone (they may be enough).
2. **`paper` backdrop: dim or off?** `intensity: 0.15` keeps visual continuity; fully off saves battery and suits the "print" metaphor. Needs a look at the actual shader before deciding.
3. **Hidden sixth theme as an easter egg?** (`theme set matrix` → undocumented, not in `theme list`.) Cheap with this architecture; purely a content decision.
4. **Should `theme list` hover-preview also lerp the backdrop,** or snap only the CSS while previewing (cheaper, less motion churn during rapid hovering)? Leaning: preview = CSS only, commit = full lerp.
5. **`selection-text` for CRT inverse-video** — confirm the readability of `#050a05`-on-green selection in real content blocks (code snippets with syntax highlighting may fight it).
6. **View Transitions + R3F canvas:** verify the snapshot crossfade doesn't visibly double-expose the animated canvas; if it does, exclude the canvas via `view-transition-name` with a static group, or fall back to the class-based transition site-wide.
