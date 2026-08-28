# yavor.codes — Infra, Repo, Deployment, SEO & Analytics Plan

Scope: project bootstrap, repo + Vercel + domain setup, rendering strategy, SEO/metadata, analytics, 404, CI guardrails, fonts, v2 API readiness. Terminal engine, themes, content, and visuals are covered by sibling plans in `docs/plans/`.

Verified against the registry on 2026-08-28: `next@16.3.3`, `tailwindcss@4.3.3`, `create-next-app@16.3.3`, `@vercel/analytics@2.0.1`, `@vercel/speed-insights@2.0.0`.

---

## 0. Recommendations up front (with reasoning)

| Decision | Recommendation | Why |
|---|---|---|
| Package manager | **pnpm** | Fastest installs, strict node_modules (catches phantom deps), auto-detected by Vercel via lockfile. No downside for a solo repo. |
| Tailwind version | **v4** (current, 4.3.x) | It's what `create-next-app` scaffolds today; CSS-first `@theme` config is a natural fit for the multi-theme system (themes = CSS custom properties, no `tailwind.config.js` juggling); v3 would be a deliberate downgrade with no benefit here. |
| Rendering | **Default Next.js on Vercel — NOT `output: 'export'`** | The single page is a client-heavy static shell and will be prerendered as static HTML at build time anyway, so we get static-export performance for free. Crucially, static export would *forbid* Route Handlers, killing the v2 `/api/agent` route and forcing a re-architecture. Default output keeps v2 a pure addition. |
| OG image | **`next/og` generated terminal-style image** (`app/opengraph-image.tsx`) | For a static route this is rendered **once at build time** — zero runtime cost, same as a static PNG — but it stays in code, uses the real JetBrains Mono, and is trivially updatable (e.g. change the fake prompt text) without opening a design tool. Fallback: if the JSX/satori version fights us for more than an hour, drop a designed 1200×630 PNG at `app/opengraph-image.png` — the file convention is identical, swap is free. |
| Speed Insights | **Yes, add it** | This site's main perf risk is the R3F backdrop on real devices. Speed Insights gives field CWV data (INP/LCP on actual phones) that Lighthouse-in-CI can't. It's one component + free on the first Hobby project. Remove later if noise > signal. |
| CI | **GitHub Actions: lint + prettier-check + `tsc --noEmit` on every PR; no build step in CI** | Vercel already builds every PR as a preview deployment — a CI build would be redundant compute and a second source of truth. CI covers what Vercel's build doesn't fail on (lint warnings, formatting, strict type errors surfaced early with clear annotations). |

---

## 1. Bootstrap

### 1.1 Command

Run from `~/Documents/GitHub` (the folder `yavor-codes/` already exists with `docs/` — `create-next-app` will scaffold into it; if it complains about the non-empty dir, scaffold into a temp name and move files over — ask Yavor first):

```bash
pnpm create next-app@latest yavor-codes \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --turbopack \
  --use-pnpm \
  --no-react-compiler
```

Notes:
- `--src-dir`: keeps `app/`, `components/`, `lib/` under `src/`, leaving the repo root for config + `docs/` + `public/`.
- Turbopack is the Next 16 default for dev and build; the flag just makes it explicit.
- React Compiler: decline for v1 (`--no-react-compiler`) — the terminal render loop and R3F need predictable memoization behavior; revisit later.

Then add the deps this plan owns:

```bash
pnpm add @vercel/analytics @vercel/speed-insights
pnpm add -D prettier eslint-config-prettier prettier-plugin-tailwindcss
```

(Framer Motion / R3F are owned by the visual-layer plan.)

> Constraint reminder: per Yavor's rules, **ask before running** `pnpm build`, `tsc --noEmit`, or any type-check locally. Scaffolding and `pnpm install` are fine; verification builds need a yes.

### 1.2 Config files — list and contents outline

**`next.config.ts`**
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // NO output: 'export' — see rendering strategy
  poweredByHeader: false,
  // images: default loader is fine; if all images end up local + few,
  //   consider images: { unoptimized: true } to skip the optimization quota — decide with visual-layer plan
};

