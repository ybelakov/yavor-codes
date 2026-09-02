"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import { useDesktop } from "@/lib/desktop/store";
import aief from "@/content/aief.json";
import profile from "@/content/profile.json";
import sf from "@/content/sf.json";

function body(name: string, kind: string): React.ReactNode {
  if (kind.includes("image") || /\.(png|jpg|jpeg)$/i.test(name)) {
    const photo = aief.photos[2] ?? aief.photos[0]!;
    return <img className="ql-image" src={photo.src} alt={name} />;
  }
  if (/san-francisco/i.test(name)) {
    return (
      <pre className="ql-text">
        {[`# ${sf.title}`, "", sf.intro, "", ...sf.entries.map((e) => `- ${e.date} — ${e.text}`), "", `> ${sf.closer}`].join("\n")}
      </pre>
    );
  }
  if (kind.includes("PDF")) {
    return (
      <div className="ql-pdf">
        <div className="ql-page">
          <h3>{name.replace(/\.pdf$/, "")}</h3>
          <p>{profile.name} — {profile.headline}</p>
          <hr />
          {profile.bio.map((l) => <p key={l}>{l}</p>)}
          <p className="ql-page-num">1 of 1</p>
        </div>
      </div>
    );
  }
  if (kind.includes("Text") || kind.includes("JSON") || /\.(txt|md|json)$/i.test(name)) {
    return (
      <pre className="ql-text">
        {[profile.name, profile.headline, "", ...profile.bio, "", `Reach me: ${profile.contact.email}`].join("\n")}
      </pre>
    );
  }
  return <p className="ql-none">No preview available</p>;
}

export function QuickLook() {
  const ql = useDesktop((s) => s.quickLook);
  const setQuickLook = useDesktop((s) => s.setQuickLook);

  useEffect(() => {
    if (!ql) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        setQuickLook(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ql, setQuickLook]);

  if (!ql) return null;

  return (
    <div className="ql-scrim" onPointerDown={() => setQuickLook(null)}>
      <div className="ql-panel" role="dialog" aria-label={`Preview of ${ql.name}`} onPointerDown={(e) => e.stopPropagation()}>
        <header className="ql-titlebar">
          <button type="button" className="traffic-light tl-close" onClick={() => setQuickLook(null)} aria-label="Close preview">
            <svg viewBox="0 0 12 12"><path d="M4 4l4 4M8 4l-4 4" stroke="#7a0f0a" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          <span className="ql-title">{ql.name}</span>
        </header>
        <div className="ql-body">{body(ql.name, ql.kind)}</div>
        <footer className="ql-foot">{ql.kind}{ql.size && ql.size !== "--" ? ` — ${ql.size}` : ""} · {ql.modified}</footer>
      </div>
    </div>
  );
}
