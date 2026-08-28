"use client";

/* eslint-disable @next/next/no-img-element */
import profile from "@/content/profile.json";
import { ChipRow } from "./shared";

export function WhoamiBlock() {
  return (
    <div className="block-frame">
      <h2 className="sr-only">About Yavor</h2>
      <div className="whoami-top">
        <img src={profile.avatar} alt="Yavor Belakov" className="avatar" width={96} height={96} />
        <div>
          <p className="whoami-name">{profile.name}</p>
          <p className="whoami-headline">{profile.headline}</p>
          <p className="dim-text">
            {profile.location.primary} · {profile.location.secondary}
          </p>
        </div>
      </div>
      <blockquote className="whoami-bio">
        {profile.bio.map((line) => (
          <p key={line}>
            <span className="dim-text">&gt;</span> {line}
          </p>
        ))}
      </blockquote>
      <ul className="social-list">
        {profile.socials.map((s) => (
          <li key={s.id}>
            <span className="social-label">{s.label}</span>{" "}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="link">
              {s.display}
            </a>
          </li>
        ))}
      </ul>
      <ChipRow commands={["juma", "aief", "history"]} />
    </div>
  );
}
