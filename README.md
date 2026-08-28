# yavor.codes

**A terminal where stdout is React.** → [yavor.codes](https://yavor.codes)

Personal site of Yavor Belakov — Head of AI @ [Juma](https://juma.ai), founder of AIE.F Europe. The site boots like a CLI; commands render rich, animated React blocks.

## Commands

`help` · `whoami` · `juma` · `aief` · `sf` · `posts` · `history` · `neofetch` · `contact` · `theme` · `clear` — plus a handful of easter eggs. Try things.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · Framer Motion · zustand. Five complete switchable themes (`theme list`). No xterm.js — the terminal is custom.

## Run

```bash
pnpm install
pnpm dev
```

`pnpm run build:posts` regenerates `src/content/posts.json` from the raw LinkedIn export (lives outside the repo).

## Deploy

Deploys happen **only** via Vercel git integration: open a PR, merge to `main`, Vercel builds and promotes automatically. Never run `vercel deploy`.

## Docs

Planning docs live in [`docs/`](docs/) — overview, definition of done, and seven subsystem plans.
