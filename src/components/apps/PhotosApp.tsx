"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import aief from "@/content/aief.json";

export function PhotosApp() {
  const [open, setOpen] = useState<number | null>(null);
  const photos = aief.photos;

  return (
    <div className="photos">
      <div className="photos-header">
        <h2>AIE.F Europe</h2>
        <p>{photos.length} photos · Sofia</p>
      </div>
      <div className="photos-grid">
        {photos.map((p, i) => (
          <button key={p.src} type="button" className="photos-cell" onClick={() => setOpen(i)}>
            <img src={p.src} alt={p.alt} loading="lazy" />
            <span className="photos-caption">{p.caption}</span>
          </button>
        ))}
      </div>
      {open !== null && photos[open] && (
        <div className="photos-lightbox" role="dialog" aria-label={photos[open].alt}>
          <button type="button" className="photos-close" onClick={() => setOpen(null)} aria-label="Close">×</button>
          <button
            type="button"
            className="photos-arrow photos-prev"
            onClick={() => setOpen((o) => ((o ?? 0) - 1 + photos.length) % photos.length)}
            aria-label="Previous"
          >‹</button>
          <figure>
            <img src={photos[open].src} alt={photos[open].alt} />
            <figcaption>{photos[open].caption}</figcaption>
          </figure>
          <button
            type="button"
            className="photos-arrow photos-next"
            onClick={() => setOpen((o) => ((o ?? 0) + 1) % photos.length)}
            aria-label="Next"
          >›</button>
        </div>
      )}
    </div>
  );
}
