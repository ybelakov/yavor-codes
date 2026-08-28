"use client";

/* eslint-disable @next/next/no-img-element */
import aief from "@/content/aief.json";
import { runCommand } from "@/lib/terminal/run";
import { ChipRow, SectionHeader, useCountUp } from "./shared";

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const v = useCountUp(value);
  return (
    <div className="metric">
      <span className="metric-value">
        {v}
        {suffix ?? ""}
      </span>
      <span className="dim-text"> {label}</span>
    </div>
  );
}

export function AiefBlock() {
  return (
    <div className="block-frame">
      <h2 className="block-title">
        {aief.name} <span className="dim-text">— {aief.fullName}</span>
      </h2>
      <p className="tagline">{aief.tagline}</p>
      <p>{aief.story}</p>
      <div className="photo-strip" data-no-focus>
        {aief.photos.map((p) => (
          <figure key={p.src} className="photo-card">
            <img src={p.src} alt={p.alt} loading="lazy" />
            <figcaption className="dim-text">{p.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="metric-grid">
        {aief.stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} suffix={s.suffix} />
        ))}
      </div>
      <SectionHeader>milestones</SectionHeader>
      <ul className="log-list">
        {aief.milestones.map((m) => (
          <li key={m.text}>
            <span className="dim-text">{m.date}</span> {m.text}
          </li>
        ))}
      </ul>
      <p className="dim-text">home turf: {aief.venues}</p>
      <p>
        <button type="button" className="cmd-link" onClick={() => runCommand("contact", "chip")}>
          {aief.speakerCta}
        </button>
      </p>
      <ChipRow commands={["contact", "posts", "sf"]} />
    </div>
  );
}
