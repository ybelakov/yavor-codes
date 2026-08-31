"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import profile from "@/content/profile.json";
import juma from "@/content/juma.json";
import aief from "@/content/aief.json";
import postsData from "@/content/posts.json";
import { trackEvent } from "@/lib/analytics";

type SiteId = "juma" | "aief" | "linkedin" | "github";

const SITES: Record<SiteId, { url: string; title: string; real: string }> = {
  juma: { url: "juma.ai", title: "Juma — AI workspace for marketers", real: "https://juma.ai" },
  aief: { url: "aief.europe", title: "AI Engineer Foundation Europe", real: "https://linkedin.com/in/yavor-belakov" },
  linkedin: { url: "linkedin.com/in/yavor-belakov", title: "Yavor Belakov | LinkedIn", real: "https://linkedin.com/in/yavor-belakov" },
  github: { url: "github.com/ybelakov", title: "ybelakov · GitHub", real: "https://github.com/ybelakov" },
};

function OpenReal({ href }: { href: string }) {
  return (
    <a
      className="chrome-open-real"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("external_link_click", { target: href })}
    >
      Open the real site ↗
    </a>
  );
}

function JumaPage() {
  return (
    <div className="page page-juma">
      <nav className="page-nav">
        <strong>Juma</strong>
        <span>Product</span><span>Pricing</span><span>Customers</span>
        <button type="button" className="page-cta">Start free</button>
      </nav>
      <header className="page-hero">
        <h1>{juma.tagline}</h1>
        <p>{juma.description}</p>
        <div className="page-hero-actions">
          <button type="button" className="page-cta">Start free</button>
          <OpenReal href="https://juma.ai" />
        </div>
      </header>
      <section className="page-stats">
        {juma.metrics.map((m) => (
          <div key={m.label}>
            <strong>
              {"prefix" in m ? (m as { prefix?: string }).prefix : ""}
              {m.value >= 1_000_000 ? `${m.value / 1_000_000}M` : m.value >= 1000 ? `${m.value / 1000}K` : m.value}
              {"suffix" in m ? (m as { suffix?: string }).suffix : ""}
            </strong>
            <span>{m.label}</span>
          </div>
        ))}
      </section>
      <footer className="page-foot">{juma.story}</footer>
    </div>
  );
}

function AiefPage() {
  return (
    <div className="page page-aief">
      <header className="page-hero page-hero-dark">
        <h1>{aief.fullName}</h1>
        <p>{aief.tagline}</p>
      </header>
      <section className="page-stats page-stats-dark">
        {aief.stats.map((s) => (
          <div key={s.label}>
            <strong>{s.value}{s.suffix}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>
      <div className="page-gallery">
        {aief.photos.slice(0, 4).map((p) => (
          <img key={p.src} src={p.src} alt={p.alt} loading="lazy" />
        ))}
      </div>
      <p className="page-body">{aief.story}</p>
    </div>
  );
}

function LinkedInPage() {
  return (
    <div className="page page-linkedin">
      <div className="li-cover" />
      <div className="li-head">
        <img className="li-avatar" src={profile.avatar} alt={profile.name} />
        <h1>{profile.name}</h1>
        <p className="li-headline">{profile.headline}</p>
        <p className="li-meta">{profile.location.primary} · 10,000+ followers</p>
        <OpenReal href="https://linkedin.com/in/yavor-belakov" />
      </div>
      <h2 className="li-section">Activity</h2>
      {postsData.posts.slice(0, 4).map((p) => (
        <a key={p.rank} className="li-post" href={p.url} target="_blank" rel="noopener noreferrer">
          <p>{p.excerpt}</p>
          <span className="li-stats">👍 {p.stats.reactions} · {p.stats.comments} comments</span>
        </a>
      ))}
    </div>
  );
}

function GithubPage() {
  const repos = [
    { name: "yavor-codes", desc: "A terminal where stdout is React — this desktop, actually.", lang: "TypeScript" },
    { name: "bezgradski", desc: "Carpooling app built during the Sofia transport strike. 7,000 users in 24h.", lang: "TypeScript" },
    { name: "spookify", desc: "Halloween costume generator. Went viral.", lang: "TypeScript" },
  ];
  return (
    <div className="page page-github">
      <div className="gh-head">
        <img className="gh-avatar" src={profile.avatar} alt="ybelakov" />
        <div>
          <h1>ybelakov</h1>
          <p className="gh-bio">{profile.headline}</p>
          <OpenReal href="https://github.com/ybelakov" />
        </div>
      </div>
      {repos.map((r) => (
        <div key={r.name} className="gh-repo">
          <h3>{r.name}</h3>
          <p>{r.desc}</p>
          <span className="gh-lang"><i /> {r.lang}</span>
        </div>
      ))}
    </div>
  );
}

const PAGES: Record<SiteId, () => React.ReactElement> = {
  juma: JumaPage,
  aief: AiefPage,
  linkedin: LinkedInPage,
  github: GithubPage,
};

export function ChromeApp({ site }: { site?: string }) {
  const initial = (site && site in SITES ? site : "juma") as SiteId;
  const [current, setCurrent] = useState<SiteId>(initial);
  const [tabs, setTabs] = useState<SiteId[]>([initial]);
  const Page = PAGES[current];

  const openTab = (id: SiteId) => {
    setTabs((t) => (t.includes(id) ? t : [...t, id]));
    setCurrent(id);
  };

  return (
    <div className="chrome-app">
      <div className="chrome-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            className={`chrome-tab ${t === current ? "chrome-tab-active" : ""}`}
            onClick={() => setCurrent(t)}
          >
            <span className="chrome-favicon" />
            <span className="chrome-tab-title">{SITES[t].title}</span>
            {tabs.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Close tab"
                className="chrome-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  const rest = tabs.filter((x) => x !== t);
                  setTabs(rest);
                  if (current === t && rest[0]) setCurrent(rest[0]);
                }}
                onKeyDown={(e) => e.key === "Enter" && e.stopPropagation()}
              >
                ×
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="chrome-toolbar">
        <span className="chrome-nav-btns">
          <span className="chrome-nav-btn">‹</span>
          <span className="chrome-nav-btn">›</span>
          <span className="chrome-nav-btn">⟳</span>
        </span>
        <span className="chrome-omnibox">
          <span className="chrome-lock">🔒</span> {SITES[current].url}
        </span>
      </div>
      <div className="chrome-bookmarks">
        {(Object.keys(SITES) as SiteId[]).map((id) => (
          <button key={id} type="button" className="chrome-bookmark" onClick={() => openTab(id)}>
            <span className="chrome-favicon" /> {SITES[id].url.split("/")[0]}
          </button>
        ))}
      </div>
      <div className="chrome-viewport">
        <Page />
      </div>
    </div>
  );
}
