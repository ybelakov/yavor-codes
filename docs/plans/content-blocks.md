# yavor.codes — Rich Content Blocks, Content Schemas & Easter Eggs
## Implementation Plan (v1)

**Scope:** every command output block, the `content/*.json` schemas, the `scripts/build-posts.ts` pipeline, easter eggs, and the site's voice. Terminal engine, themes, boot sequence, and deployment are owned by other plans; this plan only assumes the engine gives each block: (a) a mount point in the scrollback, (b) a `runCommand(cmd: string)` callback for chips, and (c) a "reduced motion" flag.

Dataset note (verified): the LinkedIn export has 100 posts; stats include `support` in addition to the listed reactions; `post_type` is `regular` | `repost`; media URLs are expiring `licdn.com` links (matters for the build script).

---

## 0. Shared Block Conventions

Every block follows the same contract so the terminal engine can treat them uniformly:

```ts
// components/blocks/types.ts (shape only — engine plan owns the registry)
interface BlockProps {
  onRunCommand: (cmd: string) => void;
  reducedMotion: boolean;
}
```

**Shared sub-components** (in `components/blocks/shared/`):

| Component | Responsibility |
|---|---|
| `ChipRow.tsx` | Renders the trailing "next command" chips. Each chip looks like an inline command: `[ juma → ]`. Click calls `onRunCommand`. Staggered fade-in after block finishes animating. Keyboard focusable. |
| `SectionHeader.tsx` | Dim comment-style header inside blocks: `# ── products ──────────`. |
| `StatPill.tsx` | Small monospace stat: `▲ 512  💬 41  ⟳ 12`. Used by posts + aief. |
| `TypeLine.tsx` | One line of "typed" text (character reveal via Framer Motion staggered spans; instant render when `reducedMotion`). Used by history, neofetch, easter eggs. |
| `AsciiFrame.tsx` | Box-drawing border wrapper (`┌─┐│└┘`) rendered as CSS border on desktop, degrades to simple rule lines under 400px so wrapping never breaks the frame. |

**Animation defaults (all blocks):** container fades/slides up 8px over 150ms; internal content staggers in top-to-bottom; chips appear last (+200ms). All durations *skip* entirely under `prefers-reduced-motion`. No animation should delay interactivity beyond ~1.2s total per block.

**Content loading:** each block imports its JSON statically (`import profile from '@/content/profile.json'`) — build-time bundling, no fetch, fully typed via a `content/types.ts` file of interfaces matching the schemas below. Copy edits = JSON edits only.

---

## 1. Per-Command Specs

### 1.1 `help` — command index

```
┌ yavor.codes — available commands ──────────────────┐
│                                                    │
│  whoami     who is this guy                        │
│  juma       what I'm building now                  │
│  aief       the AI community I run in Sofia        │
│  sf         the San Francisco chapter              │
│  posts      greatest hits from LinkedIn            │
│  history    career log, oldest first               │
│  neofetch   me, as a system spec                   │
│  contact    say hi                                 │
│  clear      wipe the screen                        │
│                                                    │
│  psst: this terminal has secrets. try things.      │
└────────────────────────────────────────────────────┘
  [ whoami → ]  [ neofetch → ]  [ posts → ]
```

- **Content fields:** `commands[] { name, blurb, hidden? }` + `hint` line — lives in `content/profile.json` under `help` (avoids file sprawl).
- **Layout:** two-column definition list; command names in accent color and clickable (same behavior as chips). The `hidden` flag exists so easter eggs are registered but never listed.
- **Animation:** rows cascade in at 40ms stagger, like `ls` output printing. The "psst" line appears last with a slight delay and dimmer color.
- **Chips:** `whoami`, `neofetch`, `posts`.

### 1.2 `whoami` — intro card

