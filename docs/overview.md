# yavor.codes — Overview

Personal site for Yavor Belakov at **yavor.codes**. Not a standard website: the site boots as a terminal, but commands render rich, animated React blocks (3D moments, cards, media) instead of plain text. "A terminal where stdout is React."

## Who it represents
- **Yavor Belakov** — builder, AI product person (Team-GPT)
- **Juma** — product showcase
- **AIE.F Europe** — AI community/events, Sofia
- **SF** — San Francisco connection
- LinkedIn presence (100-post archive with engagement data available as content source)

## Locked decisions
| Decision | Choice |
|---|---|
| Concept | Rich fake terminal (custom, no xterm.js) |
| Stack | Next.js App Router + TypeScript + Tailwind + Framer Motion + selective React Three Fiber |
| Themes | Complete multi-theme system, user-switchable via `theme` command, persisted |
| Repo / deploy | GitHub `ybelakov/yavor-codes`, Yavor's Vercel account, git-integration deploys only (never `vercel deploy --prod`) |
| Language | English only |
| Mobile | First-class: clickable command chips so no typing is required |
| v2 (not now) | AI agent fallback for free-text input; architecture must stay agent-ready |

## Command set (v1)
`help` · `whoami` · `juma` · `aief` · `sf` · `posts` · `history` · `neofetch` · `contact` · `theme` · `clear` + real-terminal behaviors (`ls`, `cd`, arrow history, tab-complete) + easter eggs (`sudo`, etc.)

## Build phases
1. **Skeleton** — terminal shell end-to-end with plain text commands, Vercel preview
2. **Boot + look** — boot sequence, themes, backdrop, typing feel
3. **Rich blocks** — all command outputs with real content
4. **Polish** — easter eggs, mobile, OG image, analytics, launch on yavor.codes

## Planning docs (docs/plans/)
- `terminal-engine.md` — shell, parser, registry, input UX
- `boot-sequence.md` — first-load experience
- `theme-system.md` — themes, switching, persistence
- `content-blocks.md` — command outputs, content JSON schemas, easter eggs
- `visual-layer.md` — R3F backdrop, shaders, motion, performance budget
- `mobile-accessibility.md` — chips-first mobile UX, a11y
- `infra-deploy.md` — repo, Vercel, domain, SEO/OG, analytics

See `definition-of-done.md` for launch criteria.