export default nextConfig;
```
Deliberately minimal. No headers/redirects here — www redirect is handled by Vercel domain config (Section 3), not code.

**`tsconfig.json`** — take the generated one and tighten:
```jsonc
{
  "compilerOptions": {
    "strict": true,                       // generated
    "noUncheckedIndexedAccess": true,     // add — command registry lookups by string key
    "noImplicitOverride": true,           // add
    "noFallthroughCasesInSwitch": true,   // add — command switch/dispatch
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true          // add — keeps type imports honest
    // skip exactOptionalPropertyTypes — high friction with React prop types, low payoff here
  }
}
```

**`.prettierrc`**
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```
Plus `.prettierignore`: `.next/`, `pnpm-lock.yaml`, `public/`.

**`eslint.config.mjs`** (flat config, generated by create-next-app 16) — extend with:
- `eslint-config-prettier` last in the array (kill formatting rules).
- Keep `next/core-web-vitals` preset as scaffolded.
- No custom rule zoo; add rules only when a real bug motivates them.

**`postcss.config.mjs`** — as generated (`@tailwindcss/postcss`). Tailwind v4 has **no `tailwind.config.js`**; theme tokens live in `src/app/globals.css` under `@theme` / CSS custom properties (owned by theme-system plan — infra just guarantees v4 is in place).

**`.nvmrc` / `package.json engines`** — pin Node: `"engines": { "node": ">=20" }` and `.nvmrc` with `22`. Vercel project setting: Node 22.x.

**`.env.example`** — committed, empty for v1 except comments:
```bash
# v1 has no secrets. v2 (AI agent) will add:
# ANTHROPIC_API_KEY=
```

---

## 2. Repo setup

### 2.1 Git / GitHub checklist

| # | Step | Where |
|---|---|---|
| 1 | `git init` in `~/Documents/GitHub/yavor-codes`, initial commit of scaffold + docs | CLI |
| 2 | Create repo `ybelakov/yavor-codes` (public recommended — it's a personal-brand artifact and the code is part of the flex) | `gh repo create ybelakov/yavor-codes --public --source . --push` |
| 3 | Default branch `main` | automatic |
| 4 | Branch protection on `main`: require PR, require status checks (`ci` workflow) to pass, no force-push. Solo repo → **don't** require approvals (you can't approve your own PR) | GitHub dashboard → Settings → Branches |
| 5 | Enable "Automatically delete head branches" | GitHub dashboard → Settings → General |

**Branch strategy:** `main` = production (every merge auto-deploys to yavor.codes via Vercel). All work on short-lived `feat/…`, `fix/…`, `chore/…` branches → PR → merge. Every PR gets a Vercel preview URL, which doubles as the review environment on real phones. Never `vercel deploy --prod`, never push straight to `main` once protection is on.

### 2.2 `.gitignore`

The generated Next.js one covers `.next/`, `node_modules/`, `*.tsbuildinfo`, `next-env.d.ts`, `.env*` (with `!.env.example`). Add:
```
.vercel/          # created by `vercel link`; contains project IDs — keep out of git
.DS_Store
```
Commit `pnpm-lock.yaml` (required for reproducible Vercel builds).

### 2.3 README contents

- One-line pitch: "A terminal where stdout is React" + link to yavor.codes.
- Screenshot/GIF placeholder (added in Polish phase).
- Stack list.
- **Run:** `pnpm install`, `pnpm dev`.
- **Deploy:** explicit statement — *"Deploys happen ONLY via Vercel git integration: open a PR, merge to `main`, Vercel builds and promotes automatically. Never run `vercel deploy`."*
- Command cheat-sheet (the v1 command set from `docs/overview.md`).
- Pointer to `docs/` for plans and the definition of done.

---

## 3. Vercel + domain setup checklist

Legend: **[D]** = Yavor in a dashboard (browser), **[C]** = CLI/code.

