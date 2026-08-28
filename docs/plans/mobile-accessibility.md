# yavor.codes — Mobile UX + Accessibility Plan

**Scope:** chips-first mobile experience, viewport/keyboard handling, touch ergonomics, and the full accessibility layer (semantics, focus, live regions, reduced motion, contrast requirements fed back to themes).
**Out of scope:** terminal engine internals, theme palettes, block content, deployment.

**Guiding principle:** on mobile, the site is a *tappable* terminal. The text input exists and works, but the virtual keyboard never opens unless the user explicitly asks for it. Every journey must be completable with chips alone (zero typing) and, separately, with keyboard alone (zero pointer).

---

## 1. Mobile layout (annotated)

### 1.1 Portrait, keyboard closed (default state — what LinkedIn traffic sees)

```
┌─────────────────────────────────┐  ← 100dvh container (not 100vh)
│ ▒ R3F backdrop (fixed, aria-hidden, behind everything) ▒
│ ┌─────────────────────────────┐ │
│ │ status bar (host, theme dot)│ │  ← optional, 32px, part of scroll or sticky top
│ ├─────────────────────────────┤ │
│ │                             │ │
│ │  OUTPUT SCROLL REGION       │ │  ← the only scrollable element
│ │  role="log", flex-1,        │ │     (html/body overflow hidden →
│ │  overflow-y: auto,          │ │      no rubber-band double scroll)
│ │  overscroll-behavior:       │ │
│ │  contain                    │ │
│ │  ┌───────────────────────┐  │ │
│ │  │ > whoami              │  │ │  ← echoed command line
│ │  │ ┌───────────────────┐ │  │ │
│ │  │ │  RICH BLOCK       │ │  │ │  ← <article>, h2 inside
│ │  │ │  (card/3D/media)  │ │  │ │
│ │  │ └───────────────────┘ │  │ │
│ │  │ [juma] [posts] [sf]   │  │ │  ← in-block next-command chips
│ │  └───────────────────────┘  │ │     (part of the block, scroll away)
│ │                             │ │
│ ├─────────────────────────────┤ │
│ │ CHIP TRAY  ◄ h-scroll ►  ⌨ │ │  ← persistent, sticky bottom,
│ │ [help][whoami][juma][post…] │ │     min 56px tall, thumb zone
│ ├─────────────────────────────┤ │
│ │ > _        (input row)      │ │  ← real <input>, visible, NOT
│ │                             │ │     autofocused; 16px font
│ │ ~ safe-area-inset-bottom ~  │ │  ← env() padding (home indicator)
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

Annotations:

- **Root container** is `height: 100dvh` (fallback `100vh` first for old browsers, then `100dvh` override). `html, body { overflow: hidden }`; the output region is the sole scroller. This kills iOS Safari's URL-bar resize jump and double-scroll jank.
- **Bottom cluster** (chip tray + input row) is a single sticky footer inside the flex column: `flex flex-col` root → output `flex-1 min-h-0 overflow-y-auto`, footer `shrink-0`. Footer gets `padding-bottom: env(safe-area-inset-bottom, 0px)` and the page sets `viewport-fit=cover`.
- **Input row on mobile is visible but demoted.** It renders the prompt and current text (so chip taps can visually "type" into it — nice theatrical touch), but it is not focused on load. A **keyboard button (⌨, 44×44px, `aria-label="Open keyboard to type a command"`)** at the right end of the chip tray focuses the input. Never call `.focus()` on load, after boot, or after a chip tap on mobile (see §1.4 for the mobile/desktop split).
- **Zoom-on-focus prevention:** the input's computed `font-size` must be ≥16px at all times (Tailwind `text-base` minimum; enforce with a lint/test, not `maximum-scale=1` — that harms low-vision users and fails a11y review).
- **Touch behavior:** `touch-action: manipulation` on chips, buttons, and the input (kills 300ms delay/double-tap zoom on the controls only, not page-level).

### 1.2 Portrait, keyboard open

```
┌─────────────────────────────────┐
│ OUTPUT (shrunk to remaining     │  ← container height =
│ visualViewport.height)          │     visualViewport height, so the
│  … last output stays visible …  │     footer sits above the keyboard
├─────────────────────────────────┤
│ CHIP TRAY (still visible ─ one  │  ← chips remain usable while
│ row, may hide the ⌨ button,    │     keyboard is open; ⌨ becomes ✕
│ shows ✕ "hide keyboard")        │     ("dismiss keyboard")
├─────────────────────────────────┤
│ > whoa_          [↑][↓][tab] ?  │  ← input row; optional mini
├─────────────────────────────────┤     accessory row (history/complete)
│ ▓▓▓▓▓ VIRTUAL KEYBOARD ▓▓▓▓▓▓▓ │     — see open question Q3
└─────────────────────────────────┘
```

Annotations:

- **Keyboard-open resize strategy:** don't trust `dvh` here (iOS keyboard does not change `dvh`). A `useViewportKeyboard` hook listens to `window.visualViewport` `resize`/`scroll` and sets the root height to `visualViewport.height` (as a CSS var `--app-height`) while the keyboard is open. On Android, additionally set `<meta name="viewport" content="... interactive-widget=resizes-content">` so Chrome resizes the layout viewport too.
- After the keyboard opens, scroll the output region to keep the last output line visible (`scrollTop = scrollHeight` guarded — see §3 scroll rules).
- On input **blur** or `Enter`-submit, keyboard closes; root height returns to `100dvh`. Submitting via Enter should *keep* the keyboard open only if the user was typing (they likely want to type again) — decided: **keep it open after Enter, close on ✕ or on tapping a chip.**
- **Chip tap while keyboard is open** must not steal focus from the input in a way that flashes the keyboard closed/open; chips use `onPointerDown` + `preventDefault()` to run the command without focusing the button, and then we explicitly blur the input to close the keyboard (a command was chosen; typing session is over).

### 1.3 Landscape phone (≤ ~500px height)

- Same DOM, tighter chrome: status bar hidden, chip tray and input row merge into **one row** (chips scroll horizontally, input collapses to the ⌨ button until opened).
- Rich blocks cap media height (`max-h-[45svh]`) so at least one full chip row + some output is always visible.
- With keyboard open in landscape there is almost no content area; this is acceptable — the input row + one line of output must remain visible (test explicitly, iPhone SE landscape is the worst case).
- R3F backdrop: no layout change needed (it's fixed and decorative) — but visual-layer plan should pause it when `visualViewport.height < 400` to save battery during typing.

### 1.4 Mobile vs desktop detection

- Do **not** UA-sniff. Gate behavior on capabilities:
  - `(pointer: coarse)` → chip tray persistent, input not autofocused, ⌨ affordance shown.
  - `(pointer: fine)` → desktop mode: input autofocused after boot, chip tray row hidden (chips still appear inside blocks), global "click anywhere focuses input" behavior enabled (desktop only — on mobile that behavior is banned because it would summon the keyboard).
- Hybrid devices (iPad + trackpad, Surface): `(pointer: fine)` may match; also check `(hover: hover)`. Rule: autofocus only when `hover: hover AND pointer: fine`. Everything else gets the safe mobile behavior.

---

## 2. Chip tray spec (`ChipTray`)

Two distinct chip surfaces share one component but have different lifetimes:

| Surface | Location | Lifetime | Purpose |
|---|---|---|---|
| **Tray chips** | persistent bottom tray | always on screen (coarse-pointer only) | global navigation, contextual next steps |
| **Block chips** | end of each rendered block | scroll with the block | curated "where next" per content block (all viewports) |

### 2.1 Contents & ordering (tray)

The tray shows **5–7 chips**, composed each time a command completes:

1. **Contextual suggestions (up to 3, first):** provided by the just-run command's registry entry (`suggestedNext: string[]` — same data that powers block chips; terminal-engine plan owns the field, this plan consumes it). Example: after `juma` → `[posts] [contact] [aief]`.
2. **Anchor chips (always present, stable order):** `help`, `whoami`, `theme`, `clear`. Stability matters — muscle memory beats novelty; anchors always occupy the tail so the tray never feels like it "reshuffles under your thumb."
3. **Dedupe rule:** a contextual chip that duplicates an anchor promotes the anchor instead (no duplicates).
4. **Initial state (post-boot, no command yet):** `[help] [whoami] [juma] [posts] [contact] [theme]` — the site's elevator pitch as buttons.
5. **Easter-egg surfacing:** never in the tray (they're discoveries); allowed as block chips where content warrants (e.g. `neofetch` may suggest `sudo make me a sandwich`).

### 2.2 Behavior

- **Contextual update timing:** tray re-composes only after the new block has rendered (not at submit time), with a subtle re-order animation (Framer Motion `layout` on chips; disabled under reduced motion — instant swap).
- **Overflow: horizontal scroll**, one row, `overflow-x: auto`, `scroll-snap-type: x proximity`, edge fade masks to signal scrollability, scrollbar hidden but region keyboard-scrollable. No wrapping to two rows (protects output real estate), no "more…" popover in v1 (adds a focus-trap surface we don't need).
- After re-compose, tray scroll position **resets to start** so contextual chips are visible.
- **Tap feedback:** chip press echoes the command into the input line ("ghost typing" ~120ms, skipped under reduced motion), then submits. Feels like the terminal is being operated, not like buttons replacing it.
- **Rate-limit:** tray ignores taps while a command is mid-render (block animating in) to prevent double-fire; chips get `aria-disabled="true"` + visual dim during that window (~300ms max — never a real lockout).
- `clear` chip behavior: after clear, tray resets to initial state.

### 2.3 Sizing & ergonomics

- Chip: `min-height: 44px`, `min-width: 44px`, `padding: 10px 16px`, gap ≥ 8px (prevents adjacent-target mis-taps; WCAG 2.5.8 target spacing).
- Tray total height ≈ 56–60px + safe-area padding. Bottom cluster (tray + input row) ≤ ~118px so ≥60% of a 390×844 screen stays content.
- Chips are real `<button type="button">` (see §4), styled per theme; label is the literal command text in the terminal font — the chip *is* documentation of the command vocabulary.

---

## 3. Scroll behavior (small screens, but rules apply everywhere)

1. **New output scrolls to its top, not its bottom.** Real terminals pin to bottom; rich multi-screen blocks read top-down. On command submit: append block → `blockRef.scrollIntoView({ block: 'start', behavior })` where `behavior` is `'smooth'` normally, `'auto'` under reduced motion. Offset by sticky header height if present (`scroll-margin-top` on blocks).
2. **No janky mid-animation scrolling.** Blocks animate in with a fixed reserved height where possible (Framer Motion animates `opacity/transform`, not `height`) so `scrollIntoView` targets a stable position. If a block must expand (async media), use `overflow-anchor: auto` on the log and `overflow-anchor: none` on the animating block until settled, then re-anchor.
3. **User scroll wins.** If the user has scrolled up (reading) and something async lands (e.g., typewriter completing), do not auto-scroll. Track "user is at bottom ±80px" boolean; auto-scroll only when true or when the scroll was triggered by that user's own command.
4. `overscroll-behavior-y: contain` on the log (no pull-to-refresh hijack mid-scroll, no scroll chaining to body).
5. Keyboard-open: after resize, restore the last visible line (`useViewportKeyboard` re-runs the "at bottom" scroll if the user was at bottom).
6. Momentum/perf: log is a plain scroller (no virtualization in v1 — session history is short); revisit only if `history` replay grows unbounded (open question Q2).

---

## 4. Accessibility spec

### 4.1 Semantic structure & ARIA (per region)

```html
<body>
  <a class="sr-only focus:not-sr-only" href="#cmd-input">Skip to command input</a>
  <div aria-hidden="true"> <!-- R3F backdrop canvas --> </div>
  <main aria-label="Yavor Belakov interactive terminal">
    <h1 class="sr-only">Yavor Belakov — yavor.codes interactive terminal</h1>
    <div role="log" aria-label="Terminal output"> …blocks… </div>
    <nav aria-label="Suggested commands"> …tray chips… </nav>
    <form> <label class="sr-only" for="cmd-input">Command input…</label>
      <input id="cmd-input" …> </form>
  </main>
  <div aria-live="polite" class="sr-only"><!-- announcer --></div>
  <div aria-live="assertive" class="sr-only"><!-- rare: errors only --></div>
