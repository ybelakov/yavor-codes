"use client";

import juma from "@/content/juma.json";
import { ChipRow, SectionHeader, useCountUp } from "./shared";

function Metric({ label, value, prefix, suffix, note }: { label: string; value: number; prefix?: string; suffix?: string; note?: string }) {
  const v = useCountUp(value);
  const display =
    value >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
      : value >= 1_000
        ? `${Math.round(v / 1_000)}K`
        : String(v);
  return (
    <div className="metric">
      <span className="metric-value">
        {prefix ?? ""}
        {display}
        {suffix ?? ""}
      </span>
      <span className="dim-text"> {label}</span>
      {note && <span className="dim-text metric-note"> ({note})</span>}
    </div>
  );
}

export function JumaBlock() {
  return (
    <div className="block-frame">
      <h2 className="block-title">
        <span className="wordmark">▐ JUMA ▌</span> <span className="dim-text">{juma.org}</span>
      </h2>
      <p className="tagline">{juma.tagline}</p>
      <p>{juma.description}</p>
      <SectionHeader>the rename story</SectionHeader>
      <p className="dim-text">{juma.story}</p>
      <SectionHeader>numbers</SectionHeader>
      <div className="metric-grid">
        {juma.metrics.map((m) => (
          <Metric key={m.label} label={m.label} value={m.value} prefix={"prefix" in m ? (m as { prefix?: string }).prefix : undefined} suffix={"suffix" in m ? (m as { suffix?: string }).suffix : undefined} note={"note" in m ? (m as { note?: string }).note : undefined} />
        ))}
      </div>
      <p>
        <span className="status-dot" aria-hidden="true">
          ●
        </span>{" "}
        shipping —{" "}
        {juma.links.map((l, i) => (
          <span key={l.url}>
            {i > 0 && " · "}
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="link">
              {l.label}
            </a>
          </span>
        ))}
        {" · my role: "}
        <span className="accent-text">{juma.role}</span>
      </p>
      <blockquote className="pull-quote">
        &ldquo;{juma.pullQuote.text}&rdquo;{" "}
        <a href={juma.pullQuote.url} target="_blank" rel="noopener noreferrer" className="link dim-text">
          — {juma.pullQuote.source}
        </a>
      </blockquote>
      <ChipRow commands={["posts", "history", "contact"]} />
    </div>
  );
}