| # | Step | How |
|---|---|---|
| 1 | Vercel dashboard → Add New Project → Import `ybelakov/yavor-codes` from GitHub (grant the Vercel GitHub App access to this repo if needed) | **[D]** |
| 2 | Framework preset: **Next.js** (auto-detected). Build command / output: leave defaults. Install command: auto (`pnpm install` via lockfile detection). Root directory: `/` | **[D]** |
| 3 | Node.js version: 22.x (Project → Settings → Build & Deployment) | **[D]** |
| 4 | First deploy runs on import → verify the `*.vercel.app` URL works | **[D]** |
| 5 | Buy/point `yavor.codes`: Project → Settings → Domains → add `yavor.codes`. If the domain is registered elsewhere, either switch nameservers to Vercel DNS (easiest) or add the A/CNAME records Vercel shows at the current registrar | **[D]** + registrar dashboard |
| 6 | Add `www.yavor.codes` in the same Domains screen and set it to **Redirect to `yavor.codes` (308)**. Apex is canonical — no code needed | **[D]** |
| 7 | HTTPS: automatic — Vercel provisions Let's Encrypt certs for both hosts; verify the padlock after DNS propagates | — |
| 8 | Git settings: Production Branch = `main`; leave "Preview Deployments for all branches/PRs" on | **[D]** (default) |
| 9 | Enable **Web Analytics** and **Speed Insights** toggles: Project → Analytics / Speed Insights tabs | **[D]** |
| 10 | Optionally `vercel link` locally so `vercel logs` / `vercel env pull` work later — linking is fine; **deploying is not** | **[C]** |
| 11 | Deployment Protection: leave preview URLs unprotected (nice for sharing WIP) or enable Vercel Authentication — Yavor's call | **[D]** |

DNS reality check: apex + www + 308 + auto-HTTPS is all dashboard configuration. Keep `next.config.ts` free of redirect logic so there's exactly one source of truth.

---

## 4. Rendering strategy (decision record)

**Choice: default Next.js output on Vercel. Not `output: 'export'`.**

- The site is one route (`/`) whose interactivity is entirely client-side. With default settings Next prerenders `/` to static HTML + RSC payload at build time and serves it from Vercel's edge CDN — identical delivery characteristics to a static export for this shape of app.
- `output: 'export'` would permanently rule out: Route Handlers (`/api/agent` in v2), `next/og` build-time image generation via the route convention, and dynamic 404 status codes. The only thing it buys is portability off Vercel, which is explicitly not a goal.
- Guardrail: nothing in v1 should opt the page into dynamic rendering (no `cookies()`/`headers()` reads in server components, no `force-dynamic`). After the first deploy, the Vercel build log should show `/` as **static (prerendered)** — that's the acceptance test for this section. Theme persistence uses `localStorage` client-side (per theme-system plan), which keeps the server output static.

---

## 5. SEO / metadata plan

### 5.1 File list

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | `metadata` export + `viewport` export, Analytics/SpeedInsights components, font wiring |
| `src/app/opengraph-image.tsx` | Build-time generated 1200×630 terminal-style OG image (`next/og` `ImageResponse`); also referenced automatically for Twitter card |
| `src/app/opengraph-image.alt.txt` | Alt text for the OG image |
| `src/app/icon.svg` | Favicon (SVG, e.g. a `>_` glyph in theme accent-on-black); Next serves it via file convention |
| `src/app/apple-icon.png` | 180×180 PNG for iOS home screen |
| `src/app/robots.ts` | Generates `robots.txt` |
| `src/app/sitemap.ts` | Generates `sitemap.xml` |
| `src/app/not-found.tsx` | Terminal-style 404 (Section 6) |

### 5.2 `layout.tsx` metadata shape

```ts
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://yavor.codes"),
  title: {
    default: "Yavor Belakov — yavor.codes",
    template: "%s — yavor.codes",        // future-proofing; one page today
  },
  description:
    "A terminal where stdout is React. Yavor Belakov — AI product builder (Juma, Team-GPT), AIE.F Europe, Sofia ⇄ SF.", // placeholder — content plan owns final copy
  alternates: { canonical: "/" },        // resolves to https://yavor.codes/ via metadataBase
  openGraph: {
    type: "website",
    url: "https://yavor.codes",
    siteName: "yavor.codes",
    title: "Yavor Belakov — yavor.codes",
    description: "…same…",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",                 // sync with default theme token
  width: "device-width",
  initialScale: 1,
};
```
Notes: no manual `<link rel="icon">` or OG image URLs — the file conventions inject them. `metadataBase` makes previews resolve OG URLs correctly too.

Optional but cheap and good for a personal site: a JSON-LD `Person` schema (`name`, `url`, `sameAs`: LinkedIn/GitHub/X) rendered as a `<script type="application/ld+json">` in `layout.tsx`.

### 5.3 OG image approach (`opengraph-image.tsx`)

