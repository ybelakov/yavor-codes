# yavor.codes — Boot Sequence & First-Load Experience Plan

Scope: the cinematic fake-boot on first visit, skip behavior, returning-visitor fast path, post-boot handoff (auto-run + hint chips), teletype rendering approach, reduced-motion fallback, and the SSR/hydration strategy that makes first paint instant and shift-free.

Out of scope (owned by sibling plans): terminal engine internals, theme definitions, block content, R3F backdrop, deployment.

---

## 1. Beat-by-beat storyboard

Total budget: **≤2.5s** from first paint to interactive prompt (target 2.2s, hard cap enforced in code). Any keypress/tap/click at any beat jumps straight to Beat 6.

| Beat | t (ms) | Duration | What happens |
|---|---|---|---|
| **0. First paint (SSR)** | 0 | — | Server-rendered shell: themed background, terminal frame, and the first boot line (`yavor.codes bios v1.0`) already in the HTML with a static cursor. No blank frame, no logo flash, no layout shift. A visually quiet "press any key to skip" affordance is in the SSR output too. |
| **1. BIOS stub** | 0–350 | 350ms | 2 short lines appear line-by-line (not char-by-char — too slow for throwaway copy): `yavor.codes bios v1.0` (already painted), then `memory check ... 640K ok (should be enough for anybody)`. |
| **2. ASCII logo** | 350–900 | 550ms | `YAVOR.CODES` ASCII-art logo reveals top-to-bottom, row by row (~5 rows, ~60ms stagger) with a brief theme-accent glow on completion. On narrow viewports (<420px) a compact 3-row variant renders instead — both are in the HTML and CSS media queries pick one (no JS, no shift). |
| **3. Init cascade** | 900–1900 | 1000ms | 6–7 personality lines cascade with per-line `[ ok ]` stamps landing slightly after the label, e.g.:<br>`mounting /dev/teamgpt ............ ok`<br>`loading juma ..................... ok`<br>`syncing sofia <-> san francisco .. ok (9h offset)`<br>`warming up aie.f community ....... ok`<br>`brewing coffee ................... ok`<br>`counting linkedin posts .......... 100+ found`<br>One line deliberately hesitates ~150ms before its `ok` (comic timing on `brewing coffee`). Lines reveal whole-line; only the trailing dots + status stamp animate. |
| **4. Boot done** | 1900–2050 | 150ms | `boot complete in 1.9s` line; brief pause. |
| **5. Auto-command** | 2050–2400 | 350ms | The prompt appears and **types `whoami` character-by-character** (~40ms/char — the one place true teletype is used, because it teaches the interaction model), then "presses enter". |
| **6. Handoff** | 2400 | — | Terminal engine executes `whoami`; boot component unmounts its animation logic; **hint bar with command chips** (`juma`, `posts`, `help`, `theme`) fades in under the prompt; input focused (desktop only — never auto-focus on mobile, it summons the keyboard). Boot lines remain visible in scrollback as history. |

**Skip at any point:** everything collapses instantly to the Beat-6 end state — full boot text present in scrollback (rendered statically, no animation), `whoami` output shown, chips visible, prompt ready. Skipping never loses content; it only removes waiting.

**Returning visitors** (see §5): Beats 1–4 collapse to a single 400ms sequence — logo pops in one frame, one line `welcome back — last boot cached` — then straight to Beat 5/6. Total ~700ms.

**Reduced motion:** no animation at all; the full boot transcript, `whoami` output, and chips render immediately as static content (see §5).

---

## 2. Key decisions & tradeoffs

