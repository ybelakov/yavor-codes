# yavor.codes — Definition of Done (v1 launch)

## Functional
- [ ] Boot sequence plays on first load, is skippable (key press / tap), and never plays longer than ~2.5s
- [ ] All v1 commands work: `help`, `whoami`, `juma`, `aief`, `sf`, `posts`, `history`, `neofetch`, `contact`, `theme`, `clear`
- [ ] Unknown input gets a friendly "did you mean …" response, never a dead end
- [ ] Every rendered block ends with clickable next-command chips; the whole site is traversable with zero typing
- [ ] Arrow-key history and tab-completion work
- [ ] At least 3 easter eggs shipped
- [ ] `theme list` / `theme set <name>` works; ≥3 complete themes; choice persists across visits (localStorage, safe-guarded)

## Content
- [ ] All copy is real (no lorem), reviewed by Yavor
- [ ] Juma, AIE.F, and SF blocks each have at least one visual asset
- [ ] `posts` shows real top LinkedIn posts from the archive with engagement stats
- [ ] All external links verified

## Quality
- [ ] Mobile (≤390px) fully usable: chips reachable, keyboard not forced open, no horizontal scroll
- [ ] Works in Chrome, Safari, Firefox, iOS Safari
- [ ] `prefers-reduced-motion` respected: boot and shader effects degrade gracefully
- [ ] Keyboard-only navigation possible; focus visible; blocks announced to screen readers
- [ ] Lighthouse (mobile): Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95
- [ ] No console errors; shader backdrop degrades or disables on low-power devices
- [ ] Interaction to first rendered command output < 100ms

## Launch
- [ ] Deployed via git integration to Yavor's Vercel project; `yavor.codes` domain live with HTTPS
- [ ] OG image + meta tags render correctly when shared on LinkedIn/X
- [ ] Analytics wired (Vercel Analytics) incl. which commands are run
- [ ] Custom 404 in terminal style (`command not found: /that-page`)
- [ ] README with run/deploy instructions

## Explicitly out of scope for v1
- AI agent free-text fallback (v2) — but command registry must be structured so an agent can call commands as tools
- Blog/CMS, Bulgarian localization
