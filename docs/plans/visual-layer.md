# yavor.codes — Visual/Motion Layer Plan

Scope: the R3F shader backdrop, CSS CRT overlay, Framer Motion language for terminal output, the optional whoami 3D moment, and the performance budget. Consumes theme tokens (CSS custom properties) defined by `theme-system.md`; does not define them. Does not touch the terminal engine or block content.

Guiding rule: **the terminal is the product; the visual layer is atmosphere.** Anything that competes with text legibility or input latency gets cut.

---

## 1. Backdrop concept and fallback tiers

### Recommendation: **flowing gradient noise** (domain-warped fbm on a fullscreen quad)

Evaluated against the three candidates:

| Candidate | Verdict | Why |
|---|---|---|
| **Flowing gradient noise** | **Pick** | Single fullscreen fragment shader, zero geometry/draw-call complexity, cheapest option. Reads well at very low contrast, works under dark *and* light themes because it's purely a function of 2–3 theme colors passed as uniforms. Never has "objects" that fight the text for attention. |
| Sparse particle field | Reject for v1 | Needs per-theme density/size/brightness tuning to avoid looking like noise on light themes; individual bright points draw the eye away from the prompt; more state (buffers, attributes) for marginal payoff. |
| Faint grid horizon | Reject as primary | Strongly stylized (synthwave). It fights any theme that isn't neon-on-dark. Could return later as a *per-theme variant* shader behind the same uniform contract, not as the default. |