### D1. Boot lines as pre-seeded terminal history — not a separate overlay. **Recommended: history entries.**
- **Overlay approach:** a full-screen `BootSequence` overlay plays, then unmounts to reveal the real terminal. Pros: total isolation from the engine; boot can be visually different. Cons: a swap moment where the overlay unmounts and the terminal mounts → high risk of flash/shift exactly at the emotional peak; boot text vanishes instead of living in scrollback; duplicated line-rendering code; skip logic must coordinate two trees.
- **History approach (chosen):** the boot is a sequence of special history entries (`kind: 'boot-line'`) appended into the same scrollback the terminal engine renders. The boot "player" is just a controller that appends entries on a schedule. Pros: zero handoff seam — boot flows continuously into the session; users can scroll back up to the boot (delightful, on-concept); one renderer; skip = "append all remaining entries at once". Cons: requires the engine's history store to exist before boot polish lands (fine — Phase 1 ships the engine, Phase 2 ships boot), and requires the engine to expose a small imperative API (see contract in §4).
- **Contract with terminal-engine:** engine exposes `appendEntries(entries)`, `runCommand(name, {simulateTyping})`, and renders `boot-line` entries via a renderer that boot code owns. Boot never touches engine internals.

### D2. Auto-run after boot: `whoami`, not `help`. **Recommended: `whoami`.**
- `help` is a menu — it answers "what can I do" but not "who is this person"; leading with it is like a restaurant handing you the fire-exit map. `whoami` delivers identity in the first 5 seconds (the whole point of a personal site) and the typed-out command *demonstrates* the interaction model. Discoverability is not lost because the **hint bar chips** (including a `help` chip) appear simultaneously. `whoami`'s block must end with next-step chips anyway (a DoD requirement), doubling the guidance.
- Tradeoff: `whoami` output must be fast and light (no heavy R3F on mount) since it's on the critical first-impression path — flag this to the content-blocks plan.

### D3. Teletype approach: **line-reveal for boot, char-by-char only for the auto-typed command.**
- Char-by-char for ~15 lines of boot copy at readable speed would blow the 2.5s budget or force unreadably fast typing; it also generates hundreds of React re-renders. Line-reveal (each line fades/slides in as a unit, with an animated trailing-dots + status stamp) reads as "machine output" — which is what real boots look like — and costs one render per line.
- Char-by-char is reserved for Beat 5's `whoami` (6 chars, ~240ms) where it reads as "a human typing", which is the correct semantic.
- **Performance implementation:** one `requestAnimationFrame`/timeout-driven scheduler in the boot player appends entries; per-line entrance animation is CSS/Framer Motion on mount (GPU-composited opacity/transform only — no width/height animation, no layout thrash). The char-by-char typer for Beat 5 mutates a single state string in one component; at 6 chars this is trivial. A shared `useTeletype` hook is still worth extracting because the terminal engine may reuse it for chip-clicked commands ("chips type the command into the prompt" is a nice consistency win — flag to terminal-engine plan).

### D4. Shortened boot for returning visitors. **Recommended: yes, via `localStorage`, ~700ms variant.**
- Full cinematic boot every visit becomes an obstacle by visit #3. Returning = `localStorage["yc:boot:v1"]` exists (set after first successful boot or skip). Value stores `{ seenAt, count }` so we can later do fun things (`boot #7 — you again?`).
- Why localStorage, not a cookie: no server-side branching needed (see D5 — the SSR output is identical either way and the decision is made in a pre-hydration inline script), no cookie banners/compliance surface, consistent with theme persistence which already uses guarded localStorage. Guard all access in `try/catch` (Safari private mode).
- A `reboot` command (or `boot --full`) replays the full cinematic on demand — cheap to add since the player is data-driven, and it turns the boot into a shareable feature instead of a one-shot.

### D5. SSR strategy: server renders the *static first frame*, an inline pre-hydration script picks the variant. (Detail in §6.)
- The alternative — rendering nothing server-side and playing everything client-side — means a blank terminal until hydration (bad LCP, bad no-JS story). The alternative in the other direction — streaming the boot from the server — is over-engineering with no control over pacing. Chosen: SSR paints Beat 0 exactly; client takes over invisibly.

### D6. Hard time cap as a safety property, not just a design intent.
- The player computes its schedule from the script data and **asserts total ≤2500ms in dev/test**; a `scripts`-level unit test sums durations so nobody can add a funny line that silently pushes boot to 4s. Copy is editable (§4) but pacing is validated.

---

## 3. File list & responsibilities

