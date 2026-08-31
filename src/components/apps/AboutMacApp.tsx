"use client";

/* eslint-disable @next/next/no-img-element */
import profile from "@/content/profile.json";

function uptime(): string {
  const birth = new Date(`${profile.neofetch.birthYearMonth}-15T00:00:00`);
  const years = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
  return `${years} years`;
}

export function AboutMacApp() {
  return (
    <div className="about-mac">
      <img className="about-avatar" src={profile.avatar} alt={profile.name} />
      <h2>{profile.name}</h2>
      <p className="about-sub">{profile.headline}</p>
      <dl className="about-specs">
        {profile.neofetch.specs.slice(0, 6).map((s) => (
          <div key={s.key}>
            <dt>{s.key}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
        <div>
          <dt>uptime</dt>
          <dd>{uptime()}</dd>
        </div>
      </dl>
      <div className="about-actions">
        <a href="https://linkedin.com/in/yavor-belakov" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
      </div>
    </div>
  );
}
