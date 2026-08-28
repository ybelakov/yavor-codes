# Implementation Plan — Terminal Core Engine (yavor.codes)

Scope: shell architecture, state model, input line, parser, command registry, output block lifecycle, chip dispatch, scroll management. Explicitly excluded: boot sequence content, themes, individual block content, R3F, mobile layout specifics, deployment.

---

## 1. Architecture Overview & Key Decisions

### 1.1 Mental model

The terminal is a **unidirectional pipeline** with exactly one entry point:

```
raw input string ──▶ runCommand(input, source)
                        │  tokenize (parser)
                        │  resolve (registry: name → aliases → fuzzy suggest)
                        │  validate args (zod schema)
                        │  execute command → CommandResult
                        ▼
                    store action: appendEntry(HistoryEntry)
                        ▼
                OutputLog renders entries → block components animate in → auto-scroll
```

Typed input, clicked chips, the boot sequence, and the future AI agent are all just callers of `runCommand(input, source)`. Nothing else may append output. This single-pipe rule is the load-bearing decision that makes v2 (agent-as-caller) trivial.

### 1.2 Key decisions & tradeoffs

**State: zustand (vanilla store + React bindings) — recommended over useReducer.**

- *useReducer + Context*: zero deps, but every keystroke in the input would re-render the whole log unless you split contexts; and dispatch is trapped inside React — boot orchestration, chips outside the terminal subtree, and especially the v2 agent (which lives in an API/stream handler) would need refs threaded around.
- *zustand*: `createStore` gives a module-level store; `runCommand` can be a plain function in `lib/` that imports the store and is callable from anywhere (chip onClick, boot effect, agent tool executor, even devtools console). Selector-based subscriptions mean the input line re-renders on keystrokes while the log only re-renders on `entries` changes. ~1 kB. **Recommendation: zustand.** Internally the store still uses reducer-style named actions so state transitions stay auditable.

