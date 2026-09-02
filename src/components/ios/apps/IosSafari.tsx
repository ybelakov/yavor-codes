"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import profile from "@/content/profile.json";
import juma from "@/content/juma.json";
import aief from "@/content/aief.json";
import postsData from "@/content/posts.json";
import { Glyph } from "../Glyph";

type SiteId = "juma" | "aief" | "linkedin" | "github";

const SITES: Record<SiteId, { url: string; title: string; real: string; theme: string }> = {
  juma: { url: "juma.ai", title: "Juma", real: "https://juma.ai", theme: "#6C4DF6" },
  aief: { url: "aief.europe", title: "AI Engineer Foundation", real: "https://linkedin.com/in/yavor-belakov", theme: "#101018" },
  linkedin: { url: "linkedin.com", title: "Yavor Belakov", real: "https://linkedin.com/in/yavor-belakov", theme: "#0A66C2" },
  github: { url: "github.com", title: "ybelakov", real: "https://github.com/ybelakov", theme: "#24292F" },
};

function OpenReal({ href }: { href: string }) {
  return <a className="m-open" href={href} target="_blank" rel="noopener noreferrer">Open the real site ↗</a>;
}

function JumaPage() {
  return (
    <div className="m-page">
      <nav className="m-nav"><strong>Juma</strong><span className="m-burger">☰</span></nav>
      <header className="m-hero">
        <h1>{juma.tagline}</h1>
        <p>{juma.description}</p>
        <button type="button" className="m-cta">Start free</button>
        <OpenReal href="https://juma.ai" />
      </header>
      <div className="m-stats">
        {juma.metrics.map((m) => (
          <div key={m.label}>
            <strong>
              {"prefix" in m ? ((m as { prefix?: string }).prefix ?? "") : ""}
              {m.value >= 1_000_000 ? `${m.value / 1_000_000}M` : m.value >= 1000 ? `${m.value / 1000}K` : m.value}
              {"suffix" in m ? ((m as { suffix?: string }).suffix ?? "") : ""}
            </strong>
            <span>{m.label}</span>
          </div>
        ))}
      </div>
      <p className="m-body">{juma.story}</p>
    </div>
  );
}

function AiefPage() {
  return (
    <div className="m-page m-dark">
      <header className="m-hero">
        <h1>{aief.fullName}</h1>
        <p>{aief.tagline}</p>
      </header>
      <div className="m-stats m-stats-dark">
        {aief.stats.slice(0, 3).map((s) => (
          <div key={s.label}><strong>{s.value}{s.suffix}</strong><span>{s.label}</span></div>
        ))}
      </div>
      <div className="m-gallery">
        {aief.photos.slice(0, 4).map((p) => <img key={p.src} src={p.src} alt={p.alt} loading="lazy" />)}
      </div>
      <p className="m-body">{aief.story}</p>
    </div>
  );
}

function LinkedInPage() {
  return (
    <div className="m-page m-li">
      <div className="m-li-cover" />
      <img className="m-li-avatar" src={profile.avatar} alt="" />
      <div className="m-li-head">
        <h1>{profile.name}</h1>
        <p>{profile.headline}</p>
        <small>{profile.location.primary} · 10,000+ followers</small>
        <OpenReal href="https://linkedin.com/in/yavor-belakov" />
      </div>
      {postsData.posts.slice(0, 3).map((p) => (
        <a key={p.rank} className="m-li-post" href={p.url} target="_blank" rel="noopener noreferrer">
          <p>{p.excerpt}</p>
          <span>👍 {p.stats.reactions} · {p.stats.comments} comments</span>
        </a>
      ))}
    </div>
  );
}

function GithubPage() {
  const repos = [
    { name: "yavor-codes", desc: "A Mac and an iPhone that fit in a browser tab.", lang: "TypeScript" },
    { name: "bezgradski", desc: "Carpooling app built during the Sofia transport strike. 7,000 users in 24h.", lang: "TypeScript" },
    { name: "spookify", desc: "Halloween costume generator. Went viral.", lang: "TypeScript" },
  ];
  return (
    <div className="m-page">
      <div className="m-gh-head">
        <img src={profile.avatar} alt="" />
        <div><h1>ybelakov</h1><p>{profile.headline}</p></div>
      </div>
      <OpenReal href="https://github.com/ybelakov" />
      {repos.map((r) => (
        <div key={r.name} className="m-gh-repo">
          <h3>{r.name}</h3><p>{r.desc}</p><span><i />{r.lang}</span>
        </div>
      ))}
    </div>
  );
}

const PAGES: Record<SiteId, () => React.ReactElement> = { juma: JumaPage, aief: AiefPage, linkedin: LinkedInPage, github: GithubPage };

export function IosSafari() {
  const [site, setSite] = useState<SiteId>("juma");
  const [tabsOpen, setTabsOpen] = useState(false);
  const Page = PAGES[site];

  if (tabsOpen) {
    return (
      <div className="ios-safari-tabs">
        <div className="ios-tabgrid">
          {(Object.keys(SITES) as SiteId[]).map((id) => (
            <button key={id} type="button" className={id === site ? "ios-tabcard ios-tabcard-active" : "ios-tabcard"} onClick={() => { setSite(id); setTabsOpen(false); }}>
              <span className="ios-tabcard-bar" style={{ background: SITES[id].theme }}>{SITES[id].url}</span>
              <span className="ios-tabcard-body">{SITES[id].title}</span>
            </button>
          ))}
        </div>
        <div className="ios-safari-bottom">
          <span />
          <button type="button" className="ios-safari-done" onClick={() => setTabsOpen(false)}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ios-safari">
      <div className="ios-safari-view"><Page /></div>
      <div className="ios-safari-bar">
        <span className="ios-safari-url">
          <span className="ios-safari-aa"><Glyph name="aa" /></span>
          <span className="ios-safari-host">{SITES[site].url}</span>
          <span className="ios-safari-reload">⟳</span>
        </span>
      </div>
      <div className="ios-safari-bottom">
        <button type="button" aria-label="Back" disabled><Glyph name="back" /></button>
        <button type="button" aria-label="Forward" disabled><Glyph name="chevron" /></button>
        <button type="button" aria-label="Share" onClick={() => window.open(SITES[site].real, "_blank", "noopener")}><Glyph name="share" /></button>
        <button type="button" aria-label="Bookmarks" onClick={() => setTabsOpen(true)}><Glyph name="book" /></button>
        <button type="button" aria-label="Tabs" onClick={() => setTabsOpen(true)}><Glyph name="grid" /></button>
      </div>
    </div>
  );
}
