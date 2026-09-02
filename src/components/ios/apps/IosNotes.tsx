"use client";

import profile from "@/content/profile.json";
import sf from "@/content/sf.json";
import juma from "@/content/juma.json";
import aief from "@/content/aief.json";
import { IosNav, useIosNav, type Screen } from "../IosNav";
import { IosGroup, IosRow } from "../IosList";
import { Glyph } from "../Glyph";

interface Note {
  id: string;
  title: string;
  date: string;
  preview: string;
  body: { h?: string; p?: string; quote?: string; bullet?: string }[];
}

const NOTES: Note[] = [
  {
    id: "about",
    title: "read me first",
    date: "Today",
    preview: profile.bio[0] ?? "",
    body: [
      { h: profile.name },
      { p: profile.headline },
      ...profile.bio.map((p) => ({ p })),
      { p: `${profile.location.primary} — and ${profile.location.secondary}.` },
      { quote: `Reach me: ${profile.contact.email}` },
    ],
  },
  {
    id: "sf",
    title: "san francisco",
    date: "3 Dec 2025",
    preview: sf.intro,
    body: [
      { h: sf.title },
      { p: sf.intro },
      ...sf.entries.map((e) => ({ bullet: `${e.date} — ${e.text}` })),
      { quote: sf.closer },
    ],
  },
  {
    id: "now",
    title: "what I'm doing now",
    date: "Today",
    preview: juma.tagline,
    body: [
      { h: "Now" },
      { p: `${juma.name} — ${juma.tagline}` },
      { p: juma.description },
      { p: `${aief.name} — ${aief.tagline}` },
      { p: `${aief.stats[0]?.value}${aief.stats[0]?.suffix ?? ""} events, ${aief.stats[1]?.value}${aief.stats[1]?.suffix ?? ""} members, 49 more planned for 2026.` },
      { p: "Building with Cursor and Claude Code on an M4 Max. Still play table tennis." },
    ],
  },
  {
    id: "sofia",
    title: "why sofia",
    date: "24 Sep 2025",
    preview: "Everyone asks why I didn't move.",
    body: [
      { h: "Why Sofia" },
      { p: "Everyone asks why I didn't move to SF permanently." },
      { p: "Because the community here is mine to build. Fifty events in, After Hours is an institution — and it only exists because someone kept showing up when nobody came." },
      { p: "SF is a mindset. You can carry it home." },
    ],
  },
];

function NoteBody({ note }: { note: Note }) {
  return (
    <div className="ios-note-body">
      <p className="ios-note-date">{note.date}</p>
      {note.body.map((b, i) => {
        if (b.h) return <h2 key={i} className="ios-note-h">{b.h}</h2>;
        if (b.quote) return <p key={i} className="ios-note-quote">{b.quote}</p>;
        if (b.bullet) return <p key={i} className="ios-note-bullet"><span>•</span>{b.bullet}</p>;
        return <p key={i} className="ios-note-p">{b.p}</p>;
      })}
    </div>
  );
}

function NotesList() {
  const nav = useIosNav();
  return (
    <IosGroup footer={`${NOTES.length} Notes`}>
      {NOTES.map((n) => (
        <button
          key={n.id}
          type="button"
          className="ios-note-row"
          onClick={() =>
            nav.push({
              key: n.id,
              title: n.title,
              backLabel: "Notes",
              largeTitle: false,
              render: () => <NoteBody note={n} />,
              action: { glyph: <Glyph name="share" />, onPress: () => {} },
            } as Screen)
          }
        >
          <span className="ios-note-title">{n.title}</span>
          <span className="ios-note-meta">
            <span className="ios-note-when">{n.date}</span>
            <span className="ios-note-preview">{n.preview}</span>
          </span>
        </button>
      ))}
    </IosGroup>
  );
}

function FoldersRoot() {
  const nav = useIosNav();
  return (
    <IosGroup header="iCloud">
      <IosRow
        icon={<Glyph name="folder" />}
        tint="#FFCC00"
        label="Notes"
        value={String(NOTES.length)}
        chevron
        onPress={() => nav.push({ key: "notes", title: "Notes", backLabel: "Folders", searchable: true, render: () => <NotesList /> })}
      />
      <IosRow icon={<Glyph name="trash" />} tint="#8E8E93" label="Recently Deleted" value="3" chevron onPress={() => {}} />
    </IosGroup>
  );
}

export function IosNotes() {
  return <IosNav root={{ key: "folders", title: "Folders", render: () => <FoldersRoot /> }} tint="#E8A800" />;
}