```
lib/boot/
  bootScript.ts          # THE COPY. Boot script data (typed), full + short variants,
                         # ASCII logo strings (wide + compact). No React. Editable by
                         # Yavor without touching components.
  bootTypes.ts           # BootLine / BootScript / BootPhase types (shared with tests).
  bootState.ts           # Read/write "has booted before" + reduced-motion resolution.
                         # All localStorage access guarded. Pure functions + tiny hook.
  useBootPlayer.ts       # The scheduler hook: consumes a BootScript, appends entries
                         # to terminal history on schedule, exposes { phase, skip() }.
                         # Owns the ≤2.5s invariant, skip semantics, cleanup on unmount.

components/boot/
  BootSequence.tsx       # Client component orchestrating boot: wires useBootPlayer to
                         # the terminal store, installs global skip listeners
                         # (keydown/pointerdown, capture phase), triggers auto-command,
                         # then renders null. No visuals of its own.
  BootLineRow.tsx        # Renderer for kind:'boot-line' history entries: label,
                         # animated trailing dots, status stamp ([ ok ] / value),
                         # entrance motion. Registered with the engine's renderer map.
  AsciiLogo.tsx          # Wide + compact <pre> logos (CSS media query chooses),
                         # row-stagger reveal, aria-hidden with sr-only "yavor.codes".
  BootStatic.tsx         # SERVER component: the Beat-0 first frame (frame, first line,
                         # cursor, skip hint) + the full static transcript variant used
                         # for no-JS and reduced-motion. Shares line markup with
                         # BootLineRow via a common presentational partial.
  SkipHint.tsx           # "press any key ▸" / "tap to skip" affordance; fades out at
                         # handoff. Pointer-media query picks wording.

components/terminal/
  HintBar.tsx            # Post-boot command chips (juma / posts / help / theme).
                         # Appears at handoff, persists as the mobile-first input aid;
                         # clicking a chip calls engine.runCommand(..., {simulateTyping}).
                         # (Shared ownership with mobile-accessibility plan — boot plan
                         # owns its entrance timing, that plan owns chip behavior.)

lib/hooks/
  useTeletype.ts         # Char-by-char typing hook (string, cps, onDone). Used by
                         # Beat 5 auto-command and reusable by chip-click typing.
  useReducedMotion.ts    # If Framer Motion's useReducedMotion doesn't cover the SSR
                         # case cleanly, thin wrapper; otherwise delete and use theirs.

app/
  page.tsx               # Composition: <TerminalShell> with <BootStatic> as the
                         # SSR/fallback child and <BootSequence> mounted client-side.
  layout.tsx             # Hosts the inline pre-hydration script (boot variant + theme
                         # class on <html>/<body> before first paint) — shared with
                         # theme-system plan; boot contributes data-boot="full|short|static".

tests/
  bootScript.test.ts     # Sums scheduled durations for every variant, asserts ≤2500ms
                         # (full), ≤900ms (short); asserts every line has valid timing.
  bootPlayer.test.tsx    # Fake timers: full run appends all entries in order; skip at
                         # arbitrary t yields identical final history; unmount cleans up.
```

---

## 4. Data shape for the boot script

All copy, pacing, and status stamps live in `lib/boot/bootScript.ts` as plain data. Editing a joke never touches a component.

```ts
// lib/boot/bootTypes.ts
export type BootLineStyle = 'bios' | 'init' | 'system' | 'blank';

export interface BootLine {
  id: string;               // stable key for React + tests
  style: BootLineStyle;
  text: string;             // "loading juma"
  status?: string;          // "ok" | "9h offset" | "100+ found" — rendered as stamp
  statusTone?: 'ok' | 'info' | 'warn';   // theme-token color of the stamp
  delayBefore: number;      // ms gap after previous line lands
  statusDelay?: number;     // ms hesitation before the stamp lands (comic timing)
}

export interface BootScript {
  variant: 'full' | 'short';
  logo: 'wide-and-compact' | 'none';     // logo assets referenced, not embedded
  logoRevealMs: number;                  // total logo reveal duration
  lines: BootLine[];
  doneLine: BootLine;                    // "boot complete in {elapsed}s" — supports token
  autoCommand: {
    command: 'whoami';
    typeCps: number;                     // chars/sec for the teletype
    startDelay: number;
  };
  maxTotalMs: number;                    // 2500 / 900 — enforced by player + tests
}

// lib/boot/bootScript.ts exports:
export const fullBoot: BootScript;
export const shortBoot: BootScript;     // welcome-back variant
export const asciiLogoWide: string[];   // array of rows (row-stagger animates per row)
export const asciiLogoCompact: string[];
```

