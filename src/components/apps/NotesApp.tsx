"use client";

import { useState } from "react";
import { TrafficLights, useWindowControls } from "@/components/desktop/Window";
import profile from "@/content/profile.json";
import sf from "@/content/sf.json";
import juma from "@/content/juma.json";
import aief from "@/content/aief.json";

const NOTES = {
  about: {
    title: "read-me-first.txt",
    date: "Edited today",
    body: [
      profile.name,
      profile.headline,
      "",
      ...profile.bio,
      "",
      "Sofia, Bulgaria — and San Francisco when it matters.",
      "",
      "Reach me: " + profile.contact.email,
      "LinkedIn is faster: linkedin.com/in/yavor-belakov",
    ].join("\n"),
  },
  sf: {
    title: "san-francisco.md",
    date: "Edited Dec 2025",
    body: [
      "# " + sf.title,
      "",
      sf.intro,
      "",
      ...sf.entries.map((e) => `- **${e.date}** — ${e.text}`),
      "",
      "> " + sf.closer,
    ].join("\n"),
  },
  now: {
    title: "now.md",
    date: "Edited today",
    body: [
      "# What I'm doing now",
      "",
      `**${juma.name}** — ${juma.tagline}`,
      juma.description,
      "",
      `**${aief.name}** — ${aief.tagline}`,
      `${aief.stats[0]?.value}${aief.stats[0]?.suffix ?? ""} events run, ${aief.stats[1]?.value}${aief.stats[1]?.suffix ?? ""} members, 49 more planned for 2026.`,
      "",
      "Building with Cursor and Claude Code on an M4 Max.",
      "Still play table tennis. Still lose sleep over launches.",
    ].join("\n"),
  },
} as const;

type NoteId = keyof typeof NOTES;

export function NotesApp({ note }: { note?: string }) {
  const initial = (note && note in NOTES ? note : "about") as NoteId;
  const [current, setCurrent] = useState<NoteId>(initial);
  const active = NOTES[current];

  const controls = useWindowControls();

  return (
    <div className="notes unified">
      <aside className="notes-folders unified-sidebar">
        <div className="unified-sidebar-top" onPointerDown={(e) => controls?.startDrag(e)}>
          <TrafficLights />
        </div>
        <p className="finder-side-label">iCloud</p>
        <button type="button" className="finder-side-item finder-side-active">📁 Notes</button>
        <button type="button" className="finder-side-item">📁 Drafts</button>
      </aside>
      <aside className="notes-list">
        <div className="notes-list-toolbar" onPointerDown={(e) => controls?.startDrag(e)}>
          <span className="notes-tool" aria-hidden="true">☰</span>
          <span className="notes-tool" aria-hidden="true">✎</span>
        </div>
        {(Object.keys(NOTES) as NoteId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`notes-list-item ${id === current ? "notes-list-active" : ""}`}
            onClick={() => setCurrent(id)}
          >
            <strong>{NOTES[id].title}</strong>
            <span>{NOTES[id].date}</span>
            <em>{NOTES[id].body.split("\n").find((l) => l && !l.startsWith("#"))?.slice(0, 42)}…</em>
          </button>
        ))}
      </aside>
      <article className="notes-body">
        <div className="notes-toolbar" onPointerDown={(e) => controls?.startDrag(e)}>
          <span className="notes-tool" aria-hidden="true">Aa</span>
          <span className="notes-tool" aria-hidden="true">☑</span>
          <span className="notes-tool" aria-hidden="true">⌗</span>
          <span className="notes-tool notes-tool-right" aria-hidden="true">⇪</span>
        </div>
        <p className="notes-date">{active.date}</p>
        <pre className="notes-text">{active.body}</pre>
      </article>
    </div>
  );
}
