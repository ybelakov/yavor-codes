"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import aief from "@/content/aief.json";
import { IosTabBar } from "../IosTabBar";
import { Glyph } from "../Glyph";

const PHOTOS = aief.photos;

function Viewer({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (d: number) => void }) {
  const p = PHOTOS[index]!;
  return (
    <div className="ios-viewer">
      <header className="ios-viewer-bar">
        <button type="button" onClick={onClose} aria-label="Back"><Glyph name="back" /></button>
        <span>{index + 1} of {PHOTOS.length}</span>
        <button type="button" aria-label="Share"><Glyph name="share" /></button>
      </header>
      <div
        className="ios-viewer-stage"
        onPointerDown={(e) => {
          const x0 = e.clientX;
          const up = (ev: PointerEvent) => {
            const dx = ev.clientX - x0;
            if (dx < -40) onMove(1);
            else if (dx > 40) onMove(-1);
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointerup", up);
        }}
      >
        <img src={p.src} alt={p.alt} />
      </div>
      <footer className="ios-viewer-foot">
        <p className="ios-viewer-caption">{p.caption}</p>
        <div className="ios-viewer-actions">
          <button type="button" aria-label="Share"><Glyph name="share" /></button>
          <button type="button" aria-label="Favorite"><Glyph name="heart" /></button>
          <button type="button" aria-label="Info"><Glyph name="info" /></button>
          <button type="button" aria-label="Delete"><Glyph name="trash" /></button>
        </div>
      </footer>
    </div>
  );
}

export function IosPhotos() {
  const [tab, setTab] = useState("library");
  const [open, setOpen] = useState<number | null>(null);

  if (open !== null) {
    return (
      <Viewer
        index={open}
        onClose={() => setOpen(null)}
        onMove={(d) => setOpen((i) => ((i ?? 0) + d + PHOTOS.length) % PHOTOS.length)}
      />
    );
  }

  return (
    <div className="ios-photos">
      <div className="ios-photos-scroll">
        {tab === "library" ? (
          <>
            <h1 className="ios-large-title ios-photos-title">Library</h1>
            <p className="ios-photos-sub">AIE.F Europe · Sofia · {PHOTOS.length} photos</p>
            <div className="ios-photo-grid">
              {PHOTOS.map((p, i) => (
                <button key={p.src} type="button" onClick={() => setOpen(i)} aria-label={p.alt}>
                  <img src={p.src} alt={p.alt} loading="lazy" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="ios-large-title ios-photos-title">Albums</h1>
            <div className="ios-album-grid">
              <button type="button" onClick={() => { setTab("library"); }}>
                <img src={PHOTOS[0]!.src} alt="" />
                <span>AIE.F Events</span>
                <small>{PHOTOS.length}</small>
              </button>
              <button type="button" onClick={() => { setTab("library"); }}>
                <img src={PHOTOS[3]!.src} alt="" />
                <span>Sofia</span>
                <small>{PHOTOS.length}</small>
              </button>
            </div>
          </>
        )}
      </div>
      <IosTabBar
        dark
        active={tab}
        onSelect={setTab}
        tabs={[
          { id: "library", label: "Library", glyph: <Glyph name="photos" /> },
          { id: "albums", label: "Albums", glyph: <Glyph name="albums" /> },
        ]}
      />
    </div>
  );
}