Boot lines enter terminal history as `{ kind: 'boot-line', line: BootLine }` entries — the engine's history type needs a `kind` discriminator with an extension point for this (contract item for terminal-engine plan). `{elapsed}` in `doneLine` is the only templating; keep it to a single token replace, no template engine.

---

## 5. Skip / reduced-motion / returning-visitor logic

**Skip (any key, any tap, instantly):**
- `BootSequence` installs `keydown` + `pointerdown` listeners on `window` in **capture phase** while `phase !== 'done'`, so no child can swallow the event. Modifier-only keydowns (Cmd/Ctrl/Alt/Shift alone) and browser-chrome combos are ignored; everything else skips. Listeners removed at handoff.
- `skip()` semantics: cancel all pending timers, append **all remaining entries at once with animations disabled** (an `instant: true` flag on the entries → `BootLineRow` renders without entrance motion), synchronously run the auto-command *without* teletype, show chips, mark boot-seen. One code path produces the final state whether reached by playing or skipping — test asserts history equality.
- The `SkipHint` renders from Beat 0 (it's in the SSR output) so even a 0-patience visitor learns the escape hatch immediately. Keep it visually quiet (dim, bottom-right).

**Reduced motion (`prefers-reduced-motion: reduce`):**
- Resolved *before* first paint by the inline script (media query is available pre-hydration) → `data-boot="static"`.
- Static mode: no player at all. The full transcript renders as static history (via `BootStatic`'s transcript variant), `whoami` runs immediately without teletype, chips shown immediately. The user gets 100% of the content and personality copy, 0% of the waiting — reduced motion must never mean reduced information.
- Also listen for the media query flipping mid-boot (rare) → treat as skip.

**Returning visitor:**
- Inline pre-hydration script reads `localStorage["yc:boot:v1"]` in try/catch → sets `data-boot="short"` on `<html>` if present (and `"static"` wins if reduced-motion). `BootSequence` reads the attribute to pick `shortBoot` vs `fullBoot`.
- Written (`{ seenAt, count }`) at handoff — whether played or skipped. Storage failure (private mode) degrades to "always full boot", which is acceptable.
- Version the key (`v1`) so a future boot redesign can re-premiere itself.
- `reboot` command (register with the engine, low priority): clears nothing, just replays `fullBoot` by re-mounting the player — cheap crowd-pleaser.

**Decision matrix (evaluated in this order):**

| Condition | Variant |
|---|---|
| `prefers-reduced-motion` | `static` — full transcript instantly, no animation |
| boot-seen key present | `short` (~700ms) |
| otherwise | `full` (≤2.5s) |
| any key/tap during full/short | collapse to end state instantly |
| JS disabled / hydration failed | SSR static transcript + noscript hint (chips as links? — open question Q4) |

---

## 6. SSR / hydration strategy — instant, correct first paint

**Principle:** the server renders exactly Beat 0; the client's first render must produce identical DOM for that frame; all divergence happens *after* hydration via state transitions, never via markup mismatch.

1. **Server renders (`BootStatic` inside `page.tsx`, RSC/static — this page should be fully static-generated):**
   - Terminal frame + background using the **default theme's classes** (theme correction is the theme plan's inline script; boot just requires that script to run before paint so the boot never flashes the wrong theme).
   - Boot line #1 (`yavor.codes bios v1.0`) and a CSS-animated cursor — CSS animation runs before hydration, so the site looks alive even on a slow connection.
   - `SkipHint`. The logo *area* has no reserved height; lines simply append below, and because the terminal scrolls downward (content grows at the bottom like a real terminal), appended content causes **scroll**, not **shift** — nothing already-painted moves. This is the key anti-CLS property of the history-entry approach: boot only ever appends.
2. **Inline script in `layout.tsx` `<head>` (runs pre-paint, a few hundred bytes, shared with theme script):** resolves reduced-motion + boot-seen → `document.documentElement.dataset.boot = 'full' | 'short' | 'static'`. Because the SSR markup for Beat 0 is identical across all three variants, this sets no markup expectations — it only tells the client component which script to play. **`suppressHydrationWarning` on `<html>`** for the data attributes (same as theme).
3. **Hydration:** `BootSequence` (client) mounts, adopts the already-visible line #1 as history entry #1 (the script data's first line matches the SSR line — a test pins this), and starts the scheduler from Beat 1's remaining lines. If hydration completes late (slow device), the user has been watching a painted frame with a blinking cursor — the boot simply starts late but the cap still applies from *player start*, and time-to-skip is bounded because the skip listeners attach at mount. Acceptable: pre-hydration keypresses can't skip; mitigation is keeping the JS on this route small (defer R3F backdrop behind the boot — it must lazy-load *after* handoff, never compete with boot hydration — contract item for visual-layer plan).
4. **`static` variant:** `BootSequence` bails out of the player entirely and appends the full transcript in one commit. Slight DOM change post-hydration but append-only ⇒ no CLS.
5. **No-JS:** the SSR output alone shows frame + first line + cursor + a `<noscript>` line ("this terminal needs JavaScript — meanwhile: linkedin.com/in/…"). Good-citizen fallback, minimal effort.
6. **Fonts:** the monospace webfont must be loaded with `next/font` (self-hosted; `display: swap` is *wrong* here — use `optional` or preload with `swap` + metric-compatible fallback via `adjustFontFallback`) so line metrics don't jump mid-boot. Font swap during a teletype animation is the most likely CLS source in the whole design; flag as a must-test.

---

## 7. Implementation order

1. `bootTypes.ts` + `bootScript.ts` with placeholder copy + duration test (pure data, no deps).
2. Engine contract PR (with terminal-engine work): `kind` discriminator on history entries, `appendEntries`, `runCommand({simulateTyping})`, renderer registration.
3. `BootLineRow` + `AsciiLogo` static rendering (no animation) → `BootStatic` server component → wire into `page.tsx`. First paint correctness done here.
4. `useBootPlayer` + `BootSequence` full variant + skip. Test skip-equivalence with fake timers.
5. `useTeletype` + auto-`whoami` + `HintBar` entrance.
6. Inline pre-hydration script, `bootState.ts`, short variant, reduced-motion static path.
7. Polish pass: comic timing values, logo glow, mobile compact logo, font-loading CLS audit, Lighthouse check.

---

## 8. Open questions

1. **Auto-command on `short` boot too?** Recommended yes (returning visitors still land on identity + chips), but maybe skip the teletype and just show the output — needs a feel-check in the browser.
2. **Sound?** A sub-100ms "boot chirp" is on-theme but autoplay policies block audio before interaction, so it could only play on skip-keypress or later interactions. Default: no sound in v1; leave a hook point in the player's phase transitions.
3. **Does the ASCII logo persist in scrollback or get replaced by `neofetch`-style art later?** Persisting is simpler and on-concept (recommended); confirm it doesn't fight with the `neofetch` block visually.
4. **No-JS chips as real links?** Chips could be `<a href="/juma">` server-side (matching the 404/deep-link routing story from infra plan) and progressively enhanced into command-runners. Depends on whether deep-link routes exist in v1 — coordinate with infra-deploy plan.
5. **Analytics events** (owned by infra plan, but boot should emit them): `boot_completed` vs `boot_skipped` + skip timestamp is the single best signal for whether 2.2s is too long. Confirm event names.
6. **Exact hint-bar chip set and order** (`juma` first vs `help` first) — content decision for Yavor; the component takes it as props/config so it's a one-line change.
7. **`brewing coffee` hesitation length** and final copy list — needs Yavor's review per DoD ("all copy real, reviewed").
