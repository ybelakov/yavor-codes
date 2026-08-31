# yavor.codes

**Yavor Belakov's desktop, in a browser.** → [yavor.codes](https://yavor.codes)

A macOS-style desktop: menu bar, dock, draggable windows, and a set of working apps. The Terminal is the fastest way through everything — but you can also browse, read, and click your way around.

## Apps

| App | What's inside |
|---|---|
| **Terminal** | The real thing: `help`, `whoami`, `juma`, `aief`, `sf`, `posts`, `history`, `neofetch`, `contact`, `theme` — plus ~30 simulated shell commands (`git status`, `top`, `npm install`, `ping`, `sudo`…) and a pile of easter eggs |
| **Google Chrome** | Tabs, omnibox and bookmarks over in-app renderings of juma.ai, AIE.F, LinkedIn and GitHub |
| **Finder** | Desktop / Documents / Projects / Photos / Applications — double-click opens the right app |
| **Notes** | read-me-first, san-francisco.md, now.md |
| **Photos** | AIE.F event photos with a lightbox |
| **Mail** | Composes a real message to yavor@juma.ai |
| **System Settings** | Wallpapers and five Terminal themes, both persisted |
| **About This Mac** | From the  menu |

## Icons

The app and file icons in `public/icons` are the genuine macOS and Chrome
assets, extracted from the `.icns` bundles on a Mac by
`scripts/extract-icons.sh` (document icons come from `NSWorkspace` via
`scripts/extract-doc-icons.swift`). They remain Apple's and Google's
artwork — swap `AppIcons.tsx` back to drawn SVGs if that matters for your
use case.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · Framer Motion · zustand. The window manager, terminal engine and command registry are all hand-rolled — no xterm.js, no window library.

## Run

```bash
pnpm install
pnpm dev
```

`pnpm run build:posts` regenerates `src/content/posts.json` from the raw LinkedIn export (lives outside the repo).

## Deploy

Deploys happen **only** via Vercel git integration: open a PR, merge to `main`, Vercel builds and promotes automatically. Never run `vercel deploy`.

## Docs

Planning docs for the original terminal concept live in [`docs/`](docs/); the desktop shell is documented in the code.