</body>
```

| Region | Element/Role | Key attributes | Notes |
|---|---|---|---|
| Skip link | `<a>` | first in DOM, visible on focus | jumps to input; essential because the log can be long |
| Backdrop | `<div aria-hidden="true">` wrapping `<canvas>` | `role` none; `tabindex` never | purely decorative; also `inert` so R3F internals can't catch focus |
| Page title | `<h1>` (sr-only) | — | page needs exactly one h1 for SEO/AT; visually the terminal is the "h1" |
| Output region | `role="log"` | `aria-label="Terminal output"`, **`aria-live` NOT set** (see 4.3), `tabindex="-1"` for programmatic focus | `role="log"` gives AT users the right mental model; we deliberately suppress its implicit live behavior by announcing via a separate channel |
| Echoed command line | `<p>` inside block | — | plain text: `> whoami` |
| Rich block | `<article aria-labelledby="{id}-h">` | container `tabindex="-1"` (focus target) | one per command output |
| Block heading | `<h2 id="{id}-h">` | visually styled or sr-only | e.g. "About Yavor". Sub-sections use `h3`. **Never skip levels.** SEO: crawlers see h1 → h2s = command outputs → h3s |
| Block chips group | `<nav aria-label="Related commands">` | — | inside the article, after content |
| Chip (both surfaces) | `<button type="button">` | visible text = command; add `aria-label` only if visible label is cryptic (avoid) | never `<a>`/`<div>`; buttons get Enter+Space for free |
| Chip tray | `<nav aria-label="Suggested commands">` | container `role` stays landmark nav; horizontal scroller keyboard-reachable | one tab stop pattern: **roving tabindex** inside tray (←/→ moves, single Tab stop) so keyboard users aren't forced through 7 chips every pass. Block chips: normal tab order (they're content-local) |
| Keyboard toggle | `<button>` | `aria-label="Open keyboard to type a command"` / state-swapped label when open | `aria-expanded` not appropriate (nothing expands in DOM); swap label instead |
| Input row | `<form>` + `<input type="text">` | `<label class="sr-only">Command input. Type a command, or press Tab to reach suggested command buttons. Try "help".</label>`; `autocomplete="off"`, `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"`, `enterkeyhint="go"`, `inputmode="text"` | the label doubles as usage hint; `aria-describedby` a hidden hint listing arrow-history/tab-complete for desktop |
| Boot sequence | `<div role="status" aria-hidden="true">` for the animated lines + separate announcer message | skip button `<button>Skip intro</button>` is first focusable during boot | see 4.4 |
| Announcers | two sr-only `aria-live` divs (polite + assertive) | `aria-atomic="true"` | singleton `LiveAnnouncer`; assertive reserved for hard errors |
| Status bar | `<header>` | — | decorative info; theme dot needs text alternative if it conveys state |

