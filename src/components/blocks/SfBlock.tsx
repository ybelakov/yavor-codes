"use client";

import sf from "@/content/sf.json";
import { ChipRow } from "./shared";

const BRIDGE = String.raw`
      ~  ~   🌁   ~   ~
   |     |         |     |
═══╪═════╪═════════╪═════╪═══
    \   /|\       /|\   /
     \ / | \     / | \ /`;

export function SfBlock() {
  return (
    <div className="block-frame">
      <pre className="ascii-art" aria-hidden="true">
        {BRIDGE}
      </pre>
      <h2 className="block-title">{sf.title}</h2>
      <p>{sf.intro}</p>
      <ul className="log-list">
        {sf.entries.map((e) => (
          <li key={e.text}>
            <span className="dim-text">{e.date}</span> {e.text}
          </li>
        ))}
      </ul>
      <p className="accent-text">&ldquo;{sf.closer}&rdquo;</p>
      <ChipRow commands={["history", "juma", "whoami"]} />
    </div>
  );
}