**Output blocks are serializable descriptors, not React elements.**
`HistoryEntry` stores `{ blockType: string, props: JSON }`, and a `blockRegistry` maps `blockType → React component`. Tradeoff: slightly more indirection than `run() => <JumaBlock/>`, but: (a) state stays serializable → sessionStorage persistence, replay, and agent-side reasoning about "what's on screen" all become possible; (b) it decouples the engine (this plan) from block content (other agents' scope) with a one-string contract; (c) React elements in a store are a footgun with HMR and devtools.

**Commands are declarative objects, not classes.** A `defineCommand()` helper gives type inference for the args schema (zod). Zod is the args-schema language because `zod-to-json-schema` turns the registry into agent tool definitions in v2 for free.

**Custom input rendering with a hidden `<input>`.** A real (visually hidden) `<input>` owns keyboard, IME, paste, and mobile keyboards; a styled mirror renders the text + block caret. Tradeoff vs. `contentEditable` or fully synthetic key handling: the hidden input keeps accessibility, autofill suppression, and composition events sane with ~zero cost. (No xterm.js per project constraints.)

**Scroll: pinned-to-bottom model** (like real terminals / chat UIs): auto-scroll only when the user is at (or near) the bottom, always scroll on the user's own submissions.

**No virtualization in v1.** Scrollback is capped (`MAX_ENTRIES ≈ 100`) instead. Rich animated blocks make react-window-style virtualization painful and unnecessary at this scale.

---

## 2. File List

### `components/terminal/`

| File | Responsibility / key exports |
|---|---|
| `Terminal.tsx` | Top-level shell (client component). Composes `OutputLog` + `PromptLine` + `CommandChips`. Owns click-anywhere-to-focus (via `useTerminalFocus`), the scroll container ref, and global key routing (e.g. `Ctrl+L` → clear). Export: `Terminal({ initialCommands?: string[] })` — `initialCommands` is the hook the boot-sequence agent uses. |
| `OutputLog.tsx` | Subscribes to `entries` via selector. Maps entries → `<OutputBlock entry={e} key={e.id}/>` inside Framer Motion's `AnimatePresence`. Renders the bottom scroll sentinel. Export: `OutputLog()`. |
| `OutputBlock.tsx` | One log entry: echoed prompt line (`❯ juma`) + resolved block component from `blockRegistry`, wrapped in `motion.div` (enter animation; calls `onLayoutMeasured`/`onAnimationComplete` so auto-scroll can re-stick as tall blocks expand). Export: `OutputBlock({ entry: HistoryEntry })`. Wrap block render in an `ErrorBoundary` so a broken block can't kill the shell. |
| `PromptLine.tsx` | The live input row: prompt glyph, hidden `<input>`, mirrored text, `<Caret/>`, ghost-text completion hint. Handles `Enter` (submit → `runCommand`), `ArrowUp/Down` (history), `Tab` (completion), `Escape` (reset completion/draft), composition events. Export: `PromptLine()`. |
| `Caret.tsx` | Block caret positioned after mirrored text; blink via CSS/Framer; solid while typing (reset blink timer on keydown); hollow when input not focused. Export: `Caret({ focused, index })`. |
| `CommandChips.tsx` | Renders chip row from `getChipCommands()` (registry entries not marked `hidden`, plus optional per-block contextual chips later). Each chip's `onClick` → `runCommand(cmd.name, 'chip')`. Also exports `Chip({ label, command, variant })` so content blocks can embed inline chips ("did you mean", cross-links) using the exact same dispatch path. |
| `useTerminalFocus.ts` | Hook: `mousedown` on shell → focus hidden input, **unless** (a) `window.getSelection()` is non-collapsed (user is selecting text), (b) target is interactive (`a, button, input, [data-no-focus]`). Refocus on `visibilitychange`. On touch devices, never auto-focus on mount (don't pop the keyboard); only focus on explicit prompt-area tap. Exports `{ inputRef, focusInput, isFocused }`. |
| `useAutoScroll.ts` | Hook over the scroll container: tracks `isPinned` (distance-from-bottom < ~48px, updated on scroll), exposes `scrollToBottom(behavior)`, effect that re-sticks on `entries.length` change and on block `onAnimationComplete`, honoring the rules in §5/§7. Uses `overflow-anchor: none` + manual control for determinism. |
| `useCommandHistory.ts` | Thin hook binding ArrowUp/Down to store's `historyPrev/ historyNext` and draft preservation (see §4). |
| `index.ts` | Barrel export of `Terminal`. |

### `lib/terminal/`

| File | Responsibility / key exports |
|---|---|
| `types.ts` | All core types (§3). No runtime code. |
| `store.ts` | Zustand vanilla store + React hook. Exports `terminalStore`, `useTerminal(selector)`, and named action functions (`appendEntry`, `clearEntries`, `setInput`, `historyPrev`, `historyNext`, `cycleCompletion`, `resetCompletion`, `setCwd`). Actions are plain functions calling `terminalStore.setState` — callable outside React. |
| `parser.ts` | Pure. `tokenize(raw: string): ParsedInput` — splits on whitespace with double-quote support, separates `--flags`/`-f` into a flags map, lowercases the command token. No command knowledge. |
| `registry.ts` | `defineCommand<S extends ZodTypeAny>(cmd: CommandDef<S>): Command` (identity + type inference); `registerCommands(cmds: Command[])`; `resolveCommand(token: string): Command | undefined` (name, then aliases, via a prebuilt lookup map); `getAllCommands()`, `getChipCommands()`, `getCompletions(prefix: string): string[]`. |
| `fuzzy.ts` | Pure. `levenshtein(a, b): number`; `suggest(token: string, candidates: string[]): string[]` — threshold `distance <= max(1, floor(len/3))`, also prefix/substring matches, ranked, max 3. Used by "did you mean" and reusable by v2 agent for tool-name repair. |
| `run.ts` | **The pipeline.** `runCommand(raw: string, source: InputSource): Promise<HistoryEntry>` — trims; echoes even empty submits as a bare prompt entry; tokenize → resolve → on miss append `unknown-command` entry with `suggestions` (rendered by the error block as clickable chips) → validate via `argsSchema.safeParse` → on fail append `usage-error` entry → call `command.run(ctx)` → map `CommandResult` to entry → `appendEntry` + push to `inputHistory` (typed/chip only). Also `runScript(lines: string[], opts?: { typewriter?: boolean })` for boot: sequentially awaits each command (optionally animating the input value char-by-char before submit so boot looks typed). |
| `blockRegistry.ts` | `registerBlock(type: string, component: ComponentType<any>)`; `getBlock(type): ComponentType | FallbackBlock`. Engine registers built-ins: `system-text`, `error`, `unknown-command`, `help-list`. Content agents register the rest (`juma`, `neofetch`, …) at module scope in their block files. |
| `commands/index.ts` | Imports and `registerCommands([...])` all v1 command definitions. Engine owns the *definitions* of shell-behavior commands here: `help`, `clear`, `theme` (delegates to theme system's setter), `ls`/`cd` easter-egg handlers (virtual one-level FS over content sections); content agents own `whoami`, `juma`, `aief`, `sf`, `posts`, `history`, `neofetch`, `contact` in sibling files (`commands/content.ts`) that this index imports. Side-effect import from `Terminal.tsx` guarantees registration before first render. |
| `agent-tools.ts` *(v2 stub, documented now)* | `getToolDefinitions()` — maps `getAllCommands()` → `{ name, description, input_schema: zodToJsonSchema(argsSchema) }`; `executeTool(name, args)` → formats args back to an input string → `runCommand(str, 'agent')`. Not built in v1; the registry shape above is what makes it a ~40-line file later. |
| `ids.ts` | `nextEntryId(): string` — monotonic counter + session prefix (avoids key collisions on rapid submits; no nanoid dep needed). |

---

## 3. Core TypeScript Shapes

```ts
// lib/terminal/types.ts

export type InputSource = 'typed' | 'chip' | 'boot' | 'agent';

export interface ParsedInput {
  raw: string;
  command: string;            // first token, lowercased
  args: string[];             // positional, quotes resolved
  flags: Record<string, string | boolean>;
}

// ---- Command registry (agent-tool-ready) ----
export interface CommandContext<A = unknown> {
  parsed: ParsedInput;
  args: A;                    // zod-validated output of argsSchema
  source: InputSource;
  cwd: string;
  shell: ShellApi;            // capabilities commands may use
}

export interface ShellApi {
  clear(): void;
  run(input: string, source?: InputSource): Promise<HistoryEntry>; // e.g. `cd juma` → runs `juma`
  setCwd(path: string): void;
  setTheme(name: string): void;   // implemented by theme subsystem; typed here
}

export type CommandResult =
  | { kind: 'block'; blockType: string; props?: Record<string, unknown> }
  | { kind: 'text'; text: string; tone?: 'default' | 'error' | 'muted' }  // sugar → system-text block
  | { kind: 'none' };                                                     // e.g. clear

export interface Command<S extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  aliases?: string[];
  description: string;              // shown in `help`, reused as agent tool description
  usage?: string;                   // e.g. "theme [name]"
  argsSchema?: S;                   // parsed positional/flags mapped in, zod-validated
  hidden?: boolean;                 // exclude from help / chips / completion (easter eggs)
  chip?: { label?: string; order?: number } | false;  // chip presentation; false = no chip
  run: (ctx: CommandContext<z.infer<S>>) => CommandResult | Promise<CommandResult>;
}

// ---- History / log ----
export type EntryStatus = 'ok' | 'error' | 'unknown-command' | 'usage-error';

export interface HistoryEntry {
  id: string;
  input: string | null;         // echoed prompt line; null = system-emitted (boot banner)
  source: InputSource;
  status: EntryStatus;
  block: { type: string; props?: Record<string, unknown> } | null; // null = echo-only (empty Enter)
  ts: number;
}

// ---- Store ----
export interface TerminalState {
  entries: HistoryEntry[];          // capped at MAX_ENTRIES
  inputHistory: string[];           // typed/chip lines only, most recent last, de-duped consecutively
  historyCursor: number | null;     // null = live line; else index into inputHistory
  draft: string;                    // stashed live line while browsing history
  inputValue: string;               // controlled hidden-input value
  completion: { candidates: string[]; index: number; base: string } | null;
  cwd: string;                      // '/', '/juma', … for ls/cd easter eggs
  isRunningScript: boolean;         // boot lock: PromptLine read-only while true
}

// Reducer-style action surface (implemented as named zustand actions)
export type TerminalAction =
  | { type: 'APPEND_ENTRY'; entry: HistoryEntry }
  | { type: 'CLEAR' }
  | { type: 'SET_INPUT'; value: string }
  | { type: 'PUSH_INPUT_HISTORY'; line: string }
  | { type: 'HISTORY_PREV' } | { type: 'HISTORY_NEXT' }
  | { type: 'COMPLETION_CYCLE'; direction: 1 | -1 }
  | { type: 'COMPLETION_RESET' }
  | { type: 'SET_CWD'; path: string }
  | { type: 'SET_SCRIPT_RUNNING'; value: boolean };
```

Notes:
- `argsSchema` maps from `ParsedInput` via a small adapter in `run.ts`: positional args fill schema fields in declaration order for object schemas, or the whole `args` array for array schemas; flags merge by key. Keep v1 schemas trivial (`theme` takes one optional enum, everything else takes nothing).
- `help` is implemented generically: `run: () => ({ kind: 'block', blockType: 'help-list', props: { commands: getAllCommands().filter(c => !c.hidden).map(pick(['name','description','usage'])) } })`.
- `clear` returns `{ kind: 'none' }` after calling `ctx.shell.clear()`.

---

## 4. Input Line Behavior (spec)

- **Submit (Enter):** freeze current line → `runCommand(value, 'typed')` → reset `inputValue`, `historyCursor = null`, `completion = null`. Empty Enter still appends an echo-only entry (real-terminal feel) but is *not* pushed to `inputHistory`.
- **Arrow history:** ArrowUp on live line stashes `draft`, sets cursor to last history item; further Up/Down walk the array; Down past the newest restores `draft` and returns cursor to `null`. Consecutive duplicate lines are not double-pushed. Any character edit while browsing detaches (cursor → null, edited text becomes live).
- **Tab completion:** on first Tab, `getCompletions(currentToken)` from registry names + non-hidden aliases (plus theme names when line starts with `theme `); single hit → complete + trailing space; multiple → complete to longest common prefix and store cycle state; repeated Tab cycles candidates (Shift+Tab reverses). Any other key resets `completion`. A muted ghost-text hint of the top candidate renders after the caret.
- **IME/composition:** ignore Enter/Arrow handling while `isComposing`.
- **Paste:** multi-line paste keeps only the first line in the input; (open question §9 whether remaining lines auto-run).

---

## 5. Programmatic Dispatch — one pipeline for chips, boot, agent

Every producer funnels into `runCommand`:

| Producer | Call | Notes |
|---|---|---|
| Typed input | `runCommand(value, 'typed')` from `PromptLine` on Enter | |
| Chips | `runCommand(cmd.name, 'chip')` from `Chip` onClick | Entry echoes the prompt line identically to typing — chips are indistinguishable in the log. Chip clicks push to `inputHistory` so ArrowUp works after tapping (mobile parity). |
| Boot | `Terminal` mounts → `runScript(initialCommands, { typewriter: true })` | Sets `isRunningScript` (input read-only, chips disabled); optional typewriter fills `inputValue` before each submit so boot *looks* typed. Boot-sequence agent only supplies the `string[]`. |
| "Did you mean" | unknown-command block renders `<Chip command={suggestion}/>` | Same chip path. |
| `cd juma` easter egg | command's `ctx.shell.run('juma')` | Shell API reuses the pipeline; no bespoke append. |
| v2 agent | `executeTool(name, args)` → format → `runCommand(str, 'agent')` | Agent output appears as first-class log entries; `source: 'agent'` lets the UI badge them differently later. `runCommand` returns the `HistoryEntry` so the agent can read back `status` + `block` as its tool result. |

Because `runCommand` and the store live in `lib/` (not inside components), all of these work without React context plumbing — the deciding argument for zustand in §1.

---

## 6. Output Lifecycle & Scroll Management

1. `appendEntry` pushes to `entries`, trimming to `MAX_ENTRIES` from the front (oldest entries get a lightweight "— scrollback trimmed —" divider entry once, so disappearance isn't mysterious).
2. `OutputBlock` mounts inside `AnimatePresence` with a short enter animation (opacity/translate; blocks may internally stagger — engine only guarantees the wrapper).
3. **Scroll rules** (in `useAutoScroll`):
   - On append where `source ∈ {typed, chip}` and it's the user's own action → always `scrollToBottom('smooth')` and set `isPinned = true`.
   - On append while `isPinned` (boot lines, async follow-ups) → scroll to bottom.
   - While an entry's height animates (tall blocks, images, R3F canvases lazy-sizing), `OutputBlock` fires `onAnimationComplete` / uses a `ResizeObserver` → if `isPinned`, re-stick. This is the fix for "block grew after we scrolled".
   - User scrolls up beyond threshold → `isPinned = false`; new output does **not** yank them down (a subtle "▼ new output" affordance can be a later nicety).
   - `overflow-anchor: none` on the container to keep behavior deterministic across browsers.
4. **Clear semantics:** `CLEAR` empties `entries` only. `inputHistory`, `cwd`, theme, and the prompt survive (matching real terminals: `clear` ≠ `reset`). Clearing bypasses exit animations (instant wipe) to avoid a 30-block AnimatePresence exit storm — render the log with a `resetKey` that increments on clear so React unmounts the whole list in one commit.

---

## 7. Edge Cases

- **Rapid input / Enter mashing:** `runCommand` is synchronous up to `appendEntry` for sync commands, so ordering is guaranteed by call order; monotonic `ids.ts` counter prevents key collisions within one tick. Async commands append their entry immediately with the block in a self-managed loading state (block's concern), so log order always matches submit order. During `runScript`, the input is locked (`isRunningScript`) to prevent interleaving with boot.
- **Very long output:** entry cap (§6.1); additionally each block wrapper gets `max-height` + internal scroll only if a specific block opts in (engine default: no clipping). Framer layout animations are kept off the log container (`layout` only on blocks that need it) to avoid O(n) layout thrash on append.
- **Focus loss:** covered by `useTerminalFocus` — text selection and interactive elements never get focus-stolen; window refocus/visibility returns focus to input on desktop; mobile never auto-focuses (chips are the primary input there). Caret renders hollow when unfocused so state is visible.
- **Clear during animation:** `resetKey` wipe (§6.4) avoids orphaned exit animations; any in-flight async command that resolves after a clear still appends (acceptable — matches terminals where a backgrounded job prints after `clear`), unless we decide to drop entries whose `ts < lastClearTs` (open question).
- **Unknown input:** never a dead end — `unknown-command` block always offers `help` chip plus up to 3 fuzzy suggestions as chips.
- **SSR/hydration:** `Terminal` is a client component; `entries` start empty on server and client alike, boot script runs in a mount effect — no hydration mismatch. Timestamps are generated post-mount only.
- **Selection & copy:** echoed prompt lines and text blocks remain real selectable text; chips are `<button>`s (keyboard-focusable, `Enter`-activatable) for a11y.
- **Reduced motion:** engine reads `prefers-reduced-motion` once and passes a `motionOk` flag down; enter animations collapse to opacity-only, typewriter boot degrades to instant.

---

## 8. Suggested Implementation Order

1. `types.ts`, `ids.ts`, `store.ts` (state + actions, unit-testable without DOM).
2. `parser.ts`, `fuzzy.ts` (pure, test-first: quotes, flags, suggestion thresholds).
3. `registry.ts` + `blockRegistry.ts` + built-in blocks (`system-text`, `error`, `unknown-command`, `help-list`).
4. `run.ts` pipeline + `commands/index.ts` with `help`, `clear`, and one stub content command.
5. `Terminal.tsx` + `OutputLog` + `OutputBlock` + `PromptLine` + `Caret` (static, no polish).
6. `useTerminalFocus`, `useCommandHistory`, tab completion, `useAutoScroll`.
7. `CommandChips` + chip dispatch; `runScript` boot hook (`initialCommands` prop) for the boot-sequence agent to consume.
8. `ls`/`cd` easter eggs (`cwd` + virtual section map), `theme` delegation stub.

## 9. Open Questions

1. **Deep links:** should `?cmd=juma` (or `/juma` rewrites) run a command on load? Trivial via `runScript`, but interacts with boot ordering — needs a product call.
2. **Persistence:** persist `inputHistory` (and/or `entries`) to `sessionStorage` across reloads? Cheap since state is serializable; default proposal: persist `inputHistory` only.
3. **Multi-line paste:** run subsequent lines as a script, or truncate to first line? Proposal: truncate in v1.
4. **Post-clear async output:** drop entries resolved after a `clear` (compare `ts` to `lastClearTs`) or allow them? Proposal: allow (terminal-authentic).
5. **`theme` ownership boundary:** engine defines the command + completion of theme names; theme subsystem provides `setTheme` + the names list — confirm the import direction with the themes agent (engine imports a `themeApi`, not vice versa).
6. **Contextual chips:** should blocks be able to push a contextual chip row (e.g. after `juma`, chips for `aief`, `contact`)? The `Chip` export supports inline chips already; a shared "suggested next" rail is a v1.1 candidate.