### 4.2 Focus management (flow)

```
LOAD (mobile)                         LOAD (desktop, hover+fine pointer)
  │ no autofocus; document focus        │ boot plays → focus input
  │ boot plays; [Skip intro] is         │ ("Skip intro" reachable via Tab)
  │ first tab stop                      ▼
  ▼                                   input focused, caret visible
boot ends → focus NOT moved
(announcer summarizes boot, §4.4)

COMMAND VIA CHIP (tap or keyboard-activated)
  chip activated
    → command runs, block renders
    → focus moves to new <article tabindex="-1">
       (focus ring on block per theme; SR reading position = start of block)
    → Tab from block: content links → block chips → tray → input

COMMAND VIA TYPED INPUT (Enter)
  → focus STAYS in input (typist's flow; they may type again)
  → announcer says summary (§4.3); user can Tab backwards or use
    a shortcut to jump to output (see Q4)

CLEAR
  → focus returns to input (desktop) / tray's first chip (mobile,
    only if focus was inside a now-removed block — never focus-jump
    if user's focus was already on tray/input)

RULE: never let focus land on document.body. If an element holding
focus is removed (e.g. `clear`), explicitly move focus per above.
```

- **Visible focus ring:** every theme must define `--focus-ring` with ≥3:1 contrast against both the background and the component it surrounds (WCAG 1.4.11 + 2.4.13-style thickness: 2px minimum, offset 2px). Implemented once via Tailwind plugin: `focus-visible:outline-2 outline-offset-2 outline-[var(--focus-ring)]` — never `outline: none` without replacement. This is a hard requirement handed to the theme-system plan.
- **Keyboard-only path (must be provably completable):** Tab → skip link → (log if focused content) → tray (one stop, arrows within) → keyboard-toggle → input. Every chip activable with Enter/Space; every journey completable with no pointer.

