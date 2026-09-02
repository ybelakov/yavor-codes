"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import profile from "@/content/profile.json";
import juma from "@/content/juma.json";
import aief from "@/content/aief.json";
import sf from "@/content/sf.json";
import timeline from "@/content/timeline.json";
import { IosNav, useIosNav, type Screen } from "../IosNav";
import { IosGroup, IosRow, IosSwitchRow } from "../IosList";
import { Glyph, type GlyphName } from "../Glyph";
import { THEMES, THEME_NAMES } from "@/lib/themes";
import { useTheme } from "@/components/providers/ThemeProvider";
import { WALLPAPERS, useWallpaper } from "@/lib/desktop/wallpaper";
import { setMuted } from "@/lib/desktop/sounds";

function AboutScreen() {
  return (
    <>
      <IosGroup>
        <IosRow label="Name" value={profile.name} />
        <IosRow label="Role" value="Head of AI" />
        <IosRow label="Company" value="Juma" />
        <IosRow label="Community" value="AIE.F Europe" />
      </IosGroup>
      <IosGroup header="Details">
        {profile.neofetch.specs.map((s) => (
          <IosRow key={s.key} label={s.key.charAt(0).toUpperCase() + s.key.slice(1)} value={s.value} />
        ))}
      </IosGroup>
      <IosGroup header="Bio" footer="Everything here is real. The iPhone is not.">
        <div className="ios-prose">{profile.bio.map((l) => <p key={l}>{l}</p>)}</div>
      </IosGroup>
    </>
  );
}

function JumaScreen() {
  return (
    <>
      <IosGroup>
        <div className="ios-hero">
          <p className="ios-hero-title">{juma.name}</p>
          <p className="ios-hero-sub">{juma.tagline}</p>
        </div>
      </IosGroup>
      <IosGroup header="Numbers">
        {juma.metrics.map((m) => (
          <IosRow
            key={m.label}
            label={m.label.charAt(0).toUpperCase() + m.label.slice(1)}
            value={`${"prefix" in m ? ((m as { prefix?: string }).prefix ?? "") : ""}${
              m.value >= 1_000_000 ? `${m.value / 1_000_000}M` : m.value >= 1000 ? `${m.value / 1000}K` : m.value
            }${"suffix" in m ? ((m as { suffix?: string }).suffix ?? "") : ""}`}
          />
        ))}
      </IosGroup>
      <IosGroup header="About">
        <div className="ios-prose"><p>{juma.description}</p><p>{juma.story}</p></div>
      </IosGroup>
      <IosGroup>
        {juma.links.map((l) => (
          <IosRow key={l.url} label={l.label} chevron onPress={() => window.open(l.url, "_blank", "noopener")} />
        ))}
      </IosGroup>
    </>
  );
}

function AiefScreen() {
  return (
    <>
      <IosGroup>
        <div className="ios-hero">
          <p className="ios-hero-title">{aief.name}</p>
          <p className="ios-hero-sub">{aief.tagline}</p>
        </div>
      </IosGroup>
      <IosGroup header="Stats">
        {aief.stats.map((s) => (
          <IosRow key={s.label} label={s.label.charAt(0).toUpperCase() + s.label.slice(1)} value={`${s.value}${s.suffix ?? ""}`} />
        ))}
      </IosGroup>
      <IosGroup header="Milestones">
        {aief.milestones.map((m) => <IosRow key={m.text} label={m.text} value={m.date} />)}
      </IosGroup>
      <IosGroup footer={aief.venues}>
        <div className="ios-prose"><p>{aief.story}</p></div>
      </IosGroup>
    </>
  );
}

function SfScreen() {
  return (
    <>
      <IosGroup><div className="ios-prose"><p>{sf.intro}</p></div></IosGroup>
      <IosGroup header="Timeline">
        {sf.entries.map((e) => <IosRow key={e.text} label={e.text} detail={e.date} />)}
      </IosGroup>
      <IosGroup><div className="ios-quote">{sf.closer}</div></IosGroup>
    </>
  );
}

function HistoryScreen() {
  return (
    <IosGroup footer={`${timeline.entries.length} events`}>
      {timeline.entries.map((e) => (
        <IosRow key={e.text} label={e.text} detail={`${e.date || "—"} · ${e.verb}`} />
      ))}
    </IosGroup>
  );
}

function WallpaperScreen() {
  const setWallpaper = useWallpaper((s) => s.setWallpaper);
  const current = useWallpaper((s) => s.wallpaper);
  return (
    <IosGroup header="Choose a New Wallpaper">
      {WALLPAPERS.map((w) => (
        <IosRow
          key={w.id}
          label={w.name}
          value={current === w.id ? "✓" : undefined}
          icon={<span className="ios-wall-swatch" style={{ background: w.css === "transparent" ? "linear-gradient(160deg,#cfe9f7,#2b9fdd 55%,#0b4f9e)" : w.css }} />}
          onPress={() => setWallpaper(w.id)}
        />
      ))}
    </IosGroup>
  );
}