```
┌────────────────────────────────────────────────────┐
│  ┌──────┐   Yavor Belakov                          │
│  │ AVATAR│  Co-founder @ Juma · Founder @ AIE.F    │
│  │  96px │  Europe · AI product builder            │
│  └──────┘                                          │
│                                                    │
│  > Building Cursor for Marketers. Ran an AI        │
│  > community past its 50th meetup. Ships fast,     │
│  > posts about it.     [TODO: Yavor to approve/    │
│    rewrite one-liner]                              │
│                                                    │
│  in  linkedin.com/in/yavor-belakov                 │
│  gh  github.com/[TODO]                             │
│  x   x.com/[TODO]                                  │
│  ✉   yavor@team-gpt.com                            │
└────────────────────────────────────────────────────┘
  [ juma → ]  [ aief → ]  [ history → ]
```

- **Content fields:** from `content/profile.json`: `name`, `headline`, `bio` (2–3 sentence blockquote, `>`-prefixed lines), `avatar` (path in `/public`), `location`, `socials[] { id, label, url }`.
- **Animation:** avatar scales from 0.9 with a subtle scanline sweep (skippable); headline types in; bio lines fade sequentially; social rows slide in from left.
- **Chips:** `juma`, `aief`, `history`.

### 1.3 `juma` — product showcase

```
$ juma --status

  ▐ JUMA ▌  jumalabs
  AI workspace built for marketers. By marketers.

  ● jumeet     Google Meet AI notetaker — joins your
               calls, writes the notes you won't.
  ● [TODO: other Juma modules/products, if any]

  status: shipping          → juma.[TODO domain]
  stage:  [TODO: users/ARR/launch metric Yavor wants public]

  "Announcing Juma — AI workspace built especially
   for marketers." — the launch post, Nov 2025

  [ posts → ]  [ history → ]  [ contact → ]
```

- **Content fields:** `content/juma.json`: `name`, `org` ("jumalabs"), `tagline`, `description`, `products[] { id, name, oneLiner, url?, status }`, `metrics[] { label, value, public: boolean }` (renderer only shows `public: true`), `links[] { label, url }`, `pullQuote { text, source, url }` (can link to the launch LinkedIn post — real URL exists in the dataset).
- **Layout:** faux `--status` invocation echo, wordmark banner, product list with pulsing status dots (`●` in green for "shipping"), stat lines, closing pull-quote.
- **Animation:** status dot pulses (2s loop, CSS only, cheap); product rows cascade; metric values count up from 0 via Framer Motion `animate` (skipped under reduced motion).
- **Chips:** `posts` (the launch post is in the top posts), `history`, `contact`.

### 1.4 `aief` — community story

```
$ aief

  AIE.F EUROPE — Sofia, Bulgaria
  After Hours: an AI meetup that refused to stop.

  ┌─ photo strip ────────────────────────────────┐
  │ [img] [img] [img] [img] [img]   ← scrollable │
  └──────────────────────────────────────────────┘

  events run      52+        ← counts up
  frequency       ~weekly
  home turf       Sofia (Barter Hub, Work&Share…)
  [TODO: attendee count / community size]

  latest chapter:
  · After Hours #52 — Feb 25 — Work&Share
  · After Hours #51 — Feb 18 — Barter Community Hub
  · After Hours #50 — Feb 11 — Work&Share  ★ the 50th

  want to speak at one? → contact

  [ contact → ]  [ posts → ]  [ sf → ]
```

- **Content fields:** `content/aief.json`: `name`, `tagline`, `story` (short paragraph, TODO placeholder for origin story), `stats[] { label, value, animated? }`, `photos[] { src, alt, caption? }`, `recentEvents[] { title, date, venue, url?, highlight? }`, `speakerCta { text, command }`.
- **Photo strip:** horizontal scroll-snap row of 5–8 images (real event photos, TODO: Yavor to drop files into `/public/aief/`), lazy-loaded `next/image`, each with a 1px terminal-accent border and slight CRT-curve hover tilt. If `photos` is empty, the strip row is omitted entirely (block must not break pre-content).
- **Animation:** counter for "events run" ticks from 0 → 52; event log lines print bottom-up like a tail of a log; ★ on the #50 line gets a single glint.
- **Chips:** `contact`, `posts`, `sf`.