### 4.3 Live-region strategy (no SR spam)

The core problem: a terminal that typewriter-animates text into a `role="log"` with default live semantics would announce **every DOM mutation** — character-by-character chaos. Strategy:

1. **The log is not live.** `role="log"` implies `aria-live="polite"`; we override with explicit `aria-live="off"` on the log container. AT users read output on their terms (it's focusable and structured with headings — heading-jump navigation works).
2. **One polite announcer, one message per command.** After a block finishes rendering, `LiveAnnouncer.polite()` posts a single authored summary, e.g.:
   - `whoami` → "About Yavor rendered. Builder and AI product person at Team-GPT. 4 suggested commands available."
   - Each command's registry entry supplies `srSummary: string` (content-blocks plan owns the copy; this plan owns the mechanism and the format: *what rendered + one-line gist + chip count*).
3. **Typewriter text:** animated visual text is `aria-hidden="true"`; the full final text exists in an sr-only sibling immediately (no waiting for the animation).
4. **Debounce/queue:** announcer is a singleton with a queue; messages < 500ms apart merge; identical consecutive messages get a zero-width-space toggle so they re-announce.
5. **Assertive is for errors only:** unknown command → assertive "Unknown command 'foo'. Did you mean 'juma'?" (it's a direct response to user action; assertive is justified and rare).
6. **Boot:** exactly one announcement (§4.4). Theme switch: one polite "Theme changed to …".

### 4.4 Screen-reader boot experience — **recommendation: summarize, don't play**

- The animated boot lines are `aria-hidden="true"` — SR users should not sit through fake BIOS text.
- On mount, announcer (polite) posts: *"yavor.codes — Yavor Belakov's interactive terminal. Type a command or use the suggested command buttons. Try 'help'."* That is the entire SR boot.
- "Skip intro" button is real, first-focusable, and works for everyone (also satisfies the DoD "skippable" requirement); activating it jumps straight to ready state.
- Under `prefers-reduced-motion`, boot collapses to a single static frame (~300ms) — effectively auto-skipped (owned by boot-sequence plan; requirement recorded here).

### 4.5 Reduced motion (`useReducedMotion` — Framer Motion's hook + CSS)

| Feature | Full motion | Reduced |
|---|---|---|
| Boot sequence | typed lines, flicker | single static frame, instant ready |
| Block entrance | slide/fade/spring | opacity-only, ≤150ms, or none |
| Typewriter output | animated | full text instant |
| Chip ghost-typing | 120ms echo | instant fill + submit |
| Tray re-order | layout animation | instant swap |
| Smooth scroll | `behavior:'smooth'` | `behavior:'auto'` |
| R3F backdrop | animated shader | static frame or hidden (visual-layer plan; requirement recorded here) |
| Cursor blink | blinking | steady block cursor (blink is technically allowed but steady is kinder) |

Implementation: single source of truth — a `useReducedMotion()` context value threaded to Framer Motion variants + a global CSS `@media (prefers-reduced-motion: reduce)` layer for non-JS animations. Never two divergent checks.

### 4.6 Color-contrast requirements → theme system (hard handoff)

Every theme must ship these token pairs passing the stated ratios (CI-checked, see §6):

| Token pair | Ratio | WCAG |
|---|---|---|
| primary text / bg | ≥ 7:1 (target), ≥ 4.5:1 (floor) | 1.4.6 / 1.4.3 |
| **dim/secondary text / bg** | **≥ 4.5:1 — dim is a *style*, not low contrast.** Achieve "dim" via weight/opacity-of-accent-hue while staying ≥4.5:1 | 1.4.3 |
| chip label / chip bg | ≥ 4.5:1 | 1.4.3 |
| chip border-or-bg / page bg | ≥ 3:1 | 1.4.11 |
| focus ring / adjacent colors | ≥ 3:1 | 1.4.11 |
| link/accent text / bg | ≥ 4.5:1 + not color-alone (underline or bracket affordance) | 1.4.1 |
| text over R3F backdrop | measured against **worst-case** backdrop frame; if unprovable, blocks get a solid/95%-opaque panel behind text | 1.4.3 |

Text over animated shader backdrops is the trap: the rule is that terminal text never sits directly on the canvas — the log region has a theme background at ≥ the required opacity.

---

## 5. File / component implications

New components/hooks introduced by this subsystem (paths assume `src/` layout):

```
src/
  components/terminal/
    ChipTray.tsx           # persistent tray: composition rules (§2.1),
                           # roving tabindex, h-scroll + snap, edge fades,
                           # re-compose on command-complete event
    Chip.tsx               # shared button used by tray + blocks; 44px,
                           # ghost-typing hook-in, aria-disabled window
    KeyboardToggle.tsx     # ⌨ affordance; focuses/blurs the real input
    CommandInput.tsx       # (owned by terminal-engine; THIS plan contributes:
                           #   16px font floor, autocap/correct/spellcheck off,
                           #   enterkeyhint, sr-only label + describedby hint,
                           #   no-autofocus-on-coarse-pointer rule)
    OutputLog.tsx          # role=log wrapper; scroll rules (§3); overflow-anchor;
                           #   at-bottom tracking; focus handoff to new blocks
    BlockShell.tsx         # <article tabindex=-1> wrapper every rich block
                           #   renders into: heading id wiring, scroll-margin,
                           #   entrance variants (full/reduced), block-chips slot
    BootScreen.tsx         # (owned by boot-sequence; contributes: aria-hidden
                           #   lines, Skip button focus order, SR summary call)
  components/a11y/
    LiveAnnouncer.tsx      # singleton polite+assertive regions + context API
                           #   (announce.polite/assertive), queue + dedupe
    SkipLink.tsx           # skip-to-input link
    VisuallyHidden.tsx     # sr-only utility component
  hooks/
    useViewportKeyboard.ts # visualViewport listener → { keyboardOpen,
                           #   viewportHeight } + sets --app-height CSS var;
                           #   no-ops on desktop
    usePointerMode.ts      # coarse/fine + hover media queries → 'touch'|'desktop'
                           #   (SSR-safe: defaults to 'touch', resolves on mount
                           #   before any autofocus decision)
    useReducedMotion.ts    # wraps framer-motion's hook into app context
    useRovingTabIndex.ts   # arrow-key focus management for the tray
    useScrollNewOutput.ts  # scrollIntoView orchestration per §3 (or folded
                           #   into OutputLog)
  app/
    layout.tsx             # viewport export: width=device-width, viewport-fit=
                           #   cover, interactive-widget=resizes-content;
                           #   NO maximum-scale/user-scalable restrictions
    globals.css            # dvh/--app-height plumbing, safe-area padding,
                           #   overscroll rules, focus-ring plugin layer,
                           #   prefers-reduced-motion CSS layer
```

Contract additions this plan imposes on **other** plans:

- **terminal-engine:** command registry entries carry `suggestedNext: string[]` and `srSummary: string`; engine emits a `commandRendered` event (tray re-compose + announcer + focus handoff all key off it); engine must never autofocus input itself — it asks `usePointerMode`.
- **theme-system:** tokens listed in §4.6 incl. `--focus-ring`; contrast CI gate.
- **boot-sequence:** aria-hidden animation, Skip-first-focus, single SR summary, reduced-motion static frame.
- **visual-layer:** canvas `aria-hidden` + `inert`, reduced-motion static/hidden mode, pause when keyboard open, never hosts focusable elements.

**Build sequencing** (fits phase plan in overview.md): Phase 1 lands `usePointerMode`, layout/viewport CSS, `OutputLog` semantics, `LiveAnnouncer`, plain-text `BlockShell`; Phase 2 lands boot a11y + reduced motion; Phase 3 lands `ChipTray`/`Chip` for real, block headings audit; Phase 4 is the device-matrix test pass (§6).

---

## 6. Test checklist

### Devices / browsers (manual matrix)

- [ ] iPhone SE (375×667, smallest realistic) — Safari: portrait, landscape, keyboard open/close, safe-area (none), no zoom on input focus
- [ ] iPhone 14/15 class (390×844, notch) — Safari: safe-area-inset-bottom respected keyboard closed AND open; URL-bar collapse doesn't jump layout; **LinkedIn in-app browser** (primary traffic! webview quirks: visualViewport support, safe-area) — open `yavor.codes` from an actual LinkedIn post
- [ ] Android mid-range (Pixel or Samsung, Chrome): `interactive-widget=resizes-content` behavior, keyboard open resize, back-gesture doesn't conflict with tray edge-scroll
- [ ] Samsung Internet (chip tray scroll, dvh support)
- [ ] iPad Safari + hardware keyboard: `usePointerMode` resolves correctly (no forced mobile mode with trackpad; no autofocus with touch only)
- [ ] Desktop Chrome/Firefox/Safari at 320px, 390px, 768px widths (responsive mode sanity + real 320px = WCAG 1.4.10 reflow, no horizontal scroll)

### Assistive tech

- [ ] **VoiceOver + iOS Safari** (the flagship combo for this audience): boot = single summary; swipe-explore reaches log → tray → input; chip double-tap runs command and reading position lands on new block; typewriter text not announced per-character; one polite announcement per command
- [ ] **TalkBack + Chrome Android:** same script
- [ ] **NVDA + Firefox** and **NVDA + Chrome** (desktop): typed command → single polite summary; heading-jump (H key) walks h1 → h2 blocks; focus mode/browse mode transitions around the input are sane
- [ ] **VoiceOver + macOS Safari:** rotor shows landmarks (main, nav "Suggested commands") and headings
- [ ] Windows High Contrast / forced-colors mode: chips still look like buttons, focus visible (spot check)

### Keyboard-only (desktop, no pointer)

- [ ] Full journey: load → skip boot → run 3 commands via typed input and via tray chips (Tab + arrows + Enter) → theme switch → clear — zero pointer use
- [ ] Focus never lost to body; never trapped; visible ring at every stop in **all themes**
- [ ] Tray roving tabindex: single Tab stop, ←/→ within, Home/End optional

### Automated / CI

- [ ] Lighthouse mobile: Accessibility ≥ 95 (DoD), on both initial state and post-3-commands DOM
- [ ] axe-core (jest-axe or Playwright + axe) on: boot state, each command's rendered block, keyboard-open state
- [ ] Contrast unit test: iterate theme tokens × pairs table (§4.6), fail CI under ratio
- [ ] Playwright viewport tests: 320/390/430 widths — no horizontal scroll; chip tap → new block visible without manual scroll; input `font-size ≥ 16px` computed check
- [ ] `prefers-reduced-motion` emulation test: no animated boot, instant text, `scrollIntoView` called with `auto`
- [ ] Unit: LiveAnnouncer queue/dedupe; ChipTray composition rules (contextual + anchors + dedupe)

---

## 7. Open questions

1. **Q1 — Tray on desktop:** plan hides the persistent tray on fine-pointer devices (block chips + typing suffice). Counter-argument: the tray is also discoverability UI for mouse users. Decide during Phase 3 with real content; cheap to toggle via `usePointerMode`.
2. **Q2 — `history` command vs. long-session scroll:** if `history` re-renders many blocks, does the log need virtualization or does `history` render one compact block? Recommend compact single block (keeps §3 simple); needs agreement with content-blocks plan.
3. **Q3 — Keyboard accessory row** (mini `[↑][↓][tab]` buttons above the input when keyboard is open, giving mobile users arrow-history/tab-complete): delightful but extra surface to make accessible. Recommend: v1 ship without; tab-complete on mobile instead via a single "completion chip" appearing in the tray as you type. Decide in Phase 4.
4. **Q4 — Jump-to-output shortcut for typists:** after Enter, focus stays in input; power SR users may want a key (e.g. `Ctrl+ArrowUp` or F6-style region cycling) to hop to the last block. Recommend adding F6 region cycling (input ↔ log ↔ tray) if testing shows friction; note it in the input's `aria-describedby` hint if shipped.
5. **Q5 — LinkedIn in-app browser unknowns:** does its webview honor `visualViewport` and `interactive-widget`? Must be answered empirically in Phase 1 with a deployed preview opened from a real LinkedIn post (this is the single highest-traffic environment and the least documented).
6. **Q6 — Haptics:** `navigator.vibrate` tick on chip tap (Android only; iOS web unsupported). Nice-to-have; skip unless trivial.
7. **Q7 — `theme` command contrast escape hatch:** if a future theme is deliberately lo-fi, do we allow an "accessibility-safe variant" auto-substitution when `prefers-contrast: more` is set? Flag to theme-system plan.