The noise field should be **slow** (full visual period ~20–30s), **low contrast** (theme colors mixed at low delta, further dimmed by a `--backdrop-intensity` token), and **dithered** (hash-based dither in the shader to kill banding on dark themes — banding is the #1 way subtle gradients look cheap).

### Fallback tiers

Tier is decided once per session by `lib/gpuTier.ts` (§5) and rendered by a single `<Backdrop />` switch component:

| Tier | Name | What renders | Who gets it |
|---|---|---|---|
| **T3** | WebGL full | R3F fullscreen shader, DPR ≤ 1.5, 60fps | Desktop/modern mobile with healthy GPU |
| **T2** | WebGL lite | Same shader, DPR = 1, throttled to 30fps, fewer noise octaves (uniform-controlled) | Mid mobile, `deviceMemory ≤ 4`, weak GPU string |
| **T1** | CSS animated | No canvas. Two large blurred radial-gradient blobs (theme colors) drifting via a compositor-only `transform` keyframe animation (~40s loop) | WebGL unavailable/blacklisted, `saveData`, runtime FPS probe failed |
| **T0** | Static | Static layered radial/linear CSS gradient from the same theme vars; no animation at all | `prefers-reduced-motion: reduce`, or user `theme fx off` (if the theme system exposes it) |

Critical ordering detail: **T1/T0 CSS gradient is the *initial* render for everyone.** The canvas is lazy-loaded and cross-fades in on top (opacity 0 → 1 over 800ms) only after boot completes. First paint therefore never waits on three.js, and the "downgrade" path is simply "never upgrade."

---

## 2. Shader approach sketch

### Architecture

- One `<Canvas>` (`position: fixed; inset: 0; z-index: 0; pointer-events: none`), `ssr: false` via `next/dynamic`.
- One mesh: a **single clip-space triangle** (hand-built `BufferGeometry`, 3 vertices covering NDC) — no camera math, no `PlaneGeometry`, no drei dependency. Vertex shader is a passthrough.
- `gl` props: `antialias: false` (pointless for a gradient), `alpha: true`, `powerPreference: 'low-power'`, `depth: false`, `stencil: false`. `dpr={[1, tier === 3 ? 1.5 : 1]}`.
- No postprocessing library. Ever. CRT effects are CSS (§3).

### Uniform contract

```glsl
uniform float uTime;        // seconds, accumulated only while running (pause-safe)
uniform vec2  uResolution;  // drawing buffer size
uniform vec3  uColorA;      // --backdrop-a  (dominant / base)
uniform vec3  uColorB;      // --backdrop-b  (accent flow)
uniform vec3  uColorC;      // --backdrop-c  (highlight, used sparingly)
uniform float uIntensity;   // --backdrop-intensity (0..1) — master dim per theme
uniform float uSpeed;       // --backdrop-speed — themes can feel calmer/livelier
uniform float uOctaves;     // 2.0 (T2) or 3.0 (T3) — set once at mount
```

Fragment sketch: 2D simplex/value noise → 3-octave fbm → one domain-warp pass (`fbm(p + fbm(p + t))`) → `mix(uColorA, uColorB, n1)` then `mix(result, uColorC, smoothstep(0.7, 1.0, n2) * 0.25)` → multiply by `uIntensity` → add `(hash(gl_FragCoord.xy) - 0.5) / 255.0` dither. Shaders live as exported template strings in `components/background/shaders/gradient.ts` (no glsl-loader/webpack plugin needed).

### CSS vars → uniforms, and theme switching

Theme tokens are CSS custom properties on `:root`/`html[data-theme=…]` (owned by `theme-system.md`). The bridge:

1. **Contract with the theme system:** backdrop color tokens must resolve to formats `THREE.Color` can parse — `#rrggbb` or `rgb(...)`. (If the theme system prefers `hsl()`, resolve via a one-off `new THREE.Color().setStyle()` — it handles hsl too in modern three; document `#hex` as the safe format. This is Open Question 1.)
2. `lib/useThemeBackdrop.ts` hook: reads `getComputedStyle(document.documentElement).getPropertyValue('--backdrop-a')` etc. once on mount, and re-reads when the theme changes. Change detection: subscribe to the theme system's own React context if it exposes one (preferred); otherwise a `MutationObserver` on `document.documentElement` watching `data-theme` / `class`. Do **not** poll.
3. **Never swap uniforms abruptly.** The hook exposes *target* colors; `GradientPlane`'s `useFrame` lerps live uniform colors toward targets (`color.lerp(target, 1 - exp(-dt * 5))`, ~600ms settle). Theme switch reads as the backdrop "breathing" into the new palette — this is the single nicest free win of doing colors as uniforms.
4. The T1/T0 CSS fallbacks reference the same vars directly (`background: radial-gradient(... var(--backdrop-b), var(--backdrop-a))`), so themes work identically on every tier with zero extra code.

### Pause/resume

- `frameloop` is controlled: `<Canvas frameloop={running ? 'always' : 'never'}>`.
- `running = tierOK && !documentHidden && !heavyAnimationInProgress && !reducedMotion`.
- `documentHidden` via a tiny `useDocumentVisible()` hook (`visibilitychange`).
- `heavyAnimationInProgress`: the visual layer exposes `perfBus` (a ~20-line module-level pub/sub in `lib/perfBus.ts` — no zustand dependency for this). The boot sequence and any block that mounts a large Framer stagger calls `perfBus.hold('boot')` / `perfBus.release('boot')`. Backdrop subscribes and pauses while any hold is active. This keeps the main thread and GPU clear during the moments users are actually watching text animate.
- `uTime` accumulates from frame deltas, not `clock.elapsedTime`, so pausing never causes a visual jump.
- T2's 30fps throttle: skip every other frame in `useFrame` by accumulating delta and bailing under 1/30s (cheaper than remounting with a different frameloop mode).

---

## 3. CRT overlay — pure CSS, per-theme flags

One `<CrtOverlay />` component rendering fixed, `pointer-events: none`, `aria-hidden` layers above the backdrop and (for scanlines) above the terminal text at very low opacity. All knobs are theme tokens, so **themes toggle effects without any JS**: a theme sets `--fx-scanlines: 0` and the layer is invisible.

| Effect | Implementation | Theme tokens consumed |
|---|---|---|
| Scanlines | `repeating-linear-gradient(transparent 0 2px, var(--fx-scanline-color) 2px 3px)` on a full-viewport layer; opacity = `var(--fx-scanlines)` (0–~0.06). Optional `mix-blend-mode: multiply` on dark themes only. Static — no scroll animation (moving scanlines read as "video artifact," cost repaint, and are an accessibility risk). | `--fx-scanlines`, `--fx-scanline-color` |
| Vignette | `background: radial-gradient(ellipse at center, transparent 60%, var(--fx-vignette-color) 100%)`; opacity = `var(--fx-vignette)` | `--fx-vignette`, `--fx-vignette-color` |
| Flicker | Keyframe animating **opacity only** (compositor-friendly, `will-change: opacity`) on a near-transparent white/phosphor layer: irregular steps, amplitude ≤ 2% opacity, ~8s loop. Gated: `@media (prefers-reduced-motion: reduce) { animation: none }`, and multiplied by `--fx-flicker` (0/1). Amplitude is deliberately tiny — flicker must be subliminal, and must stay far below any photosensitivity threshold (no full-frame flashes, < 3 events/sec). | `--fx-flicker` |
| Text glow | Not an overlay — a utility class/`@layer` rule applied to terminal text: `text-shadow: 0 0 var(--fx-glow-radius, 0px) var(--fx-glow-color, transparent)`. Themes without glow set radius to 0. Applied to the terminal container so it inherits; blocks can opt out with `text-shadow: none` for dense content. | `--fx-glow-radius`, `--fx-glow-color` |
| Screen curvature / RGB shift | **Cut.** Requires WebGL post or SVG filters; both blow the perf budget for a gag. |

Cost check: three static composited layers + one opacity animation ≈ zero main-thread work. Watch one thing: large `text-shadow` blur radii on lots of text is a real paint cost on mobile — cap `--fx-glow-radius` guidance at ~6px and verify in DevTools paint profiling (Phase 4).

---

## 4. Framer Motion variant catalog — `lib/motion.ts`

Motion language rules: **fast, dry, mechanical.** Terminals snap; they don't bounce. Therefore: `ease` curves only (no springs, or springs with `bounce: 0` where interruption-friendliness matters), durations 100–250ms, movement ≤ 8px, staggering top-to-bottom like stdout. Everything respects reduced motion via a single wrapper (below).

All variants exported from `lib/motion.ts` as named constants, plus shared `EASE = [0.16, 1, 0.3, 1]` (easeOutExpo-ish — fast arrival, no overshoot) and `DUR = { fast: 0.12, base: 0.18, slow: 0.25 }`.

| Variant name | Applied to | Behavior & timing |
|---|---|---|
| `blockEnter` | Every command output block (the container) | `opacity 0→1`, `y 6→0`; `duration: DUR.base (0.18s)`, `ease: EASE`. No scale, no blur. |
| `blockLines` | Container variant orchestrating children | `staggerChildren: 0.035`, `delayChildren: 0.04`. For blocks with > 20 lines, cap: stagger only the first 12 children, rest appear with the 12th (helper `capStagger(n)`). |
| `lineEnter` | Each line/row inside a block | `opacity 0→1`, `y 3→0`; `duration: DUR.fast (0.12s)`. At 35ms stagger this reads as machine-fast printing, not a reveal animation. |
| `promptEnter` | New prompt line after a command completes | `opacity 0→1` only, `duration: 0.1s`, no translate — the prompt must feel instantaneous (DoD: interaction → output < 100ms; the block may still be animating but the prompt never waits). |
| `chipsEnter` / `chipEnter` | Next-command chip row / each chip | Row: `staggerChildren: 0.03`, `delayChildren: 0.1` (chips arrive just after content). Chip: `opacity 0→1`, `y 4→0`, `duration: DUR.fast`. |
| `chipTap` | Chip press feedback | `whileTap: { scale: 0.97 }`, `transition: { duration: 0.08 }` — the one place scale is allowed. |
| `bootLine` | Boot sequence lines | `opacity 0→1`, `duration: 0.08s`, stagger driven by the boot script's own timing (owned by `boot-sequence.md`), not by Framer stagger. |
| `caretBlink` | Input caret | **CSS, not Framer**: `animation: caret 1.06s steps(2, jump-none) infinite` toggling opacity 1/0. Hard-cut blink (steps), classic 530ms half-period. Runs forever — a Framer loop here means a JS-driven rerender loop; CSS is free. Pauses (solid caret) while typing via a `:has`/class toggle. |
| `blockExit` (for `clear`) | All blocks on `clear` | `opacity 1→0`, `duration: 0.1s`, no stagger — `clear` should feel like a hard wipe. |
| `themeSwap` | Terminal root on theme change | Nothing on the DOM side — colors transition via a root-level `transition: background-color .4s, color .4s` CSS rule plus the shader lerp (§2). No remount, no flash. |

Reduced motion: one exported hook/util `useMotionSafe()` wrapping `useReducedMotion()`; when reduced, `lib/motion.ts` exports resolve to `{ opacity: 0→1, duration: 0.01 }` equivalents (a `reduce(variant)` helper strips transforms and stagger). Content always appears — motion is the only thing removed. Set globally via `<MotionConfig reducedMotion="user">` in the app shell as a safety net.

---

## 5. Performance budget & lazy-load strategy

### Budget table

| Metric | Budget | Enforced by |
|---|---|---|
| Frame rate, T3 | 60fps sustained; shader GPU time < 2ms/frame | Fullscreen-quad-only design, DPR clamp 1.5, 2–3 octave fbm max |
| Frame rate, T2 | 30fps, DPR 1, 2 octaves | Frame-skip in `useFrame`, `uOctaves` uniform |
| Main-thread JS from backdrop | < 0.5ms/frame (uniform lerp only) | No per-frame React state; all animation in refs/uniforms |
| First-load JS (route, gz) — *without* three.js | ≤ 130KB | three/r3f live only in the dynamic chunk; CI check via `next build` output review |
| Backdrop lazy chunk (three + r3f + fiber code, gz) | ≤ 220KB | Named imports from `three` only; no drei, no postprocessing, no loaders. If audit exceeds budget → escape hatch below |
| Time to first paint impact of backdrop | 0ms | CSS gradient tier renders first for everyone; canvas loads post-boot on `requestIdleCallback` |
| Interaction → first output | < 100ms (DoD) | `promptEnter` at 0.1s opacity-only; `perfBus.hold` pauses shader during heavy staggers |
| CLS from canvas mount | 0 | Canvas is `position: fixed` behind everything; cross-fade opacity only |
| Memory | 1 geometry, 1 material, 0 textures | Design; verify no context loss handling gaps (`webglcontextlost` → fall to T1) |
| Lighthouse mobile perf | ≥ 85 (DoD) | All of the above; measured in Phase 4 |

**Escape hatch (decide at Phase 2 audit):** the backdrop needs ~1% of three.js. If the lazy chunk audit exceeds budget or Lighthouse suffers, rewrite `BackdropCanvas` as ~120 lines of raw WebGL (`canvas.getContext('webgl')`, compile two shaders, one triangle, rAF loop) — identical visuals, ~3KB. Keep R3F if and only if the whoami moment (§6) or another 3D use ships in v1; otherwise raw WebGL is strictly better here. The `<Backdrop />` interface hides this decision from the rest of the app.

### Tier detection — `lib/gpuTier.ts`

Synchronous, cheap heuristics (no `detect-gpu` library — it's ~50KB + a network fetch of benchmark data):

1. `prefers-reduced-motion: reduce` → **T0**. (Also live-watched — flipping the OS setting downgrades immediately.)
2. No WebGL context creatable → **T1**.
3. `navigator.connection?.saveData` → **T1**.
4. `WEBGL_debug_renderer_info` renderer string matches `/swiftshader|software|llvmpipe/i` → **T1**.
5. `navigator.deviceMemory ≤ 4` or `hardwareConcurrency ≤ 4` → cap at **T2**.
6. Otherwise **T3**.
7. **Runtime demotion probe:** for the first 60 frames after canvas mount, track average frame delta; if > 24ms (i.e., can't hold ~40fps), demote one tier (T3→T2 re-tunes DPR/octaves in place; T2→T1 unmounts the canvas). Persist the result in `sessionStorage` (`yc:gpuTier`) so back/forward navigation doesn't re-probe or re-flash tiers.

### Lazy-load / boot sequencing

1. **SSR/first paint:** app shell renders `CssBackdrop` (T0/T1 visual — static gradient from theme vars) + `CrtOverlay`. Zero JS cost, no flash of black.
2. **Boot sequence plays** (≤ 2.5s per DoD). During boot, `perfBus.hold('boot')` is active — even if the canvas were ready, it wouldn't animate.
3. **After boot completes** (or is skipped), on `requestIdleCallback` (timeout 2s fallback): if tier ≥ T2, `next/dynamic` import of `BackdropCanvas` begins. This guarantees three.js never competes with boot typing or first input.
4. Canvas mounts at `opacity: 0`, first frame renders, then cross-fades over 800ms above the CSS gradient. If the chunk fails to load (offline, error boundary), the CSS gradient simply stays — failure is invisible.
5. `visibilitychange` → `frameloop='never'`; `webglcontextlost` → permanent fall to T1 for the session.

---

## 6. Verdict: the whoami 3D moment

**Defer the 3D object; ship an ASCII-art portrait moment instead for v1.**

Reasoning:

- **Concept fit:** "a terminal with 3D accents, not a 3D site" — the backdrop *is* the 3D accent. A rotating head inside a block is the moment the site tips toward tech-demo. An ASCII portrait (pre-generated ASCII art of Yavor, revealed line-by-line with `blockLines` stagger, with theme glow applied) is *more* on-concept, has zero bundle cost, works on every tier including T0, and is the kind of detail people screenshot.
- **Cost:** a second Canvas (or view portal into the main one) + a model asset (GLTF/draco decoder) + ASCII/toon shading pass ≈ +100–200KB and real complexity for one command. It also forces keeping full R3F, closing the §5 escape hatch.
- **Risk:** a 3D head that looks 90% right looks 100% wrong. Asset production (getting a good scan/model of an actual person) is the kind of task that eats a week in "polish."

**Revisit trigger for v1.5:** if, post-launch, R3F is still in the bundle (escape hatch not taken) and there's appetite, add an *abstract* moment — a slow-rotating wireframe icosahedron or point-cloud "signal" in theme accent color, ~40 lines of code, no assets — rendered in a small viewport inside `whoami` via drei `View` or a second tiny canvas that mounts only while the block is on screen and unmounts on scroll-away/`clear`. An actual head stays out of scope until there's a great model.

The plan reserves the seam: `components/background/` exports nothing block-specific, but `whoami`'s block can later import a `<Moment3D>` from a new `components/moments/` folder without touching the backdrop.

---

## 7. File list & responsibilities

```
components/background/
  Backdrop.tsx            Tier switch + orchestration. Renders CssBackdrop always;
                          lazy-mounts BackdropCanvas (dynamic, ssr:false) post-boot
                          when tier ≥ T2. Owns cross-fade and demotion handling.
  CssBackdrop.tsx         T0/T1 visual. Static layered gradient from --backdrop-* vars;
                          adds the drifting-blob keyframe animation only for T1
                          (guarded by prefers-reduced-motion).
  BackdropCanvas.tsx      The R3F <Canvas> wrapper: gl flags, dpr, frameloop control
                          wired to useDocumentVisible + perfBus + tier. The only file
                          importing @react-three/fiber. (Escape-hatch rewrite target.)
  GradientPlane.tsx       Clip-space triangle mesh + ShaderMaterial; useFrame: time
                          accumulation, 30fps skip for T2, uniform color lerp toward
                          targets from useThemeBackdrop.
  CrtOverlay.tsx          Scanlines + vignette + flicker layers, aria-hidden,
                          pointer-events-none; all knobs read from --fx-* vars.
  shaders/gradient.ts     Exported vertex/fragment GLSL template strings (fbm, domain
                          warp, dither). No build plugins.

lib/
  motion.ts               The full variant catalog (§4), EASE/DUR constants,
                          capStagger(), reduce() helper, useMotionSafe().
  gpuTier.ts              getGpuTier(): heuristics + sessionStorage cache;
                          useGpuTier(): React hook incl. runtime demotion probe and
                          live reduced-motion watching.
  perfBus.ts              Tiny hold/release pub-sub: perfBus.hold(key)/release(key)/
                          subscribe(cb). Used by boot + heavy blocks to pause the shader.
  useThemeBackdrop.ts     Resolves --backdrop-* CSS vars to color values; re-resolves
                          on theme change (theme context if available, else
                          MutationObserver on html[data-theme]).
  useDocumentVisible.ts   visibilitychange hook.

styles/ (or within globals.css @layer)
  crt.css                 Keyframes (caret blink, flicker, T1 blob drift) + glow
                          utility class. Kept in CSS so infinite animations never
                          touch JS.
```

Consumed theme-token contract (to hand to `theme-system.md`): `--backdrop-a/b/c` (hex), `--backdrop-intensity`, `--backdrop-speed`, `--fx-scanlines`, `--fx-scanline-color`, `--fx-vignette`, `--fx-vignette-color`, `--fx-flicker`, `--fx-glow-radius`, `--fx-glow-color`.

### Implementation order

1. `lib/motion.ts` + caret CSS — unblocks terminal-engine and block work immediately (Phase 1).
2. `CssBackdrop` + `CrtOverlay` + token contract agreed with theme system — site looks "done enough" with zero WebGL (Phase 2 start).
3. `gpuTier.ts` + `perfBus.ts` + `useThemeBackdrop.ts`.
4. `BackdropCanvas` + `GradientPlane` + shader; cross-fade; pause wiring.
5. Bundle + Lighthouse audit → escape-hatch decision (raw WebGL vs. keep R3F).
6. Phase 4 polish: paint profiling of glow, runtime demotion tuning on a real low-end Android.

---

## 8. Open questions

1. **Theme token color format** — need agreement with `theme-system.md` that `--backdrop-*` resolve to `#hex` (safest for `THREE.Color` and CSS both). Blocking for §2 step 1.
2. **Does the theme system expose a React context/event on switch,** or should the visual layer own the `MutationObserver` fallback? (Prefer context — cleaner and needed anyway for `themeSwap`.)
3. **Per-theme shader variants** (e.g., grid horizon for a synthwave theme) — the uniform contract supports swapping fragment shaders per theme later; is that wanted for v1's "≥3 complete themes" or is palette variation enough? (Plan assumes palette-only for v1.)
4. **`theme fx off` user command** — should users be able to force T0 via a command (nice a11y/battery story, trivial to add via the tier store)? Needs a decision with the terminal-engine command registry.
5. **Escape hatch default** — if the whoami 3D moment is officially deferred (per §6 verdict), should we pre-commit to raw WebGL for the backdrop and skip R3F entirely in v1? Saves ~200KB but deviates from the "locked stack" wording; needs Yavor's call at the Phase 2 audit.
6. **Light-theme CRT** — scanlines/glow read poorly on light backgrounds; recommendation is light themes ship with `--fx-scanlines: 0`, glow radius 0. Confirm with theme design.