- `export const size = { width: 1200, height: 630 }`, `contentType = "image/png"`, `alt`.
- `ImageResponse` JSX: dark terminal window (traffic-light dots, title bar `yavor@codes: ~`), a fake prompt line `➜ ~ whoami`, output `Yavor Belakov — AI product builder`, blinking-cursor block glyph. Uses the default theme's colors, hardcoded (no theme system dependency).
- **Font:** `next/font` is not available inside `ImageResponse` — commit `src/app/_og/JetBrainsMono-Regular.ttf` (and Bold) and load with `fs.readFile` in the module. Static route → runs once at build.
- Verification (Polish phase): paste a preview URL into opengraph.xyz + LinkedIn Post Inspector; DoD requires LinkedIn/X render correctly.

### 5.4 robots + sitemap (yes, even for one page)

```ts
// robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://yavor.codes/sitemap.xml",
  };
}

// sitemap.ts — single entry
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://yavor.codes", lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
```
A one-URL sitemap is mildly ceremonial but costs 10 lines, satisfies Search Console setup, and the Lighthouse SEO ≥ 95 DoD line. After launch: **[D]** add the property in Google Search Console (DNS TXT verification) and submit the sitemap.

---

## 6. Custom 404 — `src/app/not-found.tsx`

- Server component shell + small client component reusing the terminal frame styles (not the full engine — no need for the input loop on an error page).
- Rendering: a static terminal window showing
  `zsh: command not found: /whatever-path` — the actual path read client-side from `window.location.pathname` in the client child, followed by a hint line and a chip/link: `cd ~` → back to `/`.
- Next serves this with a real HTTP 404 status for unknown routes — good for SEO hygiene.
- Track it: fire a `notfound_view` analytics event with the path (see taxonomy).

---

## 7. Analytics

### 7.1 Wiring