### 1.5 `sf` — San Francisco connection

```
$ sf

     ~ ~ ~ 🌁 ~ ~ ~        ← minimal ASCII bridge/fog art
  ═══╬═════════╬═══

  SOFIA ✈ SAN FRANCISCO

  [TODO: the actual SF story — what took Yavor there,
  when, what happened, what stuck. Schema supports
  2–4 short "log entry" paragraphs.]

  · [TODO: entry 1 — e.g. first trip / program / launch]
  · [TODO: entry 2]

  timezone math: SF is -10h from Sofia.
  I've learned to schedule accordingly.
  [TODO: approve this closing line]

  [ history → ]  [ juma → ]  [ whoami → ]
```

- **Content fields:** `content/sf.json`: `title`, `ascii[]` (lines of the bridge art, stored in JSON so it's editable), `intro`, `entries[] { date?, text }`, `closer`. All narrative fields ship as clearly-marked TODO strings — **no invented facts**; the block renders TODO strings in a distinct amber "draft" style during dev so unfinished copy is impossible to miss (and a build warning lists files still containing `[TODO`).
- **Animation:** ASCII art draws line-by-line; fog characters (`~`) drift horizontally in a slow CSS loop; entries fade in.
- **Chips:** `history`, `juma`, `whoami`.

### 1.6 `posts` — LinkedIn greatest hits

```
$ posts --top

  greatest hits, ranked by reactions. full archive
  on LinkedIn.

  ┌ #1 ─────────────────────────────── 2024-11-14 ┐
  │ TechCrunch's homepage: Team-GPT raises $4.5M 🤯│
  │ We just closed the biggest evening of my…      │
  │                                                │
  │ ▲ 512   💬 41   ⟳ 12            [ read on in ]│
  └────────────────────────────────────────────────┘
  ┌ #2 ─────────────────────────────── 2025-11-10 ┐
  │ Team-GPT just hit $1,000,000 in ARR. It took   │
  │ us 30 months…                                  │
  │ ▲ 441   💬 …   ⟳ …              [ read on in ]│
  └────────────────────────────────────────────────┘
  … (6–8 cards total)

  posts --all → linkedin.com/in/yavor-belakov

  [ juma → ]  [ aief → ]  [ contact → ]
```

- **Data source:** curated `content/posts.json`, generated by `scripts/build-posts.ts` (spec in §3). Blocks never read the raw 100-post dump.
- **Card fields:** rank, date (YYYY-MM-DD), excerpt (truncated text), stats (`reactions`, `comments`, `reposts` — plus a reaction breakdown for a hover/tap tooltip: like/love/insight/celebrate/funny/support), permalink, optional `tag` (auto: `team-gpt` | `juma` | `aief` | `build` — used for a subtle colored label).
- **Animation:** cards deal in one at a time (80ms stagger); reaction counts tick up; the `▲` on the #1 card pulses once.
- **Chips:** `juma`, `aief`, `contact`.

### 1.7 `history` — career timeline as log lines

```
$ history

  [TODO yr]  init        [TODO: first job/uni — real entry]
  [TODO yr]  join        Team-GPT — AI product builder
  2024-11    milestone   Team-GPT raises $4.5M (TechCrunch)
  2024?-..   found       AIE.F Europe — After Hours #1
  2025-05    ship        bezgradski.com — 7,000 users in 24h,
                         then open-sourced
  2025-11    milestone   Team-GPT crosses $1M ARR
  2025-11    launch      Juma — AI workspace for marketers
  2026-02    milestone   After Hours #50
       now   building    ▊                       ← blinking cursor

  9 events. run `history -v` for the honest version. [stretch]

  [ whoami → ]  [ juma → ]  [ neofetch → ]
```

- **Content fields:** `content/timeline.json`: `entries[] { date, verb, text, url?, type }` where `verb` is a short log verb (`init/join/found/ship/launch/milestone`) rendered in accent color, `type` drives a color class (`work`, `community`, `product`, `milestone`). Dates with `[TODO` render in draft-amber. Sorted ascending; the final synthetic `now building` row is hardcoded in the component with a blinking block cursor.
- **Animation:** the signature block — lines print top-to-bottom with `TypeLine` at readable speed (whole-line fade+left-slide, not per-character, to keep total under 1.5s for ~10 lines).
- **Chips:** `whoami`, `juma`, `neofetch`.
- Milestone dates that come from the post archive (raise, ARR, #50, Juma launch) are real; earlier career entries are TODO.

### 1.8 `neofetch` — ASCII portrait + specs

```
$ neofetch

   ░░▒▒▓▓██▓▓▒▒░░        yavor@yavor.codes
  ░▒▓  ASCII    ▓▒░      ─────────────────
  ░▒▓  PORTRAIT ▓▒░      Role:     AI Product Builder
  ░▒▓  ~20 rows ▓▒░      Company:  Juma (co-founder) / Team-GPT
   ░░▒▒▓▓██▓▓▒▒░░        Community: AIE.F Europe (52+ events)
                          Location: Sofia, BG ⇄ SF
                          Stack:    Next.js · TS · [TODO]
                          Editor:   [TODO: Cursor? vim? 😏]
                          Uptime:   26 yrs [TODO: birth yr for live counter]
                          Shipping: since [TODO career start]

                          ████ ████ ████ ████   ← theme swatches

  [ whoami → ]  [ history → ]  [ contact → ]
```

- **Content fields:** `content/profile.json → neofetch`: `asciiArt[]` (portrait lines, pre-generated at design time from Yavor's photo with an image-to-ASCII pass, stored as strings — *not* generated at runtime), `specs[] { key, value }`, `birthYearMonth?`, `careerStart?`. If `birthYearMonth` is present the component computes uptime live (`26 yrs, 142 days` style, ticking days only).
- **Layout:** classic neofetch two-column; below 560px the portrait renders above the specs at reduced font-size. Portrait uses `text-[6px] leading-[6px]` style micro-font so it stays image-like.
- **Animation:** portrait materializes with a per-line stagger + brief "phosphor" flash; spec values type in; swatch row pops in last.
- **Chips:** `whoami`, `history`, `contact`.

### 1.9 `contact` — say hi

```
$ contact

  Pick your protocol:

  ✉  email      yavor@team-gpt.com          [copy]
  in linkedin   /in/yavor-belakov     (fastest reply — I live here)
  📅 calendar   [TODO: cal.com / calendly link]
  gh github     [TODO handle]
  x  x/twitter  [TODO handle]

  Speaking at an AIE.F event, trying Juma, or just
  in Sofia? Any of the above works.

  [ whoami → ]  [ aief → ]  [ help → ]
```

- **Content fields:** `content/profile.json → contact`: reuses `socials[]` plus `email { address, copyable: true }`, `calendar { url, label }`, `note`. Single source of truth: `whoami` shows a compact subset (`primary: true` flag on socials), `contact` shows everything.
- **Behavior:** email row has a copy-to-clipboard affordance; on copy the row briefly echoes `→ copied to clipboard ✓`. Calendar opens in new tab.
- **Animation:** rows cascade; the copy confirmation types in and fades.
- **Chips:** `whoami`, `aief`, `help`.

---

## 2. Content File Schemas

All files live in `content/`; interfaces mirrored in `content/types.ts`. Unknown facts ship as literal `"[TODO: …]"` strings (build warning surfaces them; renderer styles them as drafts).

### `content/profile.json`
```jsonc
{
  "name": "Yavor Belakov",
  "headline": "Co-founder @ Juma · Founder @ AIE.F Europe · AI product builder",
  "bio": ["[TODO: line 1]", "[TODO: line 2]"],        // blockquote lines
  "avatar": "/images/avatar.png",
  "location": { "primary": "Sofia, Bulgaria", "secondary": "San Francisco (sometimes)" },
  "socials": [
    { "id": "linkedin", "label": "linkedin", "url": "https://linkedin.com/in/yavor-belakov", "primary": true },
    { "id": "github",   "label": "github",   "url": "[TODO]", "primary": true },
    { "id": "x",        "label": "x",        "url": "[TODO]", "primary": false }
  ],
  "contact": {
    "email": { "address": "yavor@team-gpt.com", "copyable": true },
    "calendar": { "url": "[TODO]", "label": "book 30 min" },
    "note": "Speaking at an AIE.F event, trying Juma, or just in Sofia? Any of the above works."
  },
  "help": {
    "commands": [ { "name": "whoami", "blurb": "who is this guy" } /* … */ ],
    "hint": "psst: this terminal has secrets. try things."
  },
  "neofetch": {
    "asciiArt": ["…portrait lines…"],
    "specs": [ { "key": "Role", "value": "AI Product Builder" } /* … */ ],
    "birthYearMonth": "[TODO e.g. 1999-06]",
    "careerStart": "[TODO e.g. 2019-09]"
  }
}
```

### `content/juma.json`
```jsonc
{
  "name": "Juma", "org": "jumalabs",
  "tagline": "AI workspace built for marketers. By marketers.",
  "description": "[TODO: 2–3 sentences, Yavor's words]",
  "products": [
    { "id": "jumeet", "name": "jumeet", "oneLiner": "Google Meet AI notetaker — joins your calls, writes the notes you won't.", "url": "[TODO]", "status": "shipping" }
  ],
  "metrics": [ { "label": "status", "value": "shipping", "public": true } ],
  "links": [ { "label": "site", "url": "[TODO]" } ],
  "pullQuote": { "text": "Announcing Juma — AI workspace built especially for marketers.", "source": "launch post, Nov 2025", "url": "https://www.linkedin.com/posts/…7397…" }
}
```

### `content/aief.json`
```jsonc
{
  "name": "AIE.F Europe",
  "tagline": "After Hours: an AI meetup that refused to stop.",
  "story": "[TODO: origin story, 2–4 sentences]",
  "stats": [
    { "label": "events run", "value": 52, "suffix": "+", "animated": true },
    { "label": "frequency", "value": "~weekly" },
    { "label": "home turf", "value": "Sofia — Barter Hub, Work&Share, …" },
    { "label": "community", "value": "[TODO size]" }
  ],
  "photos": [ { "src": "/aief/ah50-1.jpg", "alt": "After Hours #50 crowd", "caption": "the 50th" } ],
  "recentEvents": [
    { "title": "After Hours #52", "date": "2026-02-25", "venue": "Work&Share, Synergy Tower" },
    { "title": "After Hours #50", "date": "2026-02-11", "venue": "Work&Share", "highlight": true }
  ],
  "speakerCta": { "text": "want to speak at one?", "command": "contact" }
}
```

### `content/sf.json`
```jsonc
{
  "title": "SOFIA ✈ SAN FRANCISCO",
  "ascii": ["   ~ ~ ~ ~ ~", "═══╬═════════╬═══"],
  "intro": "[TODO: one-line framing of the SF connection]",
  "entries": [ { "date": "[TODO]", "text": "[TODO: what happened]" } ],
  "closer": "[TODO: closing line — draft: 'timezone math: SF is -10h from Sofia. I've learned to schedule accordingly.']"
}
```

### `content/posts.json` (generated — do not hand-edit; header comment field says so)
```jsonc
{
  "generatedAt": "2026-08-28T…",
  "source": "linkedin export, 100 posts, 2026-01-31",
  "profileUrl": "https://linkedin.com/in/yavor-belakov",
  "posts": [
    {
      "rank": 1,
      "id": "7262…",                       // activity_urn
      "date": "2024-11-14",
      "excerpt": "TechCrunch's homepage: Team-GPT raises $4.5M 🤯 …",
      "stats": { "reactions": 512, "comments": 41, "reposts": 12,
                 "breakdown": { "like": 430, "love": 40, "celebrate": 30, "insight": 8, "funny": 2, "support": 2 } },
      "url": "https://www.linkedin.com/posts/yavor-belakov_…",   // utm-stripped
      "tag": "team-gpt",
      "hasMedia": true
    }
  ]
}
```

### `content/timeline.json`
```jsonc
{
  "entries": [
    { "date": "[TODO]",  "verb": "init",      "text": "[TODO first entry]", "type": "work" },
    { "date": "2024-11", "verb": "milestone", "text": "Team-GPT raises $4.5M — TechCrunch homepage", "type": "milestone", "url": "…" },
    { "date": "2025-11", "verb": "launch",    "text": "Juma — AI workspace for marketers", "type": "product" },
    { "date": "2026-02", "verb": "milestone", "text": "AIE.F After Hours #50", "type": "community" }
  ]
}
```

---

## 3. `scripts/build-posts.ts` — curation pipeline

Run manually via `npm run build:posts` (input file lives outside the repo in `~/Downloads/…`, so it must **not** run in CI/`prebuild`; the generated `content/posts.json` is committed).

**Pipeline (grounded in the actual dataset):**
1. **Load** raw JSON (path via arg, default the known Downloads path). Validate against a minimal zod schema of the raw shape.
2. **Filter:** drop `post_type === "repost"` (the #1-by-reactions item, 2,794 reactions, is a repost of OpenAI content — not Yavor's voice); drop posts under a floor (e.g. `total_reactions < 50`) and pure event-listing posts if flagged.
3. **Rank:** sort by `stats.total_reactions` desc; take top **N = 8** (configurable). Optional `--include urn` / `--exclude urn` flags so Yavor can hand-pin/hand-drop specific posts without editing output.
4. **Clean text → excerpt:**
   - Strip `https://lnkd.in/…` short links and bare `https://…` URLs.
   - Collapse 3+ newlines to 2; trim trailing hashtag blobs (`(#\w+\s*){2,}$`).
   - Truncate to ~180 chars at a word boundary, append `…`. Keep the first line intact when possible (it's the hook).
   - Preserve emojis (they're part of the voice).
5. **Map fields:** rank, `id` = `urn.activity_urn`, `date` = `posted_at.date` → `YYYY-MM-DD`, stats incl. breakdown (note: raw data has `support` too), `url` with `?utm_source…` query string stripped, `hasMedia` = media != null. **Do not copy `media.url`** — `licdn.com` URLs carry expiring signatures (`e=…&t=…` params) and will 404; v1 renders text-only cards (media download is a stretch goal, see §8 Q7).
6. **Tag heuristics:** case-insensitive keyword match on text → `juma`/`jumeet` → `juma`; `aie.f`/`after hours` → `aief`; `team-gpt` → `team-gpt`; else `build`.
7. **Emit** `content/posts.json` pretty-printed with `generatedAt`, `source`. Print a curation report to stdout (kept/dropped counts, the chosen 8 with scores) so curation is reviewable in the PR diff.

---

## 4. File List — `components/blocks/`

| File | Responsibility |
|---|---|
| `components/blocks/types.ts` | `BlockProps`, chip type, shared animation variants (stagger container, line item). |
| `components/blocks/shared/ChipRow.tsx` | Next-command chips (§0). |
| `components/blocks/shared/SectionHeader.tsx` | Comment-style dividers. |
| `components/blocks/shared/StatPill.tsx` | Inline reaction/metric pills; optional count-up. |
| `components/blocks/shared/TypeLine.tsx` | Animated log/typed line; reduced-motion aware. |
| `components/blocks/shared/AsciiFrame.tsx` | Box-drawing frame with mobile degradation. |
| `components/blocks/shared/TodoDraft.tsx` | Wraps any `[TODO:` string in amber draft styling (dev-visible guardrail). |
| `components/blocks/HelpBlock.tsx` | Command index; clickable command names. |
| `components/blocks/WhoamiBlock.tsx` | Intro card: avatar, headline, bio quote, primary socials. |
| `components/blocks/JumaBlock.tsx` | Product showcase incl. jumeet; status dots; metric count-ups. |
| `components/blocks/AiefBlock.tsx` | Community story: stats, photo strip (scroll-snap), event log, speaker CTA. |
| `components/blocks/SfBlock.tsx` | ASCII art + narrative entries. |
| `components/blocks/PostsBlock.tsx` | Ranked post cards from `content/posts.json`; reaction tooltip; outbound links. |
| `components/blocks/HistoryBlock.tsx` | Timeline log printer; blinking `now building` cursor. |
| `components/blocks/NeofetchBlock.tsx` | ASCII portrait + specs; live uptime computation. |
| `components/blocks/ContactBlock.tsx` | Full contact list; copy-email interaction. |
| `components/blocks/EasterEggBlock.tsx` | Single generic renderer for all one-liner eggs (takes `eggId`, reads `content/eggs.json`); `MatrixEgg.tsx` is the only egg with its own component (canvas rain, 4s, self-dismisses). |
| `components/blocks/NotFoundBlock.tsx` | `command not found` + "did you mean" line (§5 voice; suggestion computed by engine via Levenshtein, this block only renders). |
| `scripts/build-posts.ts` | Curation pipeline (§3). |
| `content/types.ts` | TS interfaces for every content file. |
| `content/eggs.json` | Easter egg copy (so eggs are re-writable without touching code). |

---

## 5. Easter Eggs & Error Voice

All eggs are `hidden: true` commands: never listed in `help` (beyond the "psst" hint), each returns a fast one-liner block (no chips except where noted — eggs should feel like asides, not pages).

| Command | Response / behavior |
|---|---|
| `sudo <anything>` | `yavor is not in the sudoers file. This incident will be posted on LinkedIn.` |
| `ls` | Prints `juma/  aief/  posts/  ideas/  …` — each entry is clickable and runs the matching command; `ideas/` prints `permission denied (ships only)` when clicked. |
| `cd <dir>` | `nice try. this terminal only moves forward. try 'history' for the way back.` |
| `cat <file>` | For known names (`cat juma`, `cat resume.pdf`): `resume.pdf: binary file. humans read 'whoami' instead.` Generic: `cat: <file>: no such file — everything worth reading is a command here.` |
| `vim` / `emacs` | `vim: you'd never leave. emacs: I'd never leave. we use [TODO: Yavor's real editor] here.` (each editor gets its own line variant; `:q!` typed after `vim` prints `there you go. muscle memory intact.`) |
| `coffee` / `brew` | `☕ brewing… done. productivity +12%, jitters +40%. this round's on the terminal.` |
| `matrix` | 4-second canvas digit-rain overlay in theme accent, then: `wake up, Yavor… the demo is due.` Auto-dismisses; any key skips. Reduced-motion: prints `the matrix has you. (animation skipped, as you asked)`. |
| `exit` / `logout` | `exit: refusing. you just got here. (fine — closing the tab works, but 'contact' is friendlier.)` |
| `whois yavor` *(bonus)* | Alias of `whoami` with prefix line `% redirected from WHOIS: humans don't have registrars.` |

**`command not found` voice** (rendered by `NotFoundBlock`):
```
zsh: command not found: <input>
did you mean 'juma'?          ← only when suggestion exists (edit distance ≤ 2)
run 'help' to see what this thing can actually do.
```
Rotating third line (3 variants in `eggs.json`) so repeated typos don't feel canned, e.g. `it's a portfolio, not a POSIX cert.`

---

## 6. Voice & Tone Guide

**Voice:** a builder narrating his own terminal — witty, concise, momentum-forward. Confident about shipping, self-deprecating about everything else. Never corporate ("passionate", "leverage", "journey" are banned). Lowercase for system/terminal text; normal casing for human copy. Emojis: allowed, max one per line, only where LinkedIn-Yavor would use one. Every block ends by pointing somewhere — the site never says goodbye, it says "next".

Three calibration lines:
1. `Team-GPT hit $1M ARR in 30 months. The first $0 took the longest.` *(milestone flex + self-aware beat)*
2. `After Hours #50: turns out if you just keep hosting the meetup, it becomes an institution.` *(community, understated)*
3. `jumeet joins your Google Meets and writes the notes you won't.` *(product one-liner: verb-first, no adjectives)*

---

## 7. Implementation Sequencing

1. `content/types.ts` + all JSON files with real facts from the post archive and TODO placeholders (unblocks everything; copy review can start immediately).
2. Shared components (`ChipRow`, `TypeLine`, `StatPill`, `AsciiFrame`, `TodoDraft`) — every block depends on these.
3. `scripts/build-posts.ts` + generated `posts.json` (independent track, no UI deps).
4. Blocks in order of dependency-lightness: `help` → `whoami` → `contact` → `history` → `juma` → `aief` → `posts` → `sf` → `neofetch` (ASCII portrait asset is the long pole — commission/generate it early in parallel).
5. `eggs.json` + `EasterEggBlock` + `NotFoundBlock` + `MatrixEgg` last (pure fun, zero blockers).

**Risks:** licdn media expiry (mitigated: text-only post cards v1); ASCII portrait quality on mobile (mitigated: stacked layout + micro-font, test at 360px); TODO copy leaking to prod (mitigated: `TodoDraft` styling + build-time grep warning).

---

## 8. Open Questions for Yavor

1. **Bio & one-liner** (`whoami`): approve/rewrite the 2–3 sentence bio. Headline draft is derived from your LinkedIn headline — keep "Cursor for Marketers"?
2. **Socials:** GitHub handle, X handle, calendar link (cal.com/calendly?), preferred public email — `yavor@team-gpt.com` or a jumalabs/personal address?
3. **Juma:** domain/URL, which metrics are public (ARR? users?), full product list beyond jumeet, and is "jumalabs" the public brand or internal name?
4. **AIE.F:** origin story (when/why #1 happened), community size number you're happy publishing, 5–8 event photos for `/public/aief/`, and founding date for the timeline.
5. **SF:** the actual story — trips, programs, launches, dates. Entire `sf.json` narrative is TODO.
6. **neofetch:** birth year+month (for live uptime — posts say 26 as of Nov 2025), career start date, real stack list, and your actual editor (needed for the vim/emacs egg punchline).
7. **Posts:** OK with top-8-by-reactions excluding reposts? Any post to pin or veto? Want post images (requires a media-download step since LinkedIn CDN links expire)?
8. **Timeline:** pre-2024 entries — education, first roles, when you joined Team-GPT.

---

## 9. UPDATE (2026-08-28): research pass done

Most §8 open questions are now answered from the post archive — see **`docs/research/posts-findings.md`** (evidence-backed, with post dates/URLs). Key corrections to this plan:
- Phrase is **"Cursor for marketing agencies"**, not "Cursor for Marketers".
- AIE.F founded **~Dec 2023** (not 2024); full name "AI Engineer Foundation Europe"; 1000+ members, "biggest AI community in Europe".
- Team-GPT founded **Apr 2023**; Juma launched **2025-11-19**; rebrand forced by OpenAI legal letters; 75K users / 500+ companies / team of 20 at rebrand.
- **Do not use "jumeet"/"jumalabs" on the site without Yavor's OK — neither appears publicly.**
- `sf` block now has a real story arc (trips since Nov 2024 → living there Oct–Dec 2025 → "SF is a Mindset" closer) + gems: denied entry at LinkedIn Tower, $1K hackathon win, near-missed flight in Zurich, Juma launch party at True Ventures HQ.
- neofetch: MBP M4 Max, Cursor + Claude Code, age 26 @ 2025-11, uni dropout, ex-pro athlete.
- Timeline additions: bezgradski.com (7K users/24h), spookify.pics, hackerpassport.com, OpenFest talk, 10K followers.

Remaining questions for Yavor are in the STILL UNKNOWN section of the research doc (8 items, mostly small facts + assets).