function TerminalThemeScreen() {
  const { theme, setTheme } = useTheme();
  return (
    <IosGroup header="Profile" footer="Applies to the Terminal app.">
      {THEME_NAMES.map((n) => (
        <IosRow
          key={n}
          label={THEMES[n].label}
          detail={THEMES[n].tagline}
          value={theme === n ? "✓" : undefined}
          icon={<span className="ios-wall-swatch" style={{ background: THEMES[n].tokens.bg, border: `2px solid ${THEMES[n].tokens.accent}` }} />}
          onPress={() => setTheme(n)}
        />
      ))}
    </IosGroup>
  );
}

const tile = (name: GlyphName) => <Glyph name={name} />;

function SettingsRoot() {
  const nav = useIosNav();
  const [sfx, setSfx] = useState(true);
  const [airplane, setAirplane] = useState(false);

  const screen = (key: string, title: string, render: () => React.ReactNode): Screen => ({
    key, title, backLabel: "Settings", render,
  });

  return (
    <>
      <IosGroup>
        <button type="button" className="ios-account" onClick={() => nav.push(screen("about", "About", () => <AboutScreen />))}>
          <img src={profile.avatar} alt="" />
          <span className="ios-account-text">
            <strong>{profile.name}</strong>
            <small>{profile.headline}</small>
          </span>
          <Glyph name="chevron" className="ios-chevron" />
        </button>
      </IosGroup>

      <IosGroup>
        <IosSwitchRow icon={tile("wave")} tint="#FF9500" label="Airplane Mode" checked={airplane} onChange={setAirplane} />
        <IosRow icon={tile("wave")} tint="#007AFF" label="Wi-Fi" value={airplane ? "Off" : "Work&Share 5G"} chevron onPress={() => {}} />
        <IosRow icon={tile("bell")} tint="#FF3B30" label="Notifications" value="After Hours #51" chevron onPress={() => {}} />
      </IosGroup>

      <IosGroup header="Yavor">
        <IosRow icon={tile("sparkle")} tint="#6C4DF6" label="Juma" detail="AI workspace for marketers" chevron onPress={() => nav.push(screen("juma", "Juma", () => <JumaScreen />))} />
        <IosRow icon={tile("person")} tint="#34C759" label="AIE.F Europe" detail="50+ events in Sofia" chevron onPress={() => nav.push(screen("aief", "AIE.F Europe", () => <AiefScreen />))} />
        <IosRow icon={tile("globe")} tint="#0A84FF" label="San Francisco" detail="Sofia ⇄ SF" chevron onPress={() => nav.push(screen("sf", "San Francisco", () => <SfScreen />))} />
        <IosRow icon={tile("clock")} tint="#8E8E93" label="History" detail="How it happened" chevron onPress={() => nav.push(screen("history", "History", () => <HistoryScreen />))} />
      </IosGroup>

      <IosGroup header="Display">
        <IosRow icon={tile("photos")} tint="#5AC8FA" label="Wallpaper" chevron onPress={() => nav.push(screen("wall", "Wallpaper", () => <WallpaperScreen />))} />
        <IosRow icon={tile("terminal")} tint="#1C1C1E" label="Terminal Profile" chevron onPress={() => nav.push(screen("term", "Terminal", () => <TerminalThemeScreen />))} />
        <IosSwitchRow icon={tile("moon")} tint="#5856D6" label="Sound Effects" checked={sfx} onChange={(v) => { setSfx(v); setMuted(!v); }} />
      </IosGroup>

      <IosGroup header="Contact" footer="LinkedIn is the fastest reply — I live there.">
        <IosRow icon={tile("mail")} tint="#007AFF" label="Email" value={profile.contact.email} onPress={() => { window.location.href = `mailto:${profile.contact.email}`; }} />
        <IosRow icon={tile("person")} tint="#0A66C2" label="LinkedIn" chevron onPress={() => window.open("https://linkedin.com/in/yavor-belakov", "_blank", "noopener")} />
        <IosRow icon={tile("book")} tint="#24292F" label="GitHub" chevron onPress={() => window.open("https://github.com/ybelakov", "_blank", "noopener")} />
      </IosGroup>
    </>
  );
}

export function IosSettings() {
  return <IosNav root={{ key: "settings", title: "Settings", searchable: true, render: () => <SettingsRoot /> }} />;
}