- `<Analytics />` and `<SpeedInsights />` from `@vercel/analytics/next` and `@vercel/speed-insights/next`, both rendered once in `layout.tsx`.
- Custom events via `track(name, properties)` from `@vercel/analytics`. Expose a tiny wrapper `src/lib/analytics.ts` so the terminal engine calls `trackEvent("command_run", {...})` without importing the vendor package everywhere — this is also the v2 seam (agent invocations log through the same funnel).
- **Plan caveat (open question #1):** Vercel Web Analytics *custom events* require a Pro plan; Hobby gets pageviews/referrers only. The wrapper makes this a non-issue architecturally — if Yavor stays on Hobby, the wrapper can no-op or be pointed at a free alternative (e.g. self-hosted umami/Plausible) later without touching call sites.

### 7.2 Event taxonomy

| Event | Properties | Fired when |
|---|---|---|
| `command_run` | `command` (canonical name), `source`: `typed` \| `chip` \| `tab_complete` \| `history`, `valid`: boolean | Every submitted command; the single most important metric (which content people actually open) |
| `command_unknown` | `input` (truncated/sanitized, max ~40 chars) | Unknown command → "did you mean" path; v2 demand signal for the AI agent |
| `theme_change` | `theme`, `previous` | `theme set` succeeds |
| `boot` | `outcome`: `completed` \| `skipped` | Boot sequence ends |
| `easter_egg` | `name` (`sudo`, …) | Easter egg triggers |
| `external_link_click` | `target`: `linkedin` \| `juma` \| `aief` \| `github` \| `email` \| … | Outbound link/chip clicked |
| `notfound_view` | `path` | 404 page renders |

Rules: snake_case event names; ≤ 3 properties each; **never** log raw free-text beyond the truncated `command_unknown.input`, and strip anything email-like from it (people paste weird things into terminals).

### 7.3 Speed Insights verdict

Add it (reasoning in Section 0). Success criterion: after launch week, check Real Experience Score on mobile; if the R3F backdrop tanks INP/LCP on mid-range Android, that's the trigger for the visual-layer plan's degrade path.

---

## 8. CI guardrails — `.github/workflows/ci.yml`

One workflow, `ci`, on `pull_request` (and `push` to `main` for the badge):

```yaml
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - pnpm/action-setup + actions/setup-node@v4 (node 22, cache: pnpm)
      - pnpm install --frozen-lockfile
      - pnpm lint              # eslint
      - pnpm format:check      # prettier --check .
      - pnpm typecheck         # tsc --noEmit
```

- **No `pnpm build` in CI** — Vercel's preview deployment on every PR *is* the build check.
- Mark the `checks` job as a required status check on `main` (Section 2.1 step 4).
- Local etiquette: agents/Claude must **ask Yavor before running** `pnpm build` / `pnpm typecheck` locally; CI runs them automatically without asking, which is exactly why CI exists here.
- Lighthouse: do **not** put Lighthouse-CI in the pipeline for v1 (flaky on shared runners; DoD measures it once pre-launch). Run it manually against a preview URL during the Polish phase.

---

## 9. Font loading — JetBrains Mono

- `next/font/google` in `layout.tsx`:
  ```ts
  import { JetBrains_Mono } from "next/font/google";
  const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],           // English-only site — latin subset only
    display: "swap",
    variable: "--font-mono",
  });
  ```
  Apply `jetbrainsMono.variable` on `<html>`; Tailwind v4 maps it via `@theme { --font-family-mono: var(--font-mono), ...fallbacks }`.
- `next/font` self-hosts the files (no Google request), preloads the woff2, and generates size-adjusted fallback metrics automatically — no CLS from font swap on the boot sequence. (Note: boot-sequence plan flags font-swap CLS as the top risk — verify `adjustFontFallback` output in practice; consider `display: optional` if any shift is visible.)
- Explicitly `weight: ["400","700"]` if the variable file is heavier than needed — check the network panel once; a terminal needs at most regular + bold.
- Fallback stack: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`.
- Separate concern: the raw `.ttf` committed under `src/app/_og/` for the OG image renderer (Section 5.3) — `next/font` output isn't accessible there.

---

## 10. v2 readiness — where `/api/agent` slots in

Because we rejected static export, v2 is purely additive:

1. `src/app/api/agent/route.ts` — a Route Handler (`export async function POST`) deployed as a Vercel Function; zero changes to the static `/` page.
2. The command registry (terminal-engine plan) already exposes commands as structured definitions — the agent route imports the same registry and exposes commands as tools; the client falls back to `POST /api/agent` when input matches no command.
3. Secrets: `ANTHROPIC_API_KEY` (or AI Gateway) added in Vercel → Settings → Environment Variables (**[D]**), pulled locally with `vercel env pull` — hence the `.env.example` and `vercel link` groundwork now.
4. Streaming responses work out of the box on Vercel Functions; `export const maxDuration` on the route is the only knob to touch if needed.

Nothing else in this plan needs revisiting for v2.

---

## 11. `package.json` scripts

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",            // exists for Vercel/CI; ask Yavor before running locally
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit"       // ask Yavor before running locally; CI runs it freely
  }
}
```
Deliberately no `deploy` script — its absence is the guardrail.

---

## 12. Sequencing (this subsystem only)

1. Bootstrap scaffold + configs + deps (Section 1) → initial commit.
2. GitHub repo + push (2.1 steps 1–3).
3. Vercel import + first deploy on `*.vercel.app` (3.1–3.4) — unblocks preview URLs for every other subsystem's PRs. *Do this before the terminal engine work starts.*
4. CI workflow + branch protection with required check (Section 8, then 2.1 step 4).
5. Font wiring + metadata skeleton + robots/sitemap + Analytics/SpeedInsights components (Sections 5, 7, 9) — small PR.
6. Domain + www redirect + HTTPS verification (3.5–3.7) — can happen anytime before launch; doing it early lets OG/canonical URLs be real.
7. Polish phase: OG image route, 404 page, analytics event wiring into the terminal engine, LinkedIn/X share validation, Search Console + sitemap submission, manual Lighthouse run against a preview.

## 13. Open questions

1. **Vercel plan:** Is Yavor on Hobby or Pro? Custom analytics events (`command_run` etc.) need Pro. If Hobby: keep the `trackEvent` wrapper as a no-op/pageview-only and decide between upgrading vs. a free self-hosted alternative.
2. **Domain status:** Is `yavor.codes` already registered, and where? Determines whether step 3.5 is "switch nameservers" or "buy via Vercel/registrar first".
3. **Repo visibility:** Public (recommended, portfolio value) or private?
4. **Preview protection:** Should PR preview URLs be publicly accessible (easy sharing) or behind Vercel Authentication?
5. **OG copy:** Exact prompt/output text on the generated OG image (content plan dependency).
6. **`images.unoptimized`:** If v1 ships only a handful of local images, disabling the optimizer avoids quota noise — defer to visual-layer/content plans' asset inventory.
7. **Google Search Console ownership:** verify via Vercel DNS TXT once domain is live — personal vs team-gpt Google account?
