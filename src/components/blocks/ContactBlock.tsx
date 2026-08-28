"use client";

import { useState } from "react";
import profile from "@/content/profile.json";
import { trackEvent } from "@/lib/analytics";
import { ChipRow } from "./shared";

export function ContactBlock() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="block-frame">
      <h2 className="block-title">Pick your protocol:</h2>
      <ul className="social-list contact-list">
        <li>
          <span className="social-label">✉ email</span>{" "}
          <a href={`mailto:${profile.contact.email}`} className="link">
            {profile.contact.email}
          </a>{" "}
          <button type="button" className="cmd-link copy-btn" onClick={copy}>
            [{copied ? "copied ✓" : "copy"}]
          </button>
        </li>
        <li>
          <span className="social-label">in linkedin</span>{" "}
          <a
            href="https://linkedin.com/in/yavor-belakov"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
            onClick={() => trackEvent("external_link_click", { target: "linkedin" })}
          >
            /in/yavor-belakov
          </a>{" "}
          <span className="dim-text">({profile.contact.fastest})</span>
        </li>
        <li>
          <span className="social-label">gh github</span>{" "}
          <a
            href="https://github.com/ybelakov"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
            onClick={() => trackEvent("external_link_click", { target: "github" })}
          >
            github.com/ybelakov
          </a>
        </li>
      </ul>
      <p className="dim-text">{profile.contact.note}</p>
      <ChipRow commands={["whoami", "aief", "help"]} />
    </div>
  );
}
