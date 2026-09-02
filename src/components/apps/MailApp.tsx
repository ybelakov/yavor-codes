"use client";

import { useState } from "react";
import profile from "@/content/profile.json";
import { trackEvent } from "@/lib/analytics";
import { TrafficLights, useWindowControls } from "@/components/desktop/Window";

export function MailApp() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    trackEvent("external_link_click", { target: "mailto" });
    const href = `mailto:${profile.contact.email}?subject=${encodeURIComponent(
      subject || "Hi Yavor",
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const controls = useWindowControls();

  return (
    <div className="mail unified">
      <div className="mail-toolbar" onPointerDown={(e) => controls?.startDrag(e)}>
        <TrafficLights />
        <button type="button" className="mail-send" onClick={send} aria-label="Send">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.6 7.9L14.4 2 8.8 14.4 7.4 9.1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        </button>
        <span className="mail-tool" aria-hidden="true">🖇</span>
        <span className="mail-tool" aria-hidden="true">Aa</span>
        <span className="mail-toolbar-title">New Message</span>
      </div>
      <div className="mail-fields">
        <label className="mail-field">
          <span>To:</span>
          <input readOnly value={profile.contact.email} />
        </label>
        <label className="mail-field">
          <span>Subject:</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Speaking at AIE.F / trying Juma / just saying hi"
          />
        </label>
      </div>
      <textarea
        className="mail-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Hi Yavor,\n\n`}
      />
      <div className="mail-status">
        {sent
          ? "Handing off to your mail app…"
          : profile.contact.fastest}
      </div>
    </div>
  );
}
